import os
import uuid
import re
import requests
from io import BytesIO
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from apscheduler.schedulers.background import BackgroundScheduler
import chromadb
from chromadb.config import Settings
import numpy as np
from gensim.downloader import load as gensim_load
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import chromedriver_autoinstaller
from PIL import Image, ImageFilter
import shutil
import pytesseract
import cv2

class PIIDetector:
    def __init__(self, website_list_file='malicious_websites.list'):
        self.website_list_file = website_list_file
        self.AADHAR_REGEX = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")
        self.PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b")
        self.PASSPORT_REGEX = re.compile(r"\b[A-Z]{1}-?\d{7}\b")
        
        # Initialize ChromaDB
        self.client = chromadb.Client(Settings())
        self.collection = self.client.get_or_create_collection(name="exposed_data")
        
        # Load GloVe model
        self.w2v = self._load_glove_model()
    
    def _load_glove_model(self):
        """Load GloVe model - can be mocked for testing"""
        try:
            return gensim_load("glove-wiki-gigaword-300")
        except Exception as e:
            print(f"[ERROR] Failed to load GloVe model: {e}")
            return None
    
    def load_websites(self):
        """Load websites from file"""
        if not os.path.isfile(self.website_list_file):
            return []
        try:
            with open(self.website_list_file, 'r') as f:
                sites = [line.strip() for line in f if line.strip()]
            return sites
        except Exception as e:
            print(f"[ERROR] Failed to load websites: {e}")
            return []
    
    def embed_text(self, text):
        """Convert text to embedding vector"""
        if not self.w2v or not text:
            return np.zeros(300, dtype=float).tolist()
        
        tokens = [token for token in re.findall(r"\w+", text.lower())]
        vectors = [self.w2v[tok] for tok in tokens if tok in self.w2v]
        
        if not vectors:
            return np.zeros(self.w2v.vector_size, dtype=float).tolist()
        
        return np.mean(vectors, axis=0).tolist()
    
    def extract_pii_from_text(self, text):
        """Extract PII from text using regex patterns"""
        if not text:
            return {}
        
        findings = {
            'AADHAR': list(set(self.AADHAR_REGEX.findall(text))),
            'PAN': list(set(self.PAN_REGEX.findall(text))),
            'PASSPORT': list(set(self.PASSPORT_REGEX.findall(text)))
        }
        return findings
    
    def validate_pii_format(self, pii_type, value):
        """Validate PII format"""
        if pii_type == 'AADHAR':
            return bool(self.AADHAR_REGEX.match(value))
        elif pii_type == 'PAN':
            return bool(self.PAN_REGEX.match(value))
        elif pii_type == 'PASSPORT':
            return bool(self.PASSPORT_REGEX.match(value))
        return False
    
    def get_rendered_html(self, url):
        """Get rendered HTML using Selenium"""
        try:
            chromedriver_autoinstaller.install()
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            driver = webdriver.Chrome(options=chrome_options)
            driver.get(url)
            html = driver.page_source
            driver.quit()
            return html
        except Exception as e:
            print(f"[ERROR] Selenium rendering failed for {url}: {e}")
            return ""

# Flask app setup
app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

detector = PIIDetector()

@app.route('/api/get-exposed-websites', methods=['GET'])
@cross_origin()
def get_exposed_websites():
    name = request.args.get('name')
    pii_type = request.args.get('pii-type')
    pii_value = request.args.get('pii-value')
    
    if not all([name, pii_type, pii_value]):
        return jsonify({'error': 'Missing required parameters'}), 400
    
    # Validate PII format
    if not detector.validate_pii_format(pii_type, pii_value):
        return jsonify({'error': 'Invalid PII format'}), 400
    
    # Vector search
    query_text = f"{pii_type} {pii_value}"
    query_emb = detector.embed_text(query_text)
    
    try:
        results = detector.collection.query(query_embeddings=[query_emb], n_results=5)
        neighbors = []
        for m, d in zip(results['metadatas'][0], results['distances'][0]):
            if m.get("pii_type", "") != pii_type:
                continue
            neighbors.append({
                'data': m['data'],
                'pii_type': m.get('pii_type'),
                'website': m['website'],
                'timestamp': m['timestamp'],
                'distance': d,
                'found_in_image': m.get('found_in_image', False)
            })
        return jsonify({'query': query_text, 'neighbors': neighbors})
    except Exception as e:
        return jsonify({'error': 'Database query failed'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5040)
