import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getTradesForAccount } from '@/lib/alice';
import { broadcastTrade } from '../trades-stream/route';

const TOKENS_FILE = process.env.ALICE_OAUTH_TOKENS_FILE || '.alice.tokens.json';
const INCOMING_FILE = process.env.QUANTUM_ALPHA_INCOMING_FILE || '.alice.incoming.json';

function readTokens(): Record<string, string> {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8') || '{}');
    }
  } catch (e) {
    console.error('Failed reading tokens file', e);
  }
  return {};
}

function readIncoming(): Record<string, any[]> {
  try {
    if (fs.existsSync(INCOMING_FILE)) {
      return JSON.parse(fs.readFileSync(INCOMING_FILE, 'utf-8') || '{}');
    }
  } catch (e) {
    console.error('Failed reading incoming file', e);
  }
  return {};
}

function writeIncoming(data: Record<string, any[]>) {
  try {
    fs.writeFileSync(INCOMING_FILE, JSON.stringify(data, null, 2), { encoding: 'utf-8', flag: 'w' });
  } catch (e) {
    console.error('Failed writing incoming file', e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tokens = readTokens();
    const accountIds = Object.keys(tokens);
    if (accountIds.length === 0) return NextResponse.json({ ok: true, message: 'no accounts' });

    const incoming = readIncoming();

    let totalNew = 0;
    for (const accId of accountIds) {
      try {
        const trades = await getTradesForAccount(accId);
        incoming[accId] = incoming[accId] || [];
        const existingIds = new Set((incoming[accId] || []).map(t => t.id));
        const newTrades = [];
        trades.forEach(t => {
          const id = t.id || `A-${Date.now()}-${Math.floor(Math.random()*100000)}`;
          if (!existingIds.has(id)) {
            const tr = { ...t, id };
            incoming[accId].push(tr);
            newTrades.push(tr);
            totalNew++;
          }
        });

        // Broadcast new trades
        newTrades.forEach(nt => broadcastTrade({ ...nt, account: accId }));
      } catch (e) {
        console.error('Failed fetching trades for', accId, e);
      }
    }

    writeIncoming(incoming);
    return NextResponse.json({ ok: true, newTrades: totalNew });
  } catch (err: any) {
    console.error('Poll error', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
