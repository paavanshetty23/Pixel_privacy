import React from 'react';
import logo from '../logo.png';

function HomePage() {
  return (
    <div className="home-page">
      <div className="info-content">
        <p className="desc-text">
          <b>Pixel Privacy</b> is a robust Python-based platform engineered to detect and monitor government-issued Personally Identifiable Information (PII) exposed on publicly accessible websites. Leveraging web scraping techniques, Optical Character Recognition (OCR), and advanced vector embeddings, the system automatically scans both textual and image-based content—such as Aadhaar cards, PAN IDs, and other identity documents—to identify sensitive data that may inadvertently appear on the internet. By combining automated periodic scans with alert notifications, Pixel Privacy ensures that any newly discovered PII is promptly flagged, allowing organizations and individuals to remediate potential data leaks before they escalate into identity theft or regulatory non-compliance.
        </p>
        <p className="desc-text">
          Under the hood, Pixel Privacy integrates a full pipeline that begins with user-defined inputs via a React-based UI and extends through backend processing using Python frameworks. Static web pages are scraped with libraries like BeautifulSoup, while dynamic content can be harvested using Selenium or Requests. Any images encountered are passed through the Tesseract OCR engine to extract embedded text. Detected patterns—such as the 12-digit Aadhaar number or 10-character PAN format—are identified using regular expressions and validated against identity standards. Extracted text is then converted into vector representations with GloVe word embeddings (via Gensim), which are stored in a ChromaDB vector database for efficient similarity searches. When new content is found, the vector search engine compares embeddings against known PII patterns, and if a match exceeds a configured threshold, an alert is generated and stored in a JSON-based results log. Email notifications (SMTP) are dispatched to stakeholders whenever new or changed PII is uncovered (<a href="https://www.leegality.com/consent-blog/data-breach?utm_source=chatgpt.com" target="_blank" rel="noopener noreferrer">Leegality</a>).
        </p>
        <p className="desc-text">
          The necessity of a tool like Pixel Privacy has only grown in the wake of India’s Digital Personal Data Protection (DPDP) Act, 2023, which mandates strict safeguarding of personal data and imposes significant penalties for unauthorized disclosures. With over 100 million records exposed in recent breaches and penalties reaching up to ₹250 Crores for non-compliance, organizations must proactively guard against inadvertent leaks of Aadhaar numbers, PAN IDs, and other PII through unstructured online content. By automatically monitoring both text and images across public websites, Pixel Privacy not only helps maintain regulatory compliance under the DPDP Act but also empowers users to reduce the risk of identity theft and enhance overall digital trust.
        </p>
      </div>
    </div>
  );
}

export default HomePage;
