# QuantumAlphaIn Trade Book Integration - Fixed & Ready

## What Was Fixed

✅ Extension now targets correct URL: `https://ant.aliceblueonline.com/orders?tab=Trade+Book`
✅ Improved DOM parser with fallback logic to detect Trade Book table structure
✅ Added deduplication to prevent duplicate trades
✅ Better logging to debug scraping issues
✅ CORS fixed on server (`POST /api/alice/push`)
✅ Added debounced mutation observer for real-time trade detection

## How It Works Now

### 1. Extension Scraping
1. Master navigates to **https://ant.aliceblueonline.com/orders?tab=Trade+Book**
2. Extension content script runs and:
   - Parses the Trade Book table (columns: Time, Type, Instrument, Qty, Price, etc.)
   - Extracts trades with symbol, quantity, price, buy/sell type
   - Deduplicates (won't send the same trade twice)
   - Sends new trades to your server via `POST /api/alice/push`

3. Console logs show what was scraped:
   ```
   [QuantumAlphaIn] Detected 5 trades from Trade Book
   [QuantumAlphaIn] Pushed 5 trades to MASTER-001: [...]
   ```

### 2. Server Processing
1. Receives trades at `POST /api/alice/push` with secret auth
2. Stores in `.alice.incoming.json` keyed by account ID
3. Broadcasts to **all** connected dashboard clients via SSE `/api/alice/trades-stream`
4. Dashboard receives in real-time and merges with upstream trades

### 3. Dashboard Display
1. Opens SSE stream to `/api/alice/trades-stream`
2. Receives initial trades + live updates
3. Merges with upstream trades (from OAuth)
4. Displays all in "Master Account Trade Calls" table
5. Falls back to polling if SSE fails

---

## Quick Start / Testing

### Verify Server is Running
```bash
QUANTUM_ALPHA_SECRET=testsecret npm run dev
```

### Test Extension Setup
1. **Reload extension** in Chrome (chrome://extensions)
2. **Open extension popup** - verify settings:
   - Server: `http://localhost:9002/api/alice/push`
   - Account ID: `MASTER-001` (or your Master ID)
   - Secret: `testsecret`
3. **Click "Test Push"** → should succeed with ✓

### Test Scraping
1. Open **https://ant.aliceblueonline.com/orders?tab=Trade+Book** in a new tab
2. Open **Browser Console** (F12 → Console)
3. Look for logs like:
   ```
   [QuantumAlphaIn] Detected 10 trades from Trade Book
   [QuantumAlphaIn] Pushed 10 trades to MASTER-001: [...]
   ```
4. Check server received:
   ```bash
   curl http://localhost:9002/api/alice/incoming | jq '.trades'
   ```

### Verify Dashboard
1. Go to **Dashboard** page in your app
2. Scroll to **"Master Account Trade Calls"** section
3. Should show all trades from Alice Blue Trade Book
4. Trades update in real-time as you navigate Alice Blue

---

## Troubleshooting

### Extension not scraping any trades
- [ ] URL is exactly `https://ant.aliceblueonline.com/orders?tab=Trade+Book`
- [ ] Trade Book table is visible on page (not hidden/loading)
- [ ] Open Browser Console (F12) → check for `[QuantumAlphaIn]` logs
- [ ] If no logs: extension may not have loaded; reload extension and refresh page
- [ ] If logs show "No trades found": try clicking on different table tab, or the table structure may have changed—report the DOM structure

### Trades not appearing on dashboard
- [ ] Check `/api/alice/incoming` returns trades:
  ```bash
  curl http://localhost:9002/api/alice/incoming
  ```
- [ ] If empty, extension isn't pushing; verify extension test passes
- [ ] If trades exist but not on dashboard: refresh dashboard page or restart server

### "Failed to fetch" on extension test
- [ ] Server running with `QUANTUM_ALPHA_SECRET=testsecret`
- [ ] Secret in extension popup matches env var
- [ ] Network tab shows CORS headers: `access-control-allow-origin: *`

---

## API Endpoints

### POST /api/alice/push
Push trades from extension
- Header: `x-qa-secret: testsecret`
- Body: `{ "accountId":"MASTER-001", "trades":[...]}`

### GET /api/alice/incoming
Fetch all pushed trades
```bash
curl http://localhost:9002/api/alice/incoming
```
Returns: `{ "incoming":{...}, "trades":[...] }`

### GET /api/alice/trades-stream (SSE)
Real-time trade stream to dashboard
```bash
curl -N http://localhost:9002/api/alice/trades-stream
```

---

## Next Steps

1. **Production deployment:**
   - Use `https://` for both extension and server
   - Update extension manifest to match production domain
   - Use a strong secret (32+ chars)
   - Set env vars on production server

2. **Fine-tune scraping** if Alice Blue updates their DOM:
   - Check logs for what columns are detected
   - Update `extractTradesFromDOM()` fallback logic if needed

3. **Monitor in production:**
   - Check browser console on Alice Blue page for extension logs
   - Monitor dashboard for incoming trades real-time
   - Check `.alice.incoming.json` for persistence
