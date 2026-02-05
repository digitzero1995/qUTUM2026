document.addEventListener('DOMContentLoaded', () => {
  const server = document.getElementById('server');
  const accountId = document.getElementById('accountId');
  const secret = document.getElementById('secret');
  const save = document.getElementById('save');
  const test = document.getElementById('test');

  chrome.storage.local.get(['qa_server','qa_accountId','qa_secret'], (res) => {
    server.value = res.qa_server || 'https://quantumalphaindia.com/api/alice/push';
    accountId.value = res.qa_accountId || '';
    secret.value = res.qa_secret || '7rG082hYyvKYDvy4YLJeVmyru4WB6W5GfFudhquSG62ZnW6NN7LE43ZesamzYL8bVidSjRhlp39nQH6hvfEMEuT1Ap87uhtKq2in';
  });

  save.addEventListener('click', () => {
    chrome.storage.local.set({ qa_server: server.value, qa_accountId: accountId.value, qa_secret: secret.value }, () => {
      alert('Saved');
    });
  });

  test.addEventListener('click', async () => {
    if (!server.value || !accountId.value || !secret.value) {
      alert('Please fill in all fields (Server, Account ID, Secret)');
      return;
    }
    try {
      const res = await fetch(server.value, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-qa-secret': secret.value },
        body: JSON.stringify({ 
          accountId: accountId.value, 
          trades: [{
            id: `QA-TEST-${Date.now()}`, 
            timestamp: new Date().toISOString(), 
            symbol: 'TEST', 
            quantity: 1, 
            price: 1, 
            side: 'Buy', 
            status: 'Filled' 
          }] 
        })
      });
      const j = await res.json();
      if (res.ok) {
        alert('✓ Test push successful! Trade received by server.');
      } else {
        alert('✗ Server rejected: ' + (j.message || JSON.stringify(j)));
      }
    } catch (e) {
      alert('✗ Test failed: ' + e.message + '\n\nMake sure:\n- Server URL is correct\n- Server is running\n- CORS is enabled\n- No proxy firewall');
    }
  });
});
    // Get detected trades from content script
    let detectedTrades = [];

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getTrades' }, (response) => {
        if (response && response.trades) {
          detectedTrades = response.trades;
          document.getElementById('tradeCount').textContent = detectedTrades.length;
        }
      });
    });

    const pushAll = document.getElementById('pushAll');
    pushAll.addEventListener('click', async () => {
      if (!server.value || !accountId.value || !secret.value) {
        alert('Please fill in all fields first and click Save');
        return;
      }

      if (detectedTrades.length === 0) {
        alert('No trades detected on this page.\n\nMake sure you are on the Trade Book page.');
        return;
      }

      try {
        pushAll.disabled = true;
        pushAll.textContent = 'Pushing...';

        const res = await fetch(server.value, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-qa-secret': secret.value },
          body: JSON.stringify({
            accountId: accountId.value,
            trades: detectedTrades
          })
        });

        const j = await res.json();

        if (res.ok) {
          alert(`✓ Success! Pushed ${j.received || detectedTrades.length} trades to your website.\n\nCheck your dashboard!`);
          pushAll.textContent = 'Push All Trades';
        } else {
          alert('✗ Server error: ' + (j.message || JSON.stringify(j)));
          pushAll.textContent = 'Push All Trades';
        }
      } catch (e) {
        alert('✗ Push failed: ' + e.message);
        pushAll.textContent = 'Push All Trades';
      } finally {
        pushAll.disabled = false;
      }
    });
