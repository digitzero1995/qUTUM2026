import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const clientId = process.env.ALICE_CLIENT_ID;
  const redirectUri = process.env.ALICE_REDIRECT_URI;
  const authorizeUrl = process.env.ALICE_OAUTH_AUTHORIZE_ENDPOINT || 'https://a3.aliceblueonline.com/oauth/authorize';

  if (!clientId || !redirectUri) {
    return NextResponse.json({ ok: false, message: 'ALICE_CLIENT_ID or ALICE_REDIRECT_URI not configured' }, { status: 400 });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const url = new URL(authorizeUrl);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'trades',
    state,
  } as Record<string, string>).toString();

  const accountId = new URL(req.url).searchParams.get('accountId');

  const res = NextResponse.redirect(url.toString());
  res.cookies.set('alice_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 300 });
  if (accountId) {
    res.cookies.set('alice_oauth_account', accountId, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 300 });
  }
  return res;
}
