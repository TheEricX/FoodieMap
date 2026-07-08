# Google Cloud Production Deployment

This document describes the production-oriented Google Cloud architecture for FoodieMap.

## Architecture

- Runtime: Cloud Run
- Image registry: Artifact Registry
- Build: Cloud Build
- Database: Cloud SQL for PostgreSQL
- Upload storage: Google Cloud Storage
- Secrets: Secret Manager

Cloud Run containers are stateless. Do not store the production SQLite database or uploads on the container filesystem. Production data must live in Cloud SQL and Cloud Storage.

## One-Time Project Setup

Set the active project and region:

```bash
gcloud config set project PROJECT_ID
gcloud config set run/region REGION
```

Enable required services:

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

Create an Artifact Registry repository if needed:

```bash
gcloud artifacts repositories create foodie-map \
  --repository-format=docker \
  --location=REGION \
  --description="FoodieMap container images"
```

## Cloud SQL PostgreSQL

Create a PostgreSQL instance in the same region as Cloud Run:

```bash
gcloud sql instances create foodie-map-db \
  --database-version=POSTGRES_16 \
  --region=REGION \
  --tier=db-f1-micro \
  --storage-size=10GB \
  --availability-type=zonal \
  --backup-start-time=08:00
```

Create the app database and user:

```bash
gcloud sql databases create foodiemap --instance=foodie-map-db
gcloud sql users create foodiemap_user \
  --instance=foodie-map-db \
  --password=REPLACE_WITH_STRONG_DB_PASSWORD
```

Get the instance connection name:

```bash
gcloud sql instances describe foodie-map-db \
  --format="value(connectionName)"
```

The Cloud Run `DATABASE_URL` should use the Cloud SQL Unix socket:

```text
postgresql://foodiemap_user:DB_PASSWORD@/foodiemap?host=/cloudsql/PROJECT_ID:REGION:foodie-map-db
```

## Cloud Storage Upload Bucket

Create a bucket for uploads:

```bash
gcloud storage buckets create gs://PROJECT_ID-foodiemap-uploads \
  --location=REGION \
  --uniform-bucket-level-access
```

The app stores uploaded objects under prefixes such as:

```text
dishes/...
recipes/...
```

If `GCS_PUBLIC_BASE_URL` is empty, the backend serves `/uploads/*` by proxying the private bucket. For a CDN or public bucket later, set `GCS_PUBLIC_BASE_URL` to that public origin.

## Service Account And IAM

Create a dedicated Cloud Run service account:

```bash
gcloud iam service-accounts create foodiemap-run \
  --display-name="FoodieMap Cloud Run"
```

Grant minimum runtime permissions:

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:foodiemap-run@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud storage buckets add-iam-policy-binding gs://PROJECT_ID-foodiemap-uploads \
  --member="serviceAccount:foodiemap-run@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectUser"
```

## Secret Manager

Store sensitive values in Secret Manager:

```bash
printf '%s' 'REPLACE_WITH_32_PLUS_RANDOM_CHARS' | gcloud secrets create SESSION_SECRET --data-file=-
printf '%s' 'postgresql://foodiemap_user:DB_PASSWORD@/foodiemap?host=/cloudsql/PROJECT_ID:REGION:foodie-map-db' | gcloud secrets create DATABASE_URL --data-file=-
printf '%s' 'GOOGLE_CLIENT_SECRET_VALUE' | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
```

Grant Cloud Run access:

```bash
gcloud secrets add-iam-policy-binding SESSION_SECRET \
  --member="serviceAccount:foodiemap-run@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:foodiemap-run@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding GOOGLE_CLIENT_SECRET \
  --member="serviceAccount:foodiemap-run@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Add SMTP and admin secrets the same way if those features are enabled.

## Build And Deploy

Build the container:

```bash
gcloud builds submit \
  --tag REGION-docker.pkg.dev/PROJECT_ID/foodie-map/foodiemap:latest
```

Deploy to Cloud Run:

```bash
gcloud run deploy foodie-map \
  --image REGION-docker.pkg.dev/PROJECT_ID/foodie-map/foodiemap:latest \
  --platform managed \
  --allow-unauthenticated \
  --service-account foodiemap-run@PROJECT_ID.iam.gserviceaccount.com \
  --add-cloudsql-instances PROJECT_ID:REGION:foodie-map-db \
  --set-env-vars APP_ENV=production \
  --set-env-vars APP_BASE_URL=https://YOUR_DOMAIN_OR_RUN_URL \
  --set-env-vars GCS_BUCKET=PROJECT_ID-foodiemap-uploads \
  --set-env-vars GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID \
  --set-env-vars GOOGLE_GEOCODING_API_KEY=YOUR_OPTIONAL_GEOCODING_KEY \
  --set-env-vars FREE_RESTAURANT_LIMIT=50 \
  --set-secrets SESSION_SECRET=SESSION_SECRET:latest \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-secrets GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest
```

## Google OAuth

In Google Cloud Console, configure the OAuth client with:

```text
https://YOUR_DOMAIN_OR_RUN_URL/auth/google/callback
```

Keep `APP_BASE_URL` in Cloud Run exactly aligned with the public URL used in the OAuth callback.

## Data Migration

Back up the local SQLite source before migrating:

```bash
cp data/foodiemap.db backups/foodiemap-before-cloudsql-gcs.db
```

Install dependencies locally:

```bash
python3 -m pip install -r requirements.txt
```

Run the migration against a staging Cloud SQL database first:

```bash
DATABASE_URL='postgresql://foodiemap_user:DB_PASSWORD@/foodiemap?host=/cloudsql/PROJECT_ID:REGION:foodie-map-db' \
GCS_BUCKET='PROJECT_ID-foodiemap-uploads' \
SOURCE_SQLITE_DB='data/foodiemap.db' \
SOURCE_UPLOAD_DIR='data/uploads' \
python3 scripts/migrate_sqlite_to_postgres_gcs.py
```

Expected baseline from the current local database:

```text
users=1 restaurants=8 lists=3 dishes=3
```

## Verification

Check service health:

```bash
curl https://YOUR_DOMAIN_OR_RUN_URL/api/health
```

Expected production shape:

```json
{
  "ok": true,
  "database": "postgresql",
  "storage": "gcs"
}
```

Smoke test:

- Sign in on desktop.
- Confirm existing restaurants and lists appear.
- Sign in on phone with the same account.
- Confirm the same data appears.
- Upload a dish or recipe photo.
- Redeploy Cloud Run.
- Confirm text data and uploaded images still exist.

## Rollback

List revisions:

```bash
gcloud run revisions list --service foodie-map
```

Send traffic back to a known-good revision:

```bash
gcloud run services update-traffic foodie-map \
  --to-revisions REVISION_NAME=100
```

Cloud SQL and GCS are independent of Cloud Run revisions, so rollback should not remove persisted data.
