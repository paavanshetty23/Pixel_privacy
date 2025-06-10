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
import main  # import main.py for extract_pii
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

# Initialize Flask
app = Flask(__name__)
cors = CORS(app) # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'


# Constants
WEBSITE_LIST_FILE = 'malicious_websites.list'
AADHAR_REGEX = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")
PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b")
PASSPORT_REGEX = re.compile(r"\b[A-Z]{1}-?\d{7}\b")

# Load GloVe model once at startup
def load_glove_model():
    print("[INIT] Loading GloVe model...")
    return gensim_load("glove-wiki-gigaword-300")

w2v = load_glove_model()


def embed_text(text):
    tokens = [token for token in re.findall(r"\w+", text.lower())]
    vectors = [w2v[tok] for tok in tokens if tok in w2v]
    if not vectors:
        return np.zeros(w2v.vector_size, dtype=float)
    return np.mean(vectors, axis=0).tolist()

# Initialize ChromaDB client and vector collection
client = chromadb.Client(Settings())
collection = client.get_or_create_collection(name="exposed_data")

def load_websites():
    if not os.path.isfile(WEBSITE_LIST_FILE):
        print(f"[LOAD] Website list file '{WEBSITE_LIST_FILE}' not found.")
        return []
    with open(WEBSITE_LIST_FILE, 'r') as f:
        sites = [line.strip() for line in f if line.strip()]
    print(f"[LOAD] Loaded {len(sites)} websites from list.")
    return sites

def get_rendered_html(url):
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

def scrape_and_store():
    """Scrape each site for PII in text and images, store embeddings in ChromaDB."""
    websites = load_websites()
    for url in websites:
        try:
            print(f"[SCRAPE] Rendering {url}")
            html = get_rendered_html(url)
            if not html:
                continue
            soup = BeautifulSoup(html, 'html.parser')
            text_content = soup.get_text()
            print(f"[SCRAPE] Success - {url} returned {len(text_content)} characters")

            print("[DEBUG] Beginning regex search for known PII formats...")

            # Text-based PII extraction
            findings = {
                'AADHAR': set(AADHAR_REGEX.findall(text_content)),
                'PAN': set(PAN_REGEX.findall(text_content)),
                'PASSPORT': set(PASSPORT_REGEX.findall(text_content))
            }
            for pii_type, values in findings.items():
                for value in values:
                    record_id = str(uuid.uuid4())
                    embedding = embed_text(f"{pii_type} {value}")
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
                    collection.add(
                        ids=[record_id],
                        documents=[value],
                        embeddings=[embedding],
                        metadatas=[metadata]
                    )

            print("[DEBUG] Beginning regex search for known PII formats in images...")

            # Image-based PII extraction (precompute)
            for img in soup.find_all('img'):
                src = img.get('src')
                if not src:
                    continue
                img_url = src if src.startswith('http') else requests.compat.urljoin(url, src)
                try:
                    resp = requests.get(img_url, timeout=10)
                    print(f"[DEBUG] Got image from {img_url}")
                    img_obj = Image.open(BytesIO(resp.content))

                    ocr_text1 = main.pytesseract.image_to_string(img_obj)

                    enhanced = img_obj.resize((img_obj.width*2, img_obj.height*2), Image.BICUBIC)
                    enhanced = enhanced.filter(ImageFilter.BLUR)
                    ocr_text2 = main.pytesseract.image_to_string(enhanced)

                    bw = enhanced.convert('L').point(lambda x: 0 if x < 128 else 255)
                    ocr_text3 = main.pytesseract.image_to_string(bw)


                    print(f"[DEBUG] Found \n{ocr_text1}\n and \n{ocr_text2}\n and \n{ocr_text3}\n in {img_url}")
                    pii_dict = {
                        'AADHAR': set(AADHAR_REGEX.findall(ocr_text1) + AADHAR_REGEX.findall(ocr_text2) + AADHAR_REGEX.findall(ocr_text3)),
                        'PAN': set(PAN_REGEX.findall(ocr_text1) + PAN_REGEX.findall(ocr_text2) + PAN_REGEX.findall(ocr_text3)),
                        'PASSPORT': set(PASSPORT_REGEX.findall(ocr_text1) + PASSPORT_REGEX.findall(ocr_text2) + PASSPORT_REGEX.findall(ocr_text3))
                    }
                    for pii_type, vals in pii_dict.items():
                        for value in vals:
                            record_id = str(uuid.uuid4())
                            embedding = embed_text(f"{pii_type} {value}")
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
                            collection.add(
                                ids=[record_id],
                                documents=[value],
                                embeddings=[embedding],
                                metadatas=[metadata]
                            )
                except Exception as e:
                    print(f"[ERROR] Image extraction failed for {img_url}: {e}")
        except Exception as e:
            print(f"[ERROR] Scraping failed for {url}: {e}")

def schedule_scraping():
    scheduler = BackgroundScheduler()
    scheduler.add_job(scrape_and_store, 'interval', hours=1, id='scrape_job', replace_existing=True)
    scheduler.start()
    scrape_and_store()

@app.route('/api/get-exposed-websites', methods=['GET'])
@cross_origin()
def get_exposed_websites():
    name = request.args.get('name')
    pii_type = request.args.get('pii-type')
    pii_value = request.args.get('pii-value')
    if not all([name, pii_type, pii_value]):
        return jsonify({'error': 'Missing required parameters'}), 400

    # Fast vector DB search
    query_text = f"{pii_type} {pii_value}"
    query_emb = embed_text(query_text)
    results = collection.query(query_embeddings=[query_emb], n_results=5)
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

if __name__ == '__main__':
    schedule_scraping()
    app.run(host='0.0.0.0', port=5040)
