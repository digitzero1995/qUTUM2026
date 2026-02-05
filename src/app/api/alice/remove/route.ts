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

function writeIncoming(data: Record<string, any>) {
  try {
    fs.writeFileSync(INCOMING_FILE, JSON.stringify(data, null, 2), { encoding: 'utf-8', flag: 'w' });
  } catch (e) {
    console.error('Failed writing incoming file', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const accountId = body.accountId;
    const tradeIds: string[] = Array.isArray(body.tradeIds) ? body.tradeIds : [];

    if (!accountId) {
      return NextResponse.json({ ok: false, message: 'accountId required' }, { status: 400 });
    }

    const incoming = readIncoming();
    const list = Array.isArray(incoming[accountId]) ? incoming[accountId] : [];

    if (tradeIds.length === 0) {
      const removed = list.length;
      incoming[accountId] = [];
      writeIncoming(incoming);
      return NextResponse.json({ ok: true, removed });
    }

    const before = list.length;
    const filtered = list.filter((t: any) => !tradeIds.includes((t && t.id) || ''));
    const removed = before - filtered.length;
    incoming[accountId] = filtered;
    writeIncoming(incoming);

    return NextResponse.json({ ok: true, removed });
  } catch (err: any) {
    console.error('Remove endpoint error', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Unknown' }, { status: 500 });
  }
}
