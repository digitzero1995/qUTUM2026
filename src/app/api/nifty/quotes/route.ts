import { NextResponse } from 'next/server';

// NIFTY instruments mapping to trading symbols
const NIFTY_INSTRUMENTS = [
  { symbol: 'FINNIFTY', name: 'FINNIFTY', yahooSymbol: '^NSEFINITX', finnhubSymbol: 'FINNIFTY', exchange: 'NSE' },
  { symbol: 'BANKNIFTY', name: 'BANKNIFTY', yahooSymbol: '^NSEBANK', finnhubSymbol: 'BANKNIFTY', exchange: 'NSE' },
  { symbol: 'NIFTY50', name: 'NIFTY 50', yahooSymbol: '^NSEI', finnhubSymbol: 'NIFTY', exchange: 'NSE' },
  { symbol: 'SENSEX', name: 'SENSEX', yahooSymbol: '^BSESN', finnhubSymbol: 'SENSEX', exchange: 'BSE' },
  { symbol: 'MIDCPNIFTY', name: 'MIDCPNIFTY', yahooSymbol: '^NSMIDCP', finnhubSymbol: 'MIDCPNIFTY', exchange: 'NSE' },
  { symbol: 'NIFTYNXT50', name: 'NIFTY NEXT 50', yahooSymbol: '^NIFNX50', finnhubSymbol: 'NIFTYNXT50', exchange: 'NSE' },
  { symbol: 'NIFTYIT', name: 'NIFTY IT', yahooSymbol: '^NSEITALGO', finnhubSymbol: 'NIFTYIT', exchange: 'NSE' },
  { symbol: 'NIFTYAUTO', name: 'NIFTY AUTO', yahooSymbol: '^NSEAUTO', finnhubSymbol: 'NIFTYAUTO', exchange: 'NSE' },
];

// Cache for quotes to avoid excessive API calls
let quoteCache: any = {};
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 seconds

async function fetchLiveQuotes() {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (lastFetchTime && (now - lastFetchTime) < CACHE_DURATION && Object.keys(quoteCache).length > 0) {
    return quoteCache;
  }

  try {
    // Try fetching from Yahoo Finance API (free, no key required)
    const quotes: any = {};
    
    for (const inst of NIFTY_INSTRUMENTS) {
      try {
        // Use yfinance-like endpoint or direct fetch
        const response = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${inst.yahooSymbol}?modules=price`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const price = data?.quoteSummary?.result?.[0]?.price;
          
          if (price) {
            quotes[inst.symbol] = {
              symbol: inst.symbol,
              name: inst.name,
              exchange: inst.exchange,
              currentPrice: price.regularMarketPrice || price.preMarketPrice || 0,
              change: price.regularMarketChange || 0,
              changePercent: price.regularMarketChangePercent || 0,
              timestamp: new Date().toISOString(),
            };
          }
        }
      } catch (err) {
        console.error(`Failed to fetch ${inst.symbol} from Yahoo Finance:`, err);
      }
    }
    
    // If we got some quotes, cache and return them
    if (Object.keys(quotes).length > 0) {
      quoteCache = quotes;
      lastFetchTime = now;
      return quotes;
    }
  } catch (err) {
    console.error('Error fetching from Yahoo Finance:', err);
  }

  // Fallback: Try alternative endpoint or return cached data
  return quoteCache;
}

export async function GET() {
  try {
    // Fetch live quotes
    const quoteMap = await fetchLiveQuotes();
    
    // Build instruments array with live data or fallback to defaults
    const instruments = NIFTY_INSTRUMENTS.map(inst => {
      const liveData = quoteMap[inst.symbol];
      
      if (liveData) {
        return liveData;
      }
      
      // Fallback data if API fails
      const fallbackData: any = {
        FINNIFTY: { currentPrice: 27689.35, change: -113.20, changePercent: -0.41 },
        BANKNIFTY: { currentPrice: 60063.65, change: -174.50, changePercent: -0.29 },
        NIFTY50: { currentPrice: 25642.80, change: -133.20, changePercent: -0.52 },
        SENSEX: { currentPrice: 83313.93, change: -503.76, changePercent: -0.60 },
        MIDCPNIFTY: { currentPrice: 15840.50, change: -85.30, changePercent: -0.54 },
        NIFTYNXT50: { currentPrice: 19285.70, change: -98.40, changePercent: -0.51 },
        NIFTYIT: { currentPrice: 15468.20, change: 145.80, changePercent: 0.95 },
        NIFTYAUTO: { currentPrice: 21245.35, change: -125.60, changePercent: -0.59 },
      };
      
      const fallback = fallbackData[inst.symbol as keyof typeof fallbackData] || {};
      
      return {
        symbol: inst.symbol,
        name: inst.name,
        exchange: inst.exchange,
        currentPrice: fallback.currentPrice || 0,
        change: fallback.change || 0,
        changePercent: fallback.changePercent || 0,
        timestamp: new Date().toISOString(),
        source: 'fallback',
      };
    });

    return NextResponse.json({ 
      instruments, 
      timestamp: new Date().toISOString(),
      cacheAge: Date.now() - lastFetchTime,
    });
  } catch (err: any) {
    console.error('Failed to fetch NIFTY quotes', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
