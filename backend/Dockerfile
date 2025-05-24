FROM python:3.11

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

RUN python -c "import gensim.downloader as api; api.load('glove-wiki-gigaword-300')"

COPY . /app
WORKDIR /app

EXPOSE 5000

CMD ["python", "app.py"]
