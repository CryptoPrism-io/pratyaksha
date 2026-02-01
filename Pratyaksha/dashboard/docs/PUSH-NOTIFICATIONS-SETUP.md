# Push Notifications Setup Guide

**Complete this setup to enable push notifications for Pratyaksha/Becoming**

---

## 1. Create Airtable Table

Create a table called `Notification_Settings` in your Airtable base with these fields:

| Field Name | Field Type | Notes |
|------------|------------|-------|
| User ID | Single line text | Firebase UID |
| FCM Token | Long text | Device push token |
| Enabled | Checkbox | Master on/off |
| Timezone | Single line text | IANA timezone (e.g., "Asia/Kolkata") |
| Frequency | Single line text | "hourly", "3x_daily", "2x_daily", "1x_daily" |
| Custom Times | Single line text | Comma-separated (e.g., "09:00,20:00") |
| Quiet Hours Start | Single line text | Format: "HH:MM" (e.g., "22:00") |
| Quiet Hours End | Single line text | Format: "HH:MM" (e.g., "07:00") |
| Streak At Risk | Checkbox | Alert when streak might be lost |
| Weekly Summary | Checkbox | Send weekly insights on Sunday |
| Last Notified | Date (with time) | Last notification sent |
| Updated At | Date (with time) | Last settings update |

**After creating:** Copy the table ID from URL and add to `.env`:
```bash
AIRTABLE_NOTIFICATIONS_TABLE_ID=tblXXXXXXXXXXXXXX
```

---

## 2. Get Firebase VAPID Key (Client-side)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Project Settings** (gear icon)
3. Go to **Cloud Messaging** tab
4. Scroll to **Web Push certificates**
5. Click **Generate key pair**
6. Copy the key and add to `.env`:

```bash
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here
```

---

## 3. Firebase Admin SDK (Backend)

The backend uses Firebase Admin SDK with Application Default Credentials (ADC).

**For Cloud Run (Production):**
- ADC works automatically via the service account

**For Local Development:**
1. Go to Firebase Console → Project Settings → Service accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Set environment variable:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## 4. Set Up Cloud Scheduler (Hourly Cron)

Create a Cloud Scheduler job to trigger notifications hourly:

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create scheduler job
gcloud scheduler jobs create http pratyaksha-notifications \
  --schedule="0 * * * *" \
  --uri="https://YOUR_CLOUD_RUN_URL/api/cron/notifications" \
  --http-method=POST \
  --headers="X-Cron-Secret=YOUR_CRON_SECRET,Content-Type=application/json" \
  --location=asia-south1 \
  --time-zone="UTC" \
  --description="Hourly notification scheduler for Pratyaksha"
```

Add cron secret to `.env`:
```bash
CRON_SECRET=your-random-secret-here
```

**Test manually:**
```bash
gcloud scheduler jobs run pratyaksha-notifications --location=asia-south1
```

---

## 5. Test the Setup

1. Start the dev server: `npm run dev`
2. Go to Profile page (`/profile`)
3. Click "Enable" on Notifications section
4. Browser should ask for permission
5. Check browser console for `[Notifications]` logs
6. Check Airtable table for new record

---

## Environment Variables Summary

```bash
# Client-side (VITE_ prefix)
VITE_FIREBASE_VAPID_KEY=your-vapid-key

# Server-side
AIRTABLE_NOTIFICATIONS_TABLE_ID=tblXXXXXXXX
CRON_SECRET=your-random-secret

# For local development only
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## Files Overview

| File | Purpose |
|------|---------|
| `public/firebase-messaging-sw.js` | Service worker for background notifications |
| `src/lib/notifications.ts` | FCM token management, permission handling |
| `src/hooks/useNotifications.ts` | React hook for notification state |
| `src/components/notifications/NotificationSettings.tsx` | Settings UI component |
| `server/routes/notifications.ts` | Backend API endpoints + cron handler |
| `server/lib/notificationScheduler.ts` | Timezone-aware scheduling logic |

---

## API Endpoints

```
POST /api/notifications/register      - Register FCM token + preferences
PUT  /api/notifications/preferences   - Update preferences
GET  /api/notifications/settings/:uid - Get user settings
POST /api/notifications/send          - Send notification (internal)
POST /api/notifications/test          - Test notification
POST /api/cron/notifications          - Hourly cron (Cloud Scheduler)
```

---

## Notification Types

| Type | Trigger | Content |
|------|---------|---------|
| Daily Reminder | Scheduled times | "Good morning! Take a moment to capture your thoughts" |
| Streak at Risk | Evening if no entry | "Your streak might be lost!" |
| Weekly Summary | Sunday | "Get your weekly insights" |

---

## Troubleshooting

**"Push notifications not supported"**
- Must be on HTTPS (or localhost)
- Check browser supports Push API (not Safari iOS)

**"VAPID key not configured"**
- Add `VITE_FIREBASE_VAPID_KEY` to `.env`
- Restart dev server

**"Failed to get FCM token"**
- Check Firebase Cloud Messaging is enabled
- Verify VAPID key is correct
- Check service worker registered at `/firebase-messaging-sw.js`

**Notifications not sending (cron)**
- Check Cloud Scheduler job exists and is ENABLED
- Verify `X-Cron-Secret` header matches `CRON_SECRET` env var
- Check Cloud Run logs for errors

**Backend send fails**
- Check Firebase Admin SDK initialized
- Verify ADC or service account configured
- Check FCM token is valid (tokens expire)
