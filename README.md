# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Alice Blue integration

This project can fetch live trades from Alice Blue and display them on the Master dashboard. Follow the steps below to enable the integration securely.

Required environment variables (use your host's secret storage; do NOT commit to git):

- `ALICE_API_BASE_URL` — the base API URL (example: `https://api.aliceblueonline.com`)
- `ALICE_TRADES_ENDPOINT` — optional full URL for the trades endpoint (if different from a base + `/trades`)
- `ALICE_API_KEY` and `ALICE_API_SECRET` — your API credentials (placeholders in `.env.local.example`)
- `ALICE_AUTH_METHOD` — authentication method: `headers` (default), `basic`, or `hmac` (provider-specific)
- `ALICE_MASTER_ACCOUNT` — display name for the master account (defaults to `Master`)

Local testing
- For local dev, put credentials in `.env.local` (which should be gitignored). If credentials are missing the app falls back to seeded trades in `src/lib/data.ts`.
- To test the live API from your machine (example header method):

```bash
curl -s -H "x-api-key: $ALICE_API_KEY" -H "x-api-secret: $ALICE_API_SECRET" "$ALICE_TRADES_ENDPOINT"
```

Security & operational notes
- If your credentials were shared publicly, revoke and rotate them immediately before proceeding.
- Use your deployment provider's secrets manager (Vercel, Netlify, CloudPanel, etc.) in production; never store secrets in the repo.
- The client in `src/lib/alice.ts` supports `headers` and `basic` out of the box, and includes a generic `hmac` mode (which you should adapt to the exact provider spec if Alice uses a different signature scheme).
- The implementation includes retries with exponential backoff to reduce transient failures. For production, consider using webhooks or a server-side worker if Alice supports push notifications.

API routes:
- `GET /api/alice/trades` — returns recent master trades (polled by the front-end)
- `GET /api/alice/verify` — server-side verification endpoint: attempts an authenticated fetch and returns status (useful to test credentials without exposing secrets in the browser)

Testing the integration locally
- Add credentials to `.env.local` (do not commit). Then run the dev server:

```bash
npm run dev
```

- Verify the connection (server-side):

```bash
curl -s http://localhost:9002/api/alice/verify | jq
```

Response example (success):

```json
{ "ok": true, "fallback": false, "count": 12 }
```

If `fallback` is `true`, the app is using seeded trades because one of the required env vars is missing.


To get started, take a look at src/app/page.tsx.
