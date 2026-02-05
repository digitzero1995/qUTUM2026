import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { saveAccountToken } from '@/lib/alice';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authCode = url.searchParams.get('authCode') || url.searchParams.get('authcode') || url.searchParams.get('code');
  const userId = url.searchParams.get('userId') || url.searchParams.get('userid') || url.searchParams.get('user');

  if (!authCode || !userId) {
    return NextResponse.json({ ok: false, message: 'Missing authCode or userId' }, { status: 400 });
  }

  const apiSecret = process.env.ALICE_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json({ ok: false, message: 'ALICE_API_SECRET not configured' }, { status: 500 });
  }

  try {
    const checksum = crypto.createHash('sha256').update(String(userId) + String(authCode) + String(apiSecret)).digest('hex');

    const endpoint = 'https://ant.aliceblueonline.com/open-api/od/v1/vendor/getUserDetails';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkSum: checksum }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ ok: false, status: res.status, body: payload }, { status: 502 });
    }

    const userSession = payload?.userSession || payload?.userSessionToken || payload?.token || null;
    if (!userSession) {
      return NextResponse.json({ ok: false, message: 'No userSession in response', payload }, { status: 502 });
    }

    // Save session token keyed by userId
    try {
      saveAccountToken(String(userId), String(userSession));
    } catch (e) {
      console.error('Failed to save account token', e);
    }

    // Create a user object and store in localStorage via redirect
    // The user will be created as a 'trader' with OAuth authentication
    const userObj = {
      id: String(userId),
      role: 'trader',
      name: String(userId),
      authMethod: 'oauth'
    };

    // Trigger a poll request to fetch trades immediately upon login
    try {
      const pollResponse = await fetch(
        new URL('/api/alice/poll', new URL(req.url).origin).toString(),
        { method: 'POST' }
      );
      console.log('Triggered trade poll on login:', { status: pollResponse.status });
    } catch (e) {
      console.warn('Failed to trigger immediate trade poll:', e);
      // Continue anyway - the user will still log in
    }

    // Create response that redirects to dashboard
    const dashboardUrl = new URL('/dashboard', new URL(req.url).origin);
    const res = NextResponse.redirect(dashboardUrl);
    
    // Store user in a cookie temporarily so the dashboard can set localStorage
    // (since this is an API route, we can't directly set localStorage)
    res.cookies.set('alice_user', JSON.stringify(userObj), {
      httpOnly: false,
      maxAge: 86400, // 24 hours
      sameSite: 'lax'
    });

    return res;
  } catch (err: any) {
    console.error('Vendor callback error:', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
