import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';

const TOKENS_FILE = process.env.ALICE_OAUTH_TOKENS_FILE || '.alice.tokens.json';
const SECRET = process.env.QUANTUM_ALPHA_SECRET || '';

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

export async function GET(req: NextRequest) {
  // Require x-qa-secret header for security
  const reqSecret = req.headers.get('x-qa-secret') || '';
  if (!SECRET || reqSecret !== SECRET) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const tokens = readTokens();
  const accounts = Object.keys(tokens).map(userId => ({
    userId,
    tokenMask: `${tokens[userId].slice(0, 10)}...${tokens[userId].slice(-4)}`,
  }));

  return NextResponse.json({ ok: true, accounts: accounts.length, list: accounts });
}
