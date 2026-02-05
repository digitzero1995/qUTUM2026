import { NextResponse } from 'next/server';
import { buildAuthHeaders } from '@/lib/alice';

export async function GET() {
  const endpoint = process.env.ALICE_TRADES_ENDPOINT || process.env.ALICE_API_BASE_URL;
  const apiKey = process.env.ALICE_API_KEY;
  const apiSecret = process.env.ALICE_API_SECRET;
  const authMethod = process.env.ALICE_AUTH_METHOD;

  if (!endpoint) {
    return NextResponse.json({ ok: false, message: 'ALICE_TRADES_ENDPOINT or ALICE_API_BASE_URL not configured' }, { status: 400 });
  }
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, message: 'ALICE_API_KEY or ALICE_API_SECRET not configured' }, { status: 400 });
  }

  try {
    const headers = buildAuthHeaders(apiKey, apiSecret, authMethod, endpoint);
    const res = await fetch(endpoint, { headers });
    const text = await res.text().catch(() => '');

    // return limited debug info (do not echo credentials)
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      bodySnippet: text.slice(0, 1000),
    }, { status: 200 });
  } catch (err: any) {
    console.error('Alice verify error:', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Unknown error' }, { status: 502 });
  }
}
