FROM python:3.12-slim

WORKDIR /app

COPY index.html styles.css app.js server.py ./

EXPOSE 5173

CMD ["python3", "server.py", "5173"]
