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

# Check for Tesseract executable availability
if shutil.which('tesseract') is None:
    print("[WARN] Tesseract executable not found in PATH. Image OCR disabled.")
    IMAGE_OCR_AVAILABLE = False
else:
    IMAGE_OCR_AVAILABLE = True

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
            print("[INIT] Loading GloVe model...")
            return gensim_load("glove-wiki-gigaword-300")
        except Exception as e:
            print(f"[ERROR] Failed to load GloVe model: {e}")
            return None
    
    def load_websites(self):
        """Load websites from file"""
        if not os.path.isfile(self.website_list_file):
            print(f"[LOAD] Website list file '{self.website_list_file}' not found.")
            return []
        try:
            with open(self.website_list_file, 'r') as f:
                sites = [line.strip() for line in f if line.strip()]
            print(f"[LOAD] Loaded {len(sites)} websites from list.")
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
    
    def scrape_and_store(self):
        """Scrape each site for PII in text and images, store embeddings in ChromaDB."""
        websites = self.load_websites()
        for url in websites:
            try:
                print(f"[SCRAPE] Rendering {url}")
                html = self.get_rendered_html(url)
                if not html:
                    continue
                soup = BeautifulSoup(html, 'html.parser')
                text_content = soup.get_text()
                print(f"[SCRAPE] Success - {url} returned {len(text_content)} characters")

                print("[DEBUG] Beginning regex search for known PII formats...")

                # Text-based PII extraction
                findings = {
                    'AADHAR': set(self.AADHAR_REGEX.findall(text_content)),
                    'PAN': set(self.PAN_REGEX.findall(text_content)),
                    'PASSPORT': set(self.PASSPORT_REGEX.findall(text_content))
                }
                for pii_type, values in findings.items():
                    for value in values:
                        record_id = str(uuid.uuid4())
                        embedding = self.embed_text(f"{pii_type} {value}")
                        if np.linalg.norm(embedding) == 0:
                            print(f"[SKIP] Zero vector for {pii_type}: {value}")
                            continue
                        metadata = {
                            'data': value,
                            'pii_type': pii_type,
                            'website': url,
                            'timestamp': datetime.utcnow().isoformat(),
                            'found_in_image': False
                        }
                        print(f"[STORE] {pii_type}: {value} from {url}")
                        self.collection.add(
                            ids=[record_id],
                            documents=[value],
                            embeddings=[embedding],
                            metadatas=[metadata]
                        )

                print("[DEBUG] Beginning regex search for known PII formats in images...")

                # Image-based PII extraction
                for img in soup.find_all('img'):
                    src = img.get('src')
                    if not src:
                        continue
                    img_url = src if src.startswith('http') else requests.compat.urljoin(url, src)
                    try:
                        resp = requests.get(img_url, timeout=10)
                        print(f"[DEBUG] Got image from {img_url}")
                        img_obj = Image.open(BytesIO(resp.content))

                        # Multiple OCR techniques
                        ocr_text1 = pytesseract.image_to_string(img_obj)

                        enhanced = img_obj.resize((img_obj.width*2, img_obj.height*2), Image.BICUBIC)
                        enhanced = enhanced.filter(ImageFilter.BLUR)
                        ocr_text2 = pytesseract.image_to_string(enhanced)

                        bw = enhanced.convert('L').point(lambda x: 0 if x < 128 else 255)
                        ocr_text3 = pytesseract.image_to_string(bw)

                        print(f"[DEBUG] Found \n{ocr_text1}\n and \n{ocr_text2}\n and \n{ocr_text3}\n in {img_url}")
                        
                        pii_dict = {
                            'AADHAR': set(self.AADHAR_REGEX.findall(ocr_text1) + self.AADHAR_REGEX.findall(ocr_text2) + self.AADHAR_REGEX.findall(ocr_text3)),
                            'PAN': set(self.PAN_REGEX.findall(ocr_text1) + self.PAN_REGEX.findall(ocr_text2) + self.PAN_REGEX.findall(ocr_text3)),
                            'PASSPORT': set(self.PASSPORT_REGEX.findall(ocr_text1) + self.PASSPORT_REGEX.findall(ocr_text2) + self.PASSPORT_REGEX.findall(ocr_text3))
                        }
                        
                        for pii_type, vals in pii_dict.items():
                            for value in vals:
                                record_id = str(uuid.uuid4())
                                embedding = self.embed_text(f"{pii_type} {value}")
                                if np.linalg.norm(embedding) == 0:
                                    print(f"[SKIP] Zero vector for {pii_type}: {value} in image")
                                    continue
                                metadata = {
                                    'data': value,
                                    'pii_type': pii_type,
                                    'website': url,
                                    'timestamp': datetime.utcnow().isoformat(),
                                    'found_in_image': True
                                }
                                print(f"[STORE] {pii_type}: {value} from {url} in {img_url}")
                                self.collection.add(
                                    ids=[record_id],
                                    documents=[value],
                                    embeddings=[embedding],
                                    metadatas=[metadata]
                                )
                    except Exception as e:
                        print(f"[ERROR] Image extraction failed for {img_url}: {e}")
            except Exception as e:
                print(f"[ERROR] Scraping failed for {url}: {e}")

    def schedule_scraping(self):
        """Schedule periodic scraping"""
        scheduler = BackgroundScheduler()
        scheduler.add_job(self.scrape_and_store, 'interval', hours=1, id='scrape_job', replace_existing=True)
        scheduler.start()
        self.scrape_and_store()  # Run once immediately

# Flask app setup
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Initialize detector
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
    detector.schedule_scraping()
    app.run(host='0.0.0.0', port=5040)
