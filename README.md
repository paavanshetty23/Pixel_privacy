# Pixel_privacy

A Python-based utility for detecting and monitoring Personally Identifiable Information (PII) on public websites. This project includes web scraping, data processing, and automated monitoring capabilities.

## Features

- Detects government-issued PII (e.g., SSNs, passport numbers) on public websites.
- Converts website content into vector embeddings for efficient PII search.
- Implements automated monitoring with periodic scans and user alerts for newly detected sensitive information.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/paavanshetty23/Pixel_privacy
   cd Pixel_privacy
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Run the PII Detection Pipeline

```bash
python main.py
```
- Processes websites and detects PII.
- Outputs results to `pii_detection_results.json`.

### Monitor Websites for PII

```bash
python monitor.py
```
- Periodically scans websites and sends alerts for newly detected PII.

## Output Format

The output JSON contains a list of detected PII instances with details such as type, location, and timestamp.

Example:
```json
[
  {
    "type": "SSN",
    "value": "123-45-6789",
    "url": "http://example.com",
    "timestamp": "2025-05-13T10:00:00Z"
  },
  ...
]
```

## Notes
- Ensure Python 3.7+ is installed.
- For best results, use a stable internet connection for web scraping.

## License

MIT
