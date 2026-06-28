# Google Cloud Run Deployment

This document records the deployment flow for FoodieMap on Google Cloud Run.

## Current Shape

- Runtime: Docker image built from `Dockerfile`
- App server: `python3 server.py`
- Platform: Google Cloud Run
- Port: Cloud Run injects `PORT`; `server.py` reads it when no CLI port is passed
- Public base URL: configured with `APP_BASE_URL`
- Auth callback: `{APP_BASE_URL}/auth/google/callback`
- Storage: SQLite database and uploaded images are local files

Cloud Run container files are not a durable database or upload store. The current SQLite/uploads setup is acceptable for MVP testing, but production use should move the database to a durable service such as Cloud SQL and uploaded images to object storage.

## One-Time Google Cloud Setup

Set the project and region:

```bash
gcloud config set project PROJECT_ID
gcloud config set run/region REGION
```

Enable the required services:

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

Create an Artifact Registry repository if it does not already exist:

```bash
gcloud artifacts repositories create foodie-map \
  --repository-format=docker \
  --location=REGION \
  --description="FoodieMap container images"
```

## Build And Deploy

Build the image with Cloud Build:

```bash
gcloud builds submit \
  --tag REGION-docker.pkg.dev/PROJECT_ID/foodie-map/foodiemap:latest
```

Deploy the image to Cloud Run:

```bash
gcloud run deploy foodie-map \
  --image REGION-docker.pkg.dev/PROJECT_ID/foodie-map/foodiemap:latest \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars APP_BASE_URL=https://YOUR_DOMAIN_OR_RUN_URL \
  --set-env-vars SESSION_SECRET=REPLACE_WITH_32_PLUS_RANDOM_CHARS \
  --set-env-vars GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID \
  --set-env-vars GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET \
  --set-env-vars ADMIN_USERNAME=admin \
  --set-env-vars ADMIN_PASSWORD=REPLACE_WITH_STRONG_PASSWORD \
  --set-env-vars FREE_RESTAURANT_LIMIT=50
```

Add SMTP variables only when email code sign-in and password reset should be enabled:

```bash
gcloud run services update foodie-map \
  --set-env-vars SMTP_HOST=smtp.example.com \
  --set-env-vars SMTP_PORT=587 \
  --set-env-vars SMTP_USERNAME=mailer@example.com \
  --set-env-vars SMTP_PASSWORD=REPLACE_WITH_SMTP_PASSWORD \
  --set-env-vars "SMTP_FROM=FoodieMap <mailer@example.com>" \
  --set-env-vars SMTP_USE_TLS=true
```

For real credentials, prefer Secret Manager or Cloud Run secret environment variables instead of storing secrets directly in shell history.

## Google OAuth

In Google Cloud Console, configure the OAuth client with this authorized redirect URI:

```text
https://YOUR_DOMAIN_OR_RUN_URL/auth/google/callback
```

Then make sure the Cloud Run service has the same base URL:

```bash
gcloud run services update foodie-map \
  --set-env-vars APP_BASE_URL=https://YOUR_DOMAIN_OR_RUN_URL
```

If a custom domain is added later, update both `APP_BASE_URL` and the OAuth redirect URI.

## Update Deployment

After committing changes:

```bash
git pull
gcloud builds submit \
  --tag REGION-docker.pkg.dev/PROJECT_ID/foodie-map/foodiemap:latest
gcloud run deploy foodie-map \
  --image REGION-docker.pkg.dev/PROJECT_ID/foodie-map/foodiemap:latest \
  --platform managed
```

Cloud Run creates a new revision for each deploy. Existing environment variables remain unless changed.

## Logs And Health Check

Check service health:

```bash
curl https://YOUR_DOMAIN_OR_RUN_URL/api/health
```

Read recent logs:

```bash
gcloud run services logs read foodie-map --limit=100
```

Open the service in a browser:

```bash
gcloud run services describe foodie-map \
  --format="value(status.url)"
```

## Rollback

List revisions:

```bash
gcloud run revisions list --service foodie-map
```

Send all traffic back to a known-good revision:

```bash
gcloud run services update-traffic foodie-map \
  --to-revisions REVISION_NAME=100
```

## Local Parity

Local Docker still runs on `5173` through `compose.yaml`:

```bash
docker compose up --build
```

Cloud Run should not pass a hard-coded port. The platform injects `PORT`, and the Docker image starts with:

```bash
python3 server.py
```
