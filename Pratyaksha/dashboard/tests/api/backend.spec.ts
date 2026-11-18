// Smoke tests for the Express API. They need no database or AI keys, so they
// run in CI against a locally started server and also against the deployed
// backend:
//
//   API_URL=https://pratyaksha-api.onrender.com npx playwright test --project=api
//
// The cron test needs CRON_SECRET set on the server. Locally and in CI the
// server is started with CRON_SECRET=test-cron-secret (see playwright.config.ts).
import { test, expect } from '@playwright/test'

test.describe('Pratyaksha API', () => {
  test('GET /health returns ok with a current timestamp', async ({ request }) => {
    const res = await request.get('/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    const age = Date.now() - new Date(body.timestamp).getTime()
    expect(Math.abs(age)).toBeLessThan(5 * 60 * 1000)
  })

  test('GET /api/chat/modes lists modes without exposing system prompts', async ({ request }) => {
    const res = await request.get('/api/chat/modes')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.modes)).toBe(true)
    expect(body.modes.length).toBeGreaterThan(0)
    for (const mode of body.modes) {
      expect(typeof mode.id).toBe('string')
      expect(typeof mode.label).toBe('string')
    }
    expect(JSON.stringify(body).toLowerCase()).not.toContain('systemprompt')
  })

  test('cron endpoint rejects requests without the right secret', async ({ request }) => {
    const missing = await request.post('/api/cron/notifications')
    expect(missing.status()).toBe(401)
    const wrong = await request.post('/api/cron/notifications', {
      headers: { 'x-cron-secret': 'definitely-not-the-secret' },
    })
    expect(wrong.status()).toBe(401)
  })

  test('GET /api/notifications/preferences explains the right endpoint', async ({ request }) => {
    const res = await request.get('/api/notifications/preferences')
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('/api/notifications/settings/')
  })

  test('CORS allows the CloudFront frontend to call the API', async ({ request }) => {
    const res = await request.get('/health', {
      headers: { Origin: 'https://dghabvfczocs9.cloudfront.net' },
    })
    expect(res.headers()['access-control-allow-origin']).toBeTruthy()
  })

  test('unknown routes return 404 instead of an HTML app shell', async ({ request }) => {
    const res = await request.get('/this-route-does-not-exist')
    expect(res.status()).toBe(404)
  })
})
