# QuantumAlphaIn

Chrome extension scaffold to scrape Alice Blue trading page and push trades to the Quantum dashboard.

Install locally for development:

1. Build or run the Next app on `http://localhost:9002`.
2. In Chrome, open `chrome://extensions`, enable Developer mode, click "Load unpacked" and select this folder: `extension/quantum-alpha-in`.
3. Open the extension popup, set `Server Endpoint` to `http://localhost:9002/api/alice/push`, set an `Account ID` and a matching `Secret` (must match `QUANTUM_ALPHA_SECRET` env var set for the Next server).
4. Navigate to `https://ant.aliceblueonline.com/home?tab=Trading` and the extension will attempt to scrape a trades table and push data to the server.

Notes:
- Scraping uses heuristics and may need selector tuning for the live site.
- The server endpoint expects header `x-qa-secret` equal to `QUANTUM_ALPHA_SECRET`.
- Incoming trades are saved to `.alice.incoming.json` by the server for inspection.
