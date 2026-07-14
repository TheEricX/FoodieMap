FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY index.html styles.css ui-tokens.css ui-shell.css app.js location-core.mjs ui-core.mjs ui-shell.mjs ui-dialogs.mjs ui-components.mjs data-client.mjs domain-core.mjs view-templates.mjs server.py mcp_server.py oauth_service.py foodiemap_service.py ./

ENV DATA_DIR=/data
VOLUME ["/data"]

EXPOSE 8080

CMD ["python3", "server.py"]
