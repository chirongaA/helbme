from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import os
import json
from helpers import extract_sender_id, check_url_safety


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

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        # Ensure upload directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        file.save(filepath)

        try:
            sender_id = extract_sender_id(filepath)
        except Exception as e:
            return jsonify({'error': f'OCR error: {str(e)}'}), 500

        if sender_id:
            # Check if it's a known sender with EXACT matching
            found = is_known_sender(sender_id)
            
            print(f"[DEBUG] Extracted sender_id: '{sender_id}', Is known: {found}")
            
            return jsonify({'sender_id': sender_id, 'is_known': bool(found)}), 200
        else:
            return jsonify({'error': 'Sender ID not found via OCR'}), 404
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    # Run on 0.0.0.0 if you want to access from other devices; default port is 5000
    app.run(debug=True)

@app.route('/check_url', methods=['POST'])
def check_url():
    """Verify a URL using the VirusTotal API."""
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        result = check_url_safety(url)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500