FROM python:3.11

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

RUN python -c "import gensim.downloader as api; api.load('glove-wiki-gigaword-300')"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    tesseract-ocr \
    libtesseract-dev \
    libjpeg-dev \
    libpng-dev \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY . /app
WORKDIR /app

EXPOSE 5040

CMD ["python", "app.py"]
