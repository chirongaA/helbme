from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
import pytesseract
import shutil
import os
import re
import time

def _configure_tesseract():
    """Configure tesseract binary path"""
    current = getattr(pytesseract.pytesseract, 'tesseract_cmd', None)
    if current and os.path.exists(current):
        return

    # Look for tesseract on PATH
    t_path = shutil.which('tesseract')
    if t_path:
        pytesseract.pytesseract.tesseract_cmd = t_path
        return

    # Common install locations
    probable_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        '/usr/bin/tesseract',
        '/usr/local/bin/tesseract'
    ]
    for p in probable_paths:
        if os.path.exists(p):
            pytesseract.pytesseract.tesseract_cmd = p
            return

    # Allow user-defined env var
    env_path = os.environ.get('TESSERACT_CMD')
    if env_path and os.path.exists(env_path):
        pytesseract.pytesseract.tesseract_cmd = env_path
        return

    raise RuntimeError(
        "tesseract is not installed or it's not in your PATH. "
        "Install Tesseract OCR (https://github.com/tesseract-ocr/tesseract) "
        "and ensure the tesseract executable is on your PATH, or set the "
        "environment variable TESSERACT_CMD to the full path of tesseract.exe."
    )


def preprocess_image(image_path):
    """Preprocess image for better OCR accuracy - optimized for message screenshots"""
    img = Image.open(image_path)
    
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Get image dimensions
    width, height = img.size
    
    # For message screenshots, crop to the top portion where sender ID appears
    # Focus on top 120 pixels (or 10% of height, whichever is larger)
    crop_height = max(120, int(height * 0.10))
    
    # Also crop from the left side to avoid back button and other UI elements
    # Start from 15% of width to skip the back arrow
    left_margin = int(width * 0.15)
    right_boundary = int(width * 0.60)  # Only take left portion of header
    
    img = img.crop((left_margin, 0, right_boundary, crop_height))
    
    # Resize for better OCR (aim for width of 1000-1500px)
    width, height = img.size
    if width < 800:
        scale_factor = 1200 / width
        new_size = (int(width * scale_factor), int(height * scale_factor))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # Convert to grayscale
    img = img.convert('L')
    
    # Invert if background is dark (common in message apps)
    # Check average brightness
    img_array = list(img.getdata())
    avg_brightness = sum(img_array) / len(img_array)
    if avg_brightness < 127:  # Dark background
        img = ImageOps.invert(img)
    
    # Apply adaptive thresholding
    img = ImageOps.autocontrast(img, cutoff=5)
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.5)
    
    # Enhance sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.0)
    
    # Reduce noise
    img = img.filter(ImageFilter.MedianFilter(size=3))
    
    # Optional: Save preprocessed image for debugging
    debug_path = image_path.replace('.jpg', '_preprocessed.jpg').replace('.png', '_preprocessed.png').replace('.jpeg', '_preprocessed.jpeg')
    img.save(debug_path)
    print(f"[DEBUG] Preprocessed image saved to: {debug_path}")
    
    return img


def clean_sender_id(raw_text):
    """Clean and extract sender ID from OCR text"""
    if not raw_text:
        return None
    
    print(f"[DEBUG] Raw OCR text: '{raw_text}'")
    
    # Split into lines and get all non-empty lines
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    if not lines:
        return None
    
    print(f"[DEBUG] Lines extracted: {lines}")
    
    # Known HELB sender IDs - EXACT formats only for security
    # These must match exactly as they appear in legitimate HELB messages
    known_senders_exact = ['HELB', 'SurePay', '5122']
    
    # Try each line to find the sender ID
    for line in lines[:5]:  # Check first 5 lines
        # First, check for exact matches (case-sensitive)
        for known in known_senders_exact:
            if known in line:
                print(f"[DEBUG] Found exact match for '{known}' in line: {line}")
                return known
        
        # If no exact match, check if OCR might have split or slightly misread the text
        # Remove spaces to check for split words (like "Sure Pay" -> "SurePay")
        line_no_spaces = line.replace(' ', '')
        for known in known_senders_exact:
            if known in line_no_spaces:
                print(f"[DEBUG] Found '{known}' after removing spaces from line: {line}")
                return known
        
        # Clean the line for general extraction
        cleaned = line
        
        # Remove common symbols and UI elements (but keep spaces and dashes temporarily)
        cleaned = re.sub(r'[€<>«»→←↑↓▶◀▲▼■□●○★☆♦♣♠♥…·•@#$%^&*()_+=\[\]{}|\\:;"\',.<>?/~`]', ' ', cleaned)
        
        # Remove multiple spaces
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        print(f"[DEBUG] Cleaned line: '{cleaned}'")
        
        # Create a version without spaces/dashes for number extraction
        numbers_only = cleaned.replace(' ', '').replace('-', '')
        
        # Check for phone number pattern (0 followed by 9 digits)
        # This will match: 0110711830, 0110 711830, 0110-711830, etc.
        phone_match = re.search(r'(0\d{9})', numbers_only)
        if phone_match:
            phone_number = phone_match.group(1)
            print(f"[DEBUG] Found phone number: {phone_number}")
            return phone_number
        
        # Check for short code (4-5 digits only, not part of a longer number)
        shortcode_match = re.search(r'\b(\d{4,5})\b', cleaned)
        if shortcode_match:
            # Make sure it's not part of a phone number
            shortcode = shortcode_match.group(1)
            # Verify it's standalone (not followed by more digits)
            if not re.search(rf'{shortcode}\d', numbers_only):
                print(f"[DEBUG] Found short code: {shortcode}")
                return shortcode
        
        # Look for text-based sender IDs (preserve case)
        # Extract words with 4+ characters
        text_match = re.search(r'\b([A-Za-z]{4,})\b', cleaned)
        if text_match:
            sender = text_match.group(1)
            print(f"[DEBUG] Found text sender: {sender}")
            return sender
        
        # Look for any alphanumeric sequence that could be a sender ID
        alphanumeric_match = re.search(r'\b([A-Za-z0-9]{3,})\b', cleaned)
        if alphanumeric_match:
            sender = alphanumeric_match.group(1)
            # Only return if it's not purely numeric or if it's a short numeric code
            if not sender.isdigit() or len(sender) <= 5:
                print(f"[DEBUG] Found alphanumeric sender: {sender}")
                return sender
    
    # Last resort: return first word from first line if it exists
    if lines:
        first_words = lines[0].split()
        if first_words:
            # Try to extract phone number from first word
            first_word_clean = ''.join(first_words).replace(' ', '').replace('-', '')
            phone_match = re.search(r'(0\d{9})', first_word_clean)
            if phone_match:
                result = phone_match.group(1)
                print(f"[DEBUG] Fallback phone result: {result}")
                return result
            
            result = re.sub(r'[^A-Za-z0-9]', '', first_words[0])
            if result:
                print(f"[DEBUG] Fallback result: {result}")
                return result
    
    return None
        
        # Clean the line - but preserve spaces and dashes for phone numbers
    cleaned = line
        
        # Remove common symbols and UI elements (but keep spaces and dashes temporarily)
    cleaned = re.sub(r'[€<>«»→←↑↓▶◀▲▼■□●○★☆♦♣♠♥…·•@#$%^&*()_+=\[\]{}|\\:;"\',.<>?/~`]', ' ', cleaned)
        
        # Remove multiple spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
    print(f"[DEBUG] Cleaned line: '{cleaned}'")
        
        # Create a version without spaces/dashes for number extraction
    numbers_only = cleaned.replace(' ', '').replace('-', '')
        
        # Check for phone number pattern (0 followed by 9 digits)
        # This will match: 0110711830, 0110 711830, 0110-711830, etc.
    phone_match = re.search(r'(0\d{9})', numbers_only)
    if phone_match:
            phone_number = phone_match.group(1)
            print(f"[DEBUG] Found phone number: {phone_number}")
            return phone_number
        
        # Check for short code (4-5 digits only, not part of a longer number)
    shortcode_match = re.search(r'\b(\d{4,5})\b', cleaned)
    if shortcode_match:
            # Make sure it's not part of a phone number
            shortcode = shortcode_match.group(1)
            # Verify it's standalone (not followed by more digits)
            if not re.search(rf'{shortcode}\d', numbers_only):
                print(f"[DEBUG] Found short code: {shortcode}")
                return shortcode
        
        # Look for text-based sender IDs (4+ letters)
    text_match = re.search(r'\b([A-Za-z]{4,})\b', cleaned)
    if text_match:
            sender = text_match.group(1)
            print(f"[DEBUG] Found text sender: {sender}")
            return sender
        
        # Look for any alphanumeric sequence that could be a sender ID
    alphanumeric_match = re.search(r'\b([A-Za-z0-9]{3,})\b', cleaned)
    if alphanumeric_match:
            sender = alphanumeric_match.group(1)
            # Only return if it's not purely numeric or if it's a short numeric code
            if not sender.isdigit() or len(sender) <= 5:
                print(f"[DEBUG] Found alphanumeric sender: {sender}")
                return sender
    
    # Last resort: return first word from first line if it exists
    if lines:
        first_words = lines[0].split()
        if first_words:
            # Try to extract phone number from first word
            first_word_clean = ''.join(first_words).replace(' ', '').replace('-', '')
            phone_match = re.search(r'(0\d{9})', first_word_clean)
            if phone_match:
                result = phone_match.group(1)
                print(f"[DEBUG] Fallback phone result: {result}")
                return result
            
            result = re.sub(r'[^A-Za-z0-9]', '', first_words[0])
            if result:
                print(f"[DEBUG] Fallback result: {result}")
                return result
    
    return None


def extract_sender_id(image_path):
    """Extract and clean sender ID from image using OCR"""
    try:
        _configure_tesseract()
    except RuntimeError as e:
        raise
    
    # Run cleanup before processing to maintain privacy
    delete_old_uploads(os.path.join(os.path.dirname(__file__), "uploads"))
    print(f"[DEBUG] Processing image: {image_path}")
    
    # Preprocess the image
    processed_img = preprocess_image(image_path)
    
    # Try multiple OCR configurations for better accuracy
    configs = [
        r'--oem 3 --psm 7',  # Single line of text (best for sender ID)
        r'--oem 3 --psm 6',  # Assume uniform block of text
        r'--oem 3 --psm 11', # Sparse text
        r'--oem 3 --psm 13', # Raw line (no layout analysis)
    ]
    
    best_result = None
    
    for config in configs:
        print(f"[DEBUG] Trying OCR with config: {config}")
        try:
            raw_text = pytesseract.image_to_string(processed_img, config=config)
            sender_id = clean_sender_id(raw_text)
            
            if sender_id:
                # Check if it matches known senders exactly
                known_senders = ['HELB', 'SurePay', '5122']
                if sender_id in known_senders:
                    print(f"[DEBUG] Matched known sender: {sender_id}")
                    return sender_id
                
                # Prefer text-based IDs or short codes
                if not sender_id.isdigit() or len(sender_id) <= 5:
                    if not best_result:
                        best_result = sender_id
                elif not best_result:
                    best_result = sender_id
        except Exception as e:
            print(f"[DEBUG] OCR attempt failed with config {config}: {str(e)}")
            continue
    
    print(f"[DEBUG] Final extracted sender ID: '{best_result}'")
    return best_result

def delete_old_uploads(directory_path, days=1):
    """
    Delete images in the uploads folder that are older than `1 day`.
    Reinforces data privacy by removing old uploaded files.
    """
    try:
        now = time.time()
        cutoff = now - (days * 86400)  # 86400 seconds in a day

        if not os.path.exists(directory_path):
            print(f"[CLEANUP] Directory not found: {directory_path}")
            return

        deleted_files = []
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)

            # Only process files
            if os.path.isfile(file_path):
                file_mtime = os.path.getmtime(file_path)
                if file_mtime < cutoff:
                    os.remove(file_path)
                    deleted_files.append(filename)

        if deleted_files:
            print(f"[CLEANUP] Deleted {len(deleted_files)} old files: {deleted_files}")
        else:
            print("[CLEANUP] No old uploads to remove.")
    except Exception as e:
        print(f"[CLEANUP ERROR] {str(e)}")
