# Push Notifications Setup Guide

**Sprint 12 Implementation - Complete this setup to enable push notifications**

---

## 1. Create Airtable Table

Create a new table called `Notification_Settings` in your Airtable base with these fields:

| Field Name | Field Type | Notes |
|------------|------------|-------|
| User ID | Single line text | Primary identifier |
| FCM Token | Long text | Device push token (can be long) |
| Enabled | Checkbox | Master on/off |
| Daily Reminder | Checkbox | Default: checked |
| Daily Reminder Time | Single line text | Format: "HH:MM" (e.g., "20:00") |
| Streak At Risk | Checkbox | Default: checked |
| Weekly Summary | Checkbox | Default: unchecked |
| Updated At | Date | Include time field |

**After creating:** Copy the table ID and add to `.env`:
```
AIRTABLE_NOTIFICATIONS_TABLE_ID=tblXXXXXXXXXXXXXX
```

---

## 2. Get Firebase VAPID Key (Client-side)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click gear icon → **Project Settings**
4. Go to **Cloud Messaging** tab
5. Scroll to **Web configuration** → **Web Push certificates**
6. Click **Generate key pair**
7. Copy the key and add to `.env`:

```
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here
```

---

## 3. Get Firebase Server Key (Backend)

**Option A: Legacy Server Key (simpler)**
1. Same Cloud Messaging tab in Firebase Console
2. Find **Server key** under "Cloud Messaging API (Legacy)"
3. If not visible, enable it via the link provided
4. Copy and add to `.env`:

```
FIREBASE_SERVER_KEY=your-server-key-here
```

**Option B: Firebase Admin SDK (more secure, for production)**
1. Project Settings → Service accounts
2. Generate new private key
3. Save JSON file securely
4. Set environment variable:
```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## 4. Test the Setup

1. Start the dev server: `npm run dev`
2. Go to Profile page (`/profile`)
3. Click "Enable" on Notifications section
4. Browser should ask for permission
5. Check browser console for "[Notifications]" logs

---

## Files Created in Sprint 12

| File | Purpose |
|------|---------|
| `public/firebase-messaging-sw.js` | Service worker for background notifications |
| `src/lib/notifications.ts` | FCM token management |
| `src/hooks/useNotifications.ts` | React hook for notification state |
| `src/components/notifications/NotificationSettings.tsx` | Settings UI |
| `server/routes/notifications.ts` | Backend API endpoints |

---

## API Endpoints

```
POST /api/notifications/register     - Register FCM token
PUT  /api/notifications/preferences  - Update preferences
POST /api/notifications/send         - Send notification (internal use)
GET  /api/notifications/settings/:id - Get user settings
```

---

## Optional: Skip Airtable (Local Storage Only)

If you want notifications to work without the Airtable table, preferences will be stored in localStorage only. The backend registration will fail silently but local notifications will still work.

---

## Troubleshooting

**"Push notifications not supported"**
- Must be on HTTPS (or localhost)
- Check browser supports Push API

**"VAPID key not configured"**
- Add `VITE_FIREBASE_VAPID_KEY` to `.env`
- Restart dev server

**"Failed to get FCM token"**
- Check Firebase project has Cloud Messaging enabled
- Verify VAPID key is correct

**Backend send fails**
- Check `FIREBASE_SERVER_KEY` is set
- Verify key hasn't been revoked
