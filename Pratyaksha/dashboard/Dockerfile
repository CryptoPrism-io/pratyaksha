# Pratyaksha - Unified Dashboard + Blog + Research
# Multi-stage build for Cloud Run

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build args for Vite
ARG VITE_AIRTABLE_API_KEY
ARG VITE_AIRTABLE_BASE_ID
ARG VITE_AIRTABLE_TABLE_ID
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_VAPID_KEY

# Set as environment variables for build
ENV VITE_AIRTABLE_API_KEY=$VITE_AIRTABLE_API_KEY
ENV VITE_AIRTABLE_BASE_ID=$VITE_AIRTABLE_BASE_ID
ENV VITE_AIRTABLE_TABLE_ID=$VITE_AIRTABLE_TABLE_ID
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source
COPY . .

# Build frontend and server
RUN npm run build && npm run build:server

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Mark server directory as CommonJS
RUN echo '{"type": "commonjs"}' > dist/server/package.json

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose Cloud Run port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start the server
CMD ["node", "dist/server/index.js"]
