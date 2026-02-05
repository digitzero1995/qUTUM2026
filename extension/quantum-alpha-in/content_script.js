// QuantumAlphaIn content script
// - Observes the trading table on Alice Blue trading page and pushes trades to configured server

(function () {
  const DEFAULT_ENDPOINT = 'https://quantumalphaindia.com/api/alice/push';
  const DEFAULT_SECRET = 'testsecret';

  async function getConfig() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(['qa_server', 'qa_accountId', 'qa_secret'], (res) => {
          resolve({
            server: res.qa_server || DEFAULT_ENDPOINT,
            accountId: res.qa_accountId || 'Master',
            secret: res.qa_secret || DEFAULT_SECRET
          });
        });
      } catch (e) {
        resolve({ server: DEFAULT_ENDPOINT, accountId: 'Master', secret: DEFAULT_SECRET });
      }
    });
  }

  // Store last detected trades for popup to request
  let lastDetectedTrades = [];

  function parseTimeToISO(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return new Date().toISOString();
    const s = timeStr.trim();
    // Match formats like 14:09:30, 14:09, 2:09:30 PM, 02:09 PM
    const m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!m) {
      // try extracting numbers fallback
      const nm = s.match(/(\d{1,2}):(\d{2})/);
      if (!nm) return new Date().toISOString();
    }
    try {
      const now = new Date();
      let hours = parseInt(m[1], 10);
      const minutes = parseInt(m[2] || '0', 10);
      const seconds = parseInt(m[3] || '0', 10);
      const ampm = m[4];
      if (ampm) {
        const up = ampm.toUpperCase();
        if (up === 'PM' && hours < 12) hours += 12;
        if (up === 'AM' && hours === 12) hours = 0;
      }
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds, 0);
      return d.toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  }

  function extractTradesFromDOM() {

    // Parse Trade Book table: Time, Type, Instrument, Product, Qty, Traded Qty, Price
    const trades = [];
    const tables = document.querySelectorAll('table');
    
    tables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(t => t.textContent?.trim().toLowerCase() || '');
      const headerString = headers.join('|');
      
      // Match Trade Book table by any of these headers
      if (headerString.includes('time') || headerString.includes('instrument') || headerString.includes('type')) {
        // Build flexible index map
        const idx = {
          time: headers.findIndex(h => h.includes('time')),
          type: headers.findIndex(h => h.includes('type') && !h.includes('quantity')),
          instrument: headers.findIndex(h => h.includes('instrument') || h.includes('scrip')),
          qty: headers.findIndex(h => (h.includes('qty') || h.includes('quantity')) && !h.includes('traded')),
          tradedQty: headers.findIndex(h => h.includes('traded')),
          price: headers.findIndex(h => h.includes('price')),
        };

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((tr, rowIdx) => {
          try {
            const cells = Array.from(tr.querySelectorAll('td'));
            if (cells.length < 3) return; // Skip empty rows
            
            const get = (i) => (i >= 0 && cells[i] ? (cells[i].textContent || '').trim() : '');

            // Extract data with fallback logic
            let time = get(idx.time);
            let type = get(idx.type);
            let instrument = get(idx.instrument);
            let rawQty = get(idx.qty) || '';
            let rawPrice = get(idx.price) || '';

            // Fallback: if main indices failed, try sequential positions
            if (!instrument || !rawPrice) {
              // Try common Trade Book structure: time, type, instrument, product, qty, traded_qty, price
              instrument = instrument || get(2) || get(1) || '';
              rawQty = rawQty || get(4) || get(3) || '';
              rawPrice = rawPrice || get(6) || get(5) || '';
            }

            // Try to get type from badge/colored elements
            if (!type) {
              const badge = tr.querySelector('[class*="badge"], [class*="bg-"], span[style*="color"], span[class*="text-"]');
              if (badge) type = badge.textContent.trim();
            }

            // Default time to current if missing
            if (!time) time = new Date().toLocaleTimeString();

            // Parse numbers more robustly
            const qtyMatch = rawQty.match(/\d+\.?\d*/);
            const priceMatch = rawPrice.match(/\d+\.?\d*/);
            
            const qty = qtyMatch ? parseFloat(qtyMatch[0]) : 0;
            const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

            // Determine side (Buy/Sell)
            const side = /sell/i.test(type) || /sell/i.test(tr.className) ? 'Sell' : 'Buy';

            // Only add if we have symbol and price
            if (instrument && instrument.length > 0 && price > 0) {
              const symbolMatch = instrument.match(/^[A-Z0-9&\-]+/);
              const symbol = symbolMatch ? symbolMatch[0] : instrument;
              
              trades.push({
                id: `QA-${Date.now()}-${Math.floor(Math.random()*100000)}-${rowIdx}`,
                timestamp: parseTimeToISO(time),
                symbol: symbol,
                quantity: qty || 1,
                price: price,
                side,
                status: 'Filled',
                type: 'Market'
              });
            }
          } catch (e) {
            console.warn('Failed to parse row', rowIdx, e);
          }
        });
      }
    });
    
    return trades;
  }

  let lastSend = 0;
  let lastTradeIds = new Set();
  
  async function pushTrades(trades, config) {
    if (!trades || trades.length === 0) return;
    
    // Dedupe: only push new trades
    const newTrades = trades.filter(t => !lastTradeIds.has(t.id));
    if (newTrades.length === 0) return;
    
    // basic rate limit
    const now = Date.now();
    if (now - lastSend < 2000) return;
    lastSend = now;
    
    // Update tracking
    newTrades.forEach(t => lastTradeIds.add(t.id));
    
    try {
      const res = await fetch(config.server, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-qa-secret': config.secret || ''
        },
        body: JSON.stringify({ accountId: config.accountId, trades: newTrades })
      });
      const json = await res.json().catch(() => ({}));
      console.log(`[QuantumAlphaIn] Pushed ${newTrades.length} trades to ${config.accountId}:`, newTrades, 'Response:', json);
    } catch (e) {
      console.error('[QuantumAlphaIn] Push failed:', e);
    }
  }

  async function scanAndPush() {
    try {
      const config = await getConfig();
      const trades = extractTradesFromDOM();
       lastDetectedTrades = trades; // Store for popup
      if (trades.length > 0) {
        console.log(`[QuantumAlphaIn] Detected ${trades.length} trades from Trade Book`);
        await pushTrades(trades, config);
      } else {
        console.log('[QuantumAlphaIn] No trades found in Trade Book table');
      }
    } catch (e) {
      console.error('[QuantumAlphaIn] Scan error:', e);
    }
  }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getTrades') {
        sendResponse({ trades: lastDetectedTrades });
      }
    });

  // Run initial scan after page fully loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[QuantumAlphaIn] DOMContentLoaded, scanning in 1500ms...');
      setTimeout(scanAndPush, 1500);
    });
  } else {
    console.log('[QuantumAlphaIn] Page already loaded, scanning in 1000ms...');
    setTimeout(scanAndPush, 1000);
  }

  // Observe mutations to push new trades (debounced)
  let scanTimeout = null;
  const observer = new MutationObserver(() => {
    if (scanTimeout) clearTimeout(scanTimeout);
    scanTimeout = setTimeout(scanAndPush, 1500); // Debounce: wait 1.5s after mutations stop
  });

  // Observe the body for table changes
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

})();
