import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import { saveAccountToken } from '@/lib/alice';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const storedState = req.cookies.get('alice_oauth_state')?.value;
  if (!code) return NextResponse.json({ ok: false, message: 'Missing code' }, { status: 400 });
  if (!state || state !== storedState) return NextResponse.json({ ok: false, message: 'Invalid or missing state' }, { status: 400 });

  const tokenEndpoint = process.env.ALICE_OAUTH_TOKEN_ENDPOINT || 'https://a3.aliceblueonline.com/oauth/token';
  const clientId = process.env.ALICE_CLIENT_ID;
  const clientSecret = process.env.ALICE_CLIENT_SECRET;
  const redirectUri = process.env.ALICE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ ok: false, message: 'ALICE_CLIENT_ID, ALICE_CLIENT_SECRET or ALICE_REDIRECT_URI not configured' }, { status: 400 });
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      body: body.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body: payload }, { status: 502 });
    }

    const token = (payload.access_token || payload.token || payload.accessToken || payload.access) as string | undefined;
    if (!token) {
      return NextResponse.json({ ok: false, message: 'No access token returned', payload }, { status: 502 });
    }

    const allowSave = String(process.env.ALICE_ALLOW_LOCAL_TOKEN_SAVE || '').toLowerCase() === 'true';
    const tokenFile = process.env.ALICE_OAUTH_TOKEN_FILE || '.alice.token';
      // If an accountId was attached to the flow, save the token keyed to that account
      const accountId = req.cookies.get('alice_oauth_account')?.value;
      if (accountId) {
        try {
          saveAccountToken(accountId, token);
        } catch (e) {
          console.error('Failed saving token for account', accountId, e);
        }
      } else if (allowSave) {
        // backward-compatible behavior: write single token file
        try {
          fs.writeFileSync(tokenFile, token, { encoding: 'utf-8', flag: 'w' });
        } catch (e) {
          console.error('Failed to write token to file', e);
        }
      }

    const masked = `${token.slice(0, 6)}...${token.slice(-4)}`;

    return NextResponse.json({ ok: true, message: 'Token received', tokenMasked: masked, savedToFile: allowSave ? tokenFile : null });
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
