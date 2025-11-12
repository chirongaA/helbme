from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import os
import json
from helpers import extract_sender_id, verify_link_with_virustotal, extract_message_text, extract_urls_from_text


app = Flask(__name__)
CORS(app)  # allow cross-origin requests (use more restrictive settings in production)

# Keep uploads folder inside the backend directory so paths are predictable
BASE_DIR = os.path.dirname(__file__)
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, 'uploads')

# Try to connect to MongoDB; if unavailable fall back to the bundled JSON
collection = None
sender_list = []
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=2000)
    # attempt a ping to ensure the server is reachable
    client.admin.command('ping')
    db = client['sms_scam_detection']
    collection = db['sender_ids']
except Exception:
    # load bundled sender ids as a fallback
    json_path = os.path.join(BASE_DIR, 'db', 'sender_ids.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            sender_list = [entry.get('sender_id') for entry in json.load(f) if 'sender_id' in entry]
    except Exception:
        sender_list = []

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_known_sender(sender_id):
    """Check if sender ID is known/legitimate with EXACT case-sensitive matching"""
    if not sender_id:
        return False
    
    # EXACT matching only - case sensitive for security
    # This prevents scammers from using variations like "sure pay", "SUREPAY", etc.
    
    # If MongoDB is available use it
    try:
        if collection is not None:
            # Exact match in MongoDB (case-sensitive)
            result = collection.find_one({'sender_id': sender_id})
            if result:
                return True
    except Exception as e:
        print(f"[DEBUG] MongoDB search error: {e}")
    
    # Fall back to exact list comparison (case-sensitive)
    if sender_id in sender_list:
        return True
    
    return False


@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']
    image_path = os.path.join('uploads', image_file.filename)
    image_file.save(image_path)

    try:
        # Step 1: Extract sender ID from the top section of the image
        sender_id = extract_sender_id(image_path)

        # Step 2: Extract full text from the message body
        message_text = extract_message_text(image_path)

        # Step 3: Extract any URLs from that text
        urls = extract_urls_from_text(message_text)

        # Step 4: Check each URL using VirusTotal
        url_results = []
        if urls:
            for url in urls:
                vt_result = verify_link_with_virustotal(url)
                url_results.append({
                    'url': url,
                    'verdict': vt_result
                })
        else:
            url_results.append({'message': 'No URLs found in the message'})

        # Step 5: Determine if sender is legitimate
        is_known = is_known_sender(sender_id)

        # Step 6: Build structured response
        if is_known:
            verdict = "Legitimate Message"
            message = f'The sender ID <strong>"{sender_id}"</strong> is recognized as an official HELB communication channel. This message appears to be legitimate.'
            advice = [
                "Always confirm messages come from official sender IDs: **HELB**, **SurePay**, or **5122**.",
                "You can safely interact with official HELB messages, but stay alert for unexpected links."
            ]
        else:
            verdict = "Likely a Scam"
            message = f'The sender ID <strong>"{sender_id}"</strong> is NOT recognized by HELB. This message shows signs of a potential smishing attempt.'
            advice = [
                "HELB sends communication through **HELB**, **SurePay**, and **5122** only.",
                "Do not click on suspicious links.",
                "Block and report the sender immediately.",
                "Delete the message to stay safe."
            ]

        # Step 7: Combine all into final response
        response = {
            'sender_id': sender_id if sender_id else "Sender not detected",
            'is_known': is_known,
            'verdict': verdict,
            'message': message,
            'advice': advice,
            'urls_checked': url_results
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)