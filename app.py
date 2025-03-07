import os
from flask import Flask, render_template, request, jsonify
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default-secret-key")

# In-memory storage for emails and prizes
collected_emails = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/collect-email', methods=['POST'])
def collect_email():
    data = request.json
    email = data.get('email')
    prize = data.get('prize')
    
    if not email or not prize:
        return jsonify({'success': False, 'message': 'Email and prize are required'}), 400
    
    # Store email with prize
    collected_emails.append({'email': email, 'prize': prize})
    logging.debug(f"Stored email: {email} with prize: {prize}")
    
    return jsonify({'success': True, 'message': 'Prize claimed successfully!'})
