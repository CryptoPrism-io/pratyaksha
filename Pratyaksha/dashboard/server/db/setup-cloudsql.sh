#!/bin/bash
# =============================================================================
# BECOMING — Cloud SQL Setup Script
# Run this after: gcloud auth login && gcloud config set project social-data-pipeline-and-push
# =============================================================================

set -e

PROJECT_ID="social-data-pipeline-and-push"
REGION="asia-south1"
INSTANCE_NAME="becoming-db"
DB_NAME="becoming"
DB_USER="becoming_app"
DB_PASSWORD=$(openssl rand -base64 24)  # Auto-generate secure password

echo "=========================================="
echo "  Becoming — Cloud SQL Setup"
echo "=========================================="
echo "Project:  $PROJECT_ID"
echo "Region:   $REGION"
echo "Instance: $INSTANCE_NAME"
echo "Database: $DB_NAME"
echo "User:     $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo "SAVE THIS PASSWORD — it won't be shown again!"
echo "=========================================="
echo ""

# Step 1: Enable required APIs
echo "[1/7] Enabling Cloud SQL API..."
gcloud services enable sqladmin.googleapis.com --project=$PROJECT_ID
gcloud services enable sql-component.googleapis.com --project=$PROJECT_ID

# Step 2: Create Cloud SQL PostgreSQL instance
# - db-f1-micro: Cheapest tier (~$7.67/month) — good for development
# - PostgreSQL 15: Supports pgvector natively
# - asia-south1: Same region as Cloud Run
echo "[2/7] Creating Cloud SQL instance (this takes 5-10 minutes)..."
gcloud sql instances create $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --region=$REGION \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --availability-type=zonal \
  --backup-start-time=03:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04 \
  --database-flags=cloudsql.iam_authentication=on \
  --no-assign-ip \
  --network=default \
  --enable-google-private-path

# Step 3: Also add a public IP for initial setup (can remove later)
echo "[3/7] Adding public IP for initial schema deployment..."
gcloud sql instances patch $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --assign-ip \
  --authorized-networks=0.0.0.0/0 \
  --quiet

# Step 4: Create database
echo "[4/7] Creating database '$DB_NAME'..."
gcloud sql databases create $DB_NAME \
  --project=$PROJECT_ID \
  --instance=$INSTANCE_NAME

# Step 5: Create application user
echo "[5/7] Creating database user '$DB_USER'..."
gcloud sql users create $DB_USER \
  --project=$PROJECT_ID \
  --instance=$INSTANCE_NAME \
  --password=$DB_PASSWORD

# Step 6: Get connection info
echo "[6/7] Getting connection details..."
INSTANCE_IP=$(gcloud sql instances describe $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format="value(ipAddresses[0].ipAddress)")

CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format="value(connectionName)")

echo ""
echo "=========================================="
echo "  CONNECTION DETAILS"
echo "=========================================="
echo "Public IP:        $INSTANCE_IP"
echo "Connection Name:  $CONNECTION_NAME"
echo "Database:         $DB_NAME"
echo "User:             $DB_USER"
echo "Password:         $DB_PASSWORD"
echo ""
echo "Connection string:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@$INSTANCE_IP:5432/$DB_NAME"
echo ""
echo "For Cloud Run (use connection name):"
echo "  postgresql://$DB_USER:$DB_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"
echo ""

# Step 7: Deploy schema + enable pgvector
echo "[7/7] Deploying schema..."
echo "Run the following to deploy schema.sql:"
echo ""
echo "  psql \"postgresql://$DB_USER:$DB_PASSWORD@$INSTANCE_IP:5432/$DB_NAME\" -f server/db/schema.sql"
echo ""
echo "Or via Cloud SQL proxy:"
echo "  cloud-sql-proxy $CONNECTION_NAME &"
echo "  psql \"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME\" -f server/db/schema.sql"
echo ""

# Save connection details to .env
echo ""
echo "Adding to .env file..."
cat >> .env << ENVEOF

# === Cloud SQL (PostgreSQL) ===
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME
DATABASE_PUBLIC_URL=postgresql://$DB_USER:$DB_PASSWORD@$INSTANCE_IP:5432/$DB_NAME
CLOUD_SQL_CONNECTION_NAME=$CONNECTION_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
ENVEOF

echo "Connection details saved to .env"
echo ""
echo "=========================================="
echo "  DONE! Next steps:"
echo "=========================================="
echo "1. Deploy schema:  psql \$DATABASE_PUBLIC_URL -f server/db/schema.sql"
echo "2. Update cloudbuild.yaml to pass DATABASE_URL"
echo "3. Remove public IP after setup:  gcloud sql instances patch $INSTANCE_NAME --no-assign-ip"
echo ""
