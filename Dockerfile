FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY index.html styles.css app.js server.py ./

ENV DATA_DIR=/data
VOLUME ["/data"]

EXPOSE 8080

CMD ["python3", "server.py"]
