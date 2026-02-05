import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';

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

export async function GET() {
  try {
    const incoming = readIncoming();
    // Flatten into array with account field
    const flattened: any[] = [];
    Object.keys(incoming).forEach((accountId) => {
      const arr = Array.isArray(incoming[accountId]) ? incoming[accountId] : [];
      arr.forEach((t: any) => flattened.push({ ...t, account: accountId }));
    });

    return NextResponse.json({ incoming, trades: flattened });
  } catch (err: any) {
    console.error('Failed to read incoming trades', err);
    return NextResponse.json({ error: err?.message ?? 'Unknown' }, { status: 500 });
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-qa-secret',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function writeIncoming(data: Record<string, any>) {
  try {
    fs.writeFileSync(INCOMING_FILE, JSON.stringify(data, null, 2), { encoding: 'utf-8', flag: 'w' });
  } catch (e) {
    console.error('Failed writing incoming file', e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const secret = req.headers.get('x-qa-secret') || '';
    const expected = process.env.QUANTUM_ALPHA_SECRET || '';
    if (!expected || secret !== expected) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const body = await req.json().catch(() => ({}));
    const accountId = body.accountId;
    const tradeIds: string[] = Array.isArray(body.tradeIds) ? body.tradeIds : [];

    if (!accountId) {
      return NextResponse.json({ ok: false, message: 'accountId required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const incoming = readIncoming();
    const list = Array.isArray(incoming[accountId]) ? incoming[accountId] : [];

    if (tradeIds.length === 0) {
      // clear all for account
      const removed = list.length;
      incoming[accountId] = [];
      writeIncoming(incoming);
      return NextResponse.json({ ok: true, removed }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // remove specified ids
    const before = list.length;
    const filtered = list.filter((t: any) => !tradeIds.includes((t && t.id) || ''));
    const removed = before - filtered.length;
    incoming[accountId] = filtered;
    writeIncoming(incoming);

    return NextResponse.json({ ok: true, removed }, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (err: any) {
    console.error('Failed to delete incoming trades', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Unknown' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
