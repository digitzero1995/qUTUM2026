import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import { broadcastTrade } from '../trades-stream/route';

const INCOMING_FILE = process.env.QUANTUM_ALPHA_INCOMING_FILE || '.alice.incoming.json';

function readIncoming(): Record<string, any> {
  try {
    if (fs.existsSync(INCOMING_FILE)) {
      return JSON.parse(fs.readFileSync(INCOMING_FILE, 'utf-8') || '{}');
    }
  } catch (e) {
    console.error('Failed reading incoming file', e);
  }
  return {};
}

function writeIncoming(data: Record<string, any>) {
  try {
    fs.writeFileSync(INCOMING_FILE, JSON.stringify(data, null, 2), { encoding: 'utf-8', flag: 'w' });
  } catch (e) {
    console.error('Failed writing incoming file', e);
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-qa-secret',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-qa-secret') || '';
    const expected = process.env.QUANTUM_ALPHA_SECRET || '';
    if (!expected || secret !== expected) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const body = await req.json().catch(() => ({}));
    const accountId = body.accountId || 'unknown';
    const trades = Array.isArray(body.trades) ? body.trades : [];

    const incoming = readIncoming();
    incoming[accountId] = incoming[accountId] || [];
    // append new trades (caller can dedupe if needed)
    incoming[accountId] = [...incoming[accountId], ...trades];
    writeIncoming(incoming);

    // Broadcast each trade to SSE clients
    trades.forEach((trade: any) => {
      broadcastTrade({ ...trade, account: accountId });
    });

    return NextResponse.json({ ok: true, received: trades.length }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (err: any) {
    console.error('Push endpoint error', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Unknown' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
