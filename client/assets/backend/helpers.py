from PIL import Image
import pytesseract
import shutil
import os

# Try to locate tesseract binary automatically. If it's not found, the function
# below will raise a RuntimeError with an actionable message so the caller can
# display a user-friendly error.
def _configure_tesseract():
    # If pytesseract already has the command set (e.g., via env var), keep it
    current = getattr(pytesseract.pytesseract, 'tesseract_cmd', None)
    if current and os.path.exists(current):
        return

    # 1) Look for tesseract on PATH
    t_path = shutil.which('tesseract')
    if t_path:
        pytesseract.pytesseract.tesseract_cmd = t_path
        return

    # 2) Common Windows install locations
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

    # 3) Allow user-defined env var TESSERACT_CMD
    env_path = os.environ.get('TESSERACT_CMD')
    if env_path and os.path.exists(env_path):
        pytesseract.pytesseract.tesseract_cmd = env_path
        return

    # Not found — raise a helpful error
    raise RuntimeError(
        "tesseract is not installed or it's not in your PATH. "
        "Install Tesseract OCR (https://github.com/tesseract-ocr/tesseract) "
        "and ensure the tesseract executable is on your PATH, or set the "
        "environment variable TESSERACT_CMD to the full path of tesseract.exe."
    )


def extract_sender_id(image_path):
    # Ensure tesseract cmd is configured before calling pytesseract
    try:
        _configure_tesseract()
    except RuntimeError as e:
        # Re-raise so the caller (Flask) can return a JSON error response
        raise

    # Run OCR
    text = pytesseract.image_to_string(Image.open(image_path))
    # Basic sender pattern extraction (customize as needed)
    lines = text.splitlines()
    for line in lines:
        # Adjust this logic if sender ID appears in a specific way
        if line.strip():
            return line.strip()
    return None
