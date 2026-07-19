#!/usr/bin/env bash
# =============================================================================
# Deploy the pratyaksha container to AWS Lightsail from the :latest ECR image.
# Env is injected from Secrets Manager (/cryptoprism/pratyaksha/*). Run from CI
# (GitHub Actions) or locally with AWS creds configured. Assumes the image has
# already been built + pushed to ECR.
# =============================================================================
set -euo pipefail
REGION="${AWS_REGION:-us-east-1}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

sec() { aws secretsmanager get-secret-value --secret-id "/cryptoprism/pratyaksha/$1" --region "$REGION" --query SecretString --output text; }

# 1. Allow the Lightsail ECR puller principal to pull the private image.
PRINCIPAL="$(aws lightsail get-container-services --service-name pratyaksha --region "$REGION" \
  --query "containerServices[0].privateRegistryAccess.ecrImagePullerRole.principalArn" --output text)"
if [ -z "$PRINCIPAL" ] || [ "$PRINCIPAL" = "None" ]; then echo "ERROR: ECR puller principal not ready"; exit 1; fi
cat > "$TMP/ecr-policy.json" <<EOF
{ "Version": "2012-10-17", "Statement": [ { "Sid": "AllowLightsailPull", "Effect": "Allow",
  "Principal": {"AWS": "$PRINCIPAL"}, "Action": ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"] } ] }
EOF
aws ecr set-repository-policy --repository-name pratyaksha --policy-text "file://$TMP/ecr-policy.json" --region "$REGION" >/dev/null

# 2. Pull runtime secret values (exported for the python heredoc; never echoed).
export DATABASE_URL="$(sec DATABASE_URL)"
export OPENROUTER_API_KEY="$(sec OPENROUTER_API_KEY)"
export GROQ_API_KEY="$(sec GROQ_API_KEY)"
export GEMINI_API_KEY="$(sec GEMINI_API_KEY)"
export AIRTABLE_API_KEY="$(sec AIRTABLE_API_KEY)"
export AIRTABLE_BASE_ID="$(sec AIRTABLE_BASE_ID)"
export AIRTABLE_TABLE_ID="$(sec AIRTABLE_TABLE_ID)"
export AIRTABLE_USER_PROFILES_TABLE_ID="$(sec AIRTABLE_USER_PROFILES_TABLE_ID)"
export AIRTABLE_NOTIFICATIONS_TABLE_ID="$(sec AIRTABLE_NOTIFICATIONS_TABLE_ID)"
export CRON_SECRET="$(sec CRON_SECRET)"

# 3. Build the deployment config.
python3 - "$TMP" <<'PYEOF'
import json, os, sys
tmp = sys.argv[1]
env = {
  "NODE_ENV": "production", "PORT": "8080",
  "DB_HOST": "dbcp-aws.ci348o64i4ep.us-east-1.rds.amazonaws.com",
  "VITE_FIREBASE_PROJECT_ID": "pratyaksha-3f089",
}
for k in ["DATABASE_URL","OPENROUTER_API_KEY","GROQ_API_KEY","GEMINI_API_KEY",
          "AIRTABLE_API_KEY","AIRTABLE_BASE_ID","AIRTABLE_TABLE_ID",
          "AIRTABLE_USER_PROFILES_TABLE_ID","AIRTABLE_NOTIFICATIONS_TABLE_ID","CRON_SECRET"]:
    env[k] = os.environ[k]
containers = {"app": {
  "image": "405633560616.dkr.ecr.us-east-1.amazonaws.com/pratyaksha:latest",
  "ports": {"8080": "HTTP"}, "environment": env }}
endpoint = {"containerName": "app", "containerPort": 8080,
  "healthCheck": {"path": "/health", "intervalSeconds": 10, "timeoutSeconds": 5,
                  "healthyThreshold": 2, "unhealthyThreshold": 5, "successCodes": "200"}}
open(tmp + "/ls-containers.json", "w").write(json.dumps(containers))
open(tmp + "/ls-endpoint.json", "w").write(json.dumps(endpoint))
PYEOF

# 4. Deploy.
aws lightsail create-container-service-deployment \
  --service-name pratyaksha \
  --containers "file://$TMP/ls-containers.json" \
  --public-endpoint "file://$TMP/ls-endpoint.json" \
  --region "$REGION" \
  --query "containerService.{state:state,deploymentState:currentDeployment.state}" --output json
echo "DEPLOY SUBMITTED"
