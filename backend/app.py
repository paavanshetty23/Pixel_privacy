import os
import uuid
import re
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler
import chromadb
from chromadb.config import Settings
import numpy as np
from gensim.downloader import load as gensim_load
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
import chromedriver_autoinstaller

# Initialize Flask
app = Flask(__name__)

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
    vectors = []
    for tok in tokens:
        if tok in w2v:
            vectors.append(w2v[tok])
    if not vectors:
        return np.zeros(w2v.vector_size, dtype=float)
    mean_vec = np.mean(vectors, axis=0)
    return mean_vec.tolist()

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
        chrome_options.binary_location = "/usr/bin/chromium"
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(url)
        html = driver.page_source
        driver.quit()
        return html
    except Exception as e:
        print(f"[ERROR] Selenium rendering failed for {url}: {e}")
        return ""

def scrape_and_store():
    websites = load_websites()
    for url in websites:
        try:
            print(f"[SCRAPE] Rendering {url}")
            rendered_html = get_rendered_html(url)
            if not rendered_html:
                continue
            soup = BeautifulSoup(rendered_html, 'html.parser')
            text = soup.get_text()
            print(f"[SCRAPE] Success - {url} returned {len(text)} characters")

            print("[DEBUG] Beginning regex search for known PII formats...")

            findings = {
                'AADHAR': set(AADHAR_REGEX.findall(text)),
                'PAN': set(PAN_REGEX.findall(text)),
                'PASSPORT': set(PASSPORT_REGEX.findall(text))
            }

            for pii_type, values in findings.items():
                print(f"[PII] Found {len(values)} items for {pii_type}")
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
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    print(f"[STORE] {pii_type}: {value} from {url}")
                    collection.add(
                        ids=[record_id],
                        documents=[value],
                        embeddings=[embedding],
                        metadatas=[metadata]
                    )
        except Exception as e:
            print(f"[ERROR] Scraping failed for {url}: {e}")

def schedule_scraping():
    scheduler = BackgroundScheduler()
    scheduler.add_job(scrape_and_store, 'interval', hours=1, id='scrape_job', replace_existing=True)
    scheduler.start()
    print("[SCHEDULER] Running initial scrape...")
    scrape_and_store()

@app.route('/api/get-exposed-websites', methods=['GET'])
def get_exposed_websites():
    name = request.args.get('name')
    if not name:
        return jsonify({'error': 'Missing query parameter: name'}), 400
    pii_type = request.args.get('pii-type')
    if not pii_type:
        return jsonify({'error': 'Missing query parameter: pii-type'}), 400
    pii_value = request.args.get('pii-value')
    if not pii_value:
        return jsonify({'error': 'Missing query parameter: pii-value'}), 400

    query_text = f"{pii_type} {pii_value}"
    query_embedding = embed_text(query_text)
    app.logger.info(f"[QUERY] Embedding for: {query_text}, norm={np.linalg.norm(query_embedding):.2f}")

    try:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5
        )
        neighbors = []
        for meta, dist in zip(results['metadatas'][0], results['distances'][0]):
            neighbors.append({
                'data': meta['data'],
                'pii_type': meta.get('pii_type', 'UNKNOWN'),
                'website': meta['website'],
                'timestamp': meta['timestamp'],
                'distance': dist
            })
        app.logger.info(f"[QUERY RESULT] Found {len(neighbors)} neighbors")
        return jsonify({'query': query_text, 'neighbors': neighbors})
    except Exception as e:
        app.logger.error(f"[ERROR] Querying vector DB failed: {e}")
        return jsonify({'error': 'Query failed'}), 500

if __name__ == '__main__':
    schedule_scraping()
    app.run(host='0.0.0.0', port=5040)
