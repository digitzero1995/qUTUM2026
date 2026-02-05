# QuantumAlphaIn Real-Time Integration Guide

## Overview
Master can connect Alice Blue trading account via the **QuantumAlphaIn** Chrome extension. The extension scrapes live trades from the Alice Blue Trading page and pushes them to your Quantum dashboard in real-time via SSE (Server-Sent Events). The dashboard displays trades instantly without polling.

## Architecture
```
Alice Blue (Trading Page)
  ↓
  ├─ Extension Content Script (scrapes trades)
  └─ Extension Popup (configuration)
        ↓
        POST /api/alice/push (with secret auth)
        ↓
    Your Server persists to .alice.incoming.json
        ↓
    SSE Stream /api/alice/trades-stream broadcasts to dashboard
        ↓
    Dashboard displays instantly (or falls back to polling)
```

## Server Setup

### 1. Start the server with the secret
```bash
QUANTUM_ALPHA_SECRET=your-strong-secret npm run dev
```
(Replace `your-strong-secret` with a strong passphrase)

### 2. Files created
- **Push Endpoint:** `POST /api/alice/push` — accepts trades from extension
- **SSE Stream:** `GET /api/alice/trades-stream` — real-time trade updates to dashboard
- **Incoming Trades:** `GET /api/alice/incoming` — fetch all pushed trades
- **Storage:** `.alice.incoming.json` — persists incoming trades

---

## Extension Setup

### 1. Install the extension locally (development)
1. Go to **Chrome → Extensions** → Enable "Developer Mode" (top-right toggle)
2. Click "Load unpacked"
3. Select folder: `extension/quantum-alpha-in/`
4. The extension is now installed

### 2. Configure the extension
1. Click the extension icon in Chrome toolbar
2. Fill in:
   - **Server Endpoint:** `http://localhost:9002/api/alice/push` (local dev)
   - **Account ID:** The Master account ID you created in the app (e.g., `MASTER-001`)
   - **Secret:** Same secret you set in env var `QUANTUM_ALPHA_SECRET`
3. Click **Save**
4. Click **Test Push** to verify connection
   - ✓ If successful, message says "Trade received by server"
   - ✗ If failed, check console errors and settings

### 3. Use the extension
1. Navigate to **https://ant.aliceblueonline.com/home?tab=Trading** (Trade Book page)
2. The extension automatically detects and scrapes orders from the table
3. Trades are pushed to your server every 1-2 seconds (rate-limited)
4. Check your dashboard — new trades appear in real-time in the "Master Account Trade Calls" section

---

## Dashboard Updates

### Real-Time Data Flow
1. **SSE Stream Preferred:** If supported, dashboard opens SSE connection and receives trades instantly
2. **Polling Fallback:** If SSE fails, dashboard polls every 5 seconds (automatic)
3. **Data Merge:** Upstream trades (from OAuth) + extension-pushed trades are merged and deduplicated

### Test the flow
```bash
# Push a test trade
curl -X POST http://localhost:9002/api/alice/push \
  -H 'Content-Type: application/json' \
  -H 'x-qa-secret: your-strong-secret' \
  -d '{"accountId":"MASTER-001","trades":[{"id":"T123","timestamp":"2026-02-05T10:00:00Z","symbol":"INFY","quantity":50,"price":1850,"side":"Buy","status":"Filled"}]}'

# Verify stored
cat .alice.incoming.json | jq '.["MASTER-001"]'

# Stream should deliver instantly
curl -N http://localhost:9002/api/alice/trades-stream
```

---

## Troubleshooting

### "Test failed: Failed to fetch"
- [ ] Server is running with `npm run dev`  
- [ ] `QUANTUM_ALPHA_SECRET` matches popup Secret field
- [ ] Server endpoint URL is correct (`http://...` not `https://` for local dev)
- [ ] No proxy/firewall blocking the request
- [ ] Browser console shows CORS errors? Check extension manifest `host_permissions`

### Trades not appearing in dashboard
- [ ] Check that Account ID matches the Master account ID in Account Settings
- [ ] Verify `.alice.incoming.json` exists and has trades
- [ ] Open browser console (F12) → Application → Cookies → ensure extension can access storage
- [ ] If using SSE: check Network tab → `/api/alice/trades-stream` should stay open
- [ ] If not seeing trades: fallback to polling is active; check `/api/alice/incoming` response

### Extension not scraping trades from Alice Blue
- [ ] The page `https://ant.aliceblueonline.com/home?tab=Trading` must be fully loaded
- [ ] Table columns must include: Time, Instrument, Qty, Price, Type
- [ ] Check browser console on Alice page for extension errors
- [ ] If table structure changed, update `content_script.js` selectors

### Production Deployment
- Use `https://` for both extension and server
- Use a strong secret (32+ character random string)
- Run server with env var: `export QUANTUM_ALPHA_SECRET="your-secret"; npm run dev`
- Update extension popup Server Endpoint to your production domain
- Test push works before going live

---

## API Reference

### POST /api/alice/push
**Push trades from extension**
```bash
curl -X POST http://localhost:9002/api/alice/push \
  -H 'Content-Type: application/json' \
  -H 'x-qa-secret: testsecret' \
  -d '{
    "accountId": "MASTER-001",
    "trades": [{
      "id": "QA-001",
      "timestamp": "2026-02-05T10:00:00Z",
      "symbol": "INFY",
      "quantity": 50,
      "price": 1850.25,
      "side": "Buy",
      "status": "Filled"
    }]
  }'
```
**Response:** `{ "ok": true, "received": 1 }`

### GET /api/alice/trades-stream (SSE)
**Real-time trade stream**
```bash
curl -N http://localhost:9002/api/alice/trades-stream
```
Returns event stream with:
- Initial: `{ "type": "initial", "trades": [...] }`
- Updates: Individual trade objects as they arrive

### GET /api/alice/incoming
**Fetch all incoming trades**
```bash
curl http://localhost:9002/api/alice/incoming
```
Returns: `{ "incoming": {...}, "trades": [...] }`

---

## Security Notes
- The `x-qa-secret` header is required; requests without matching secret are rejected (401)
- Keep the secret secure; rotate it if exposed
- HTTPS recommended for production
- Extension runs only on `https://ant.aliceblueonline.com/*` tabs
