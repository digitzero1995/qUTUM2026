import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const appCode = process.env.ALICE_APP_CODE;
  if (!appCode) {
    return NextResponse.json({ ok: false, message: 'ALICE_APP_CODE not configured' }, { status: 500 });
  }

  const accountId = new URL(req.url).searchParams.get('accountId') || '';
  const redirectUrl = `https://ant.aliceblueonline.com/?appcode=${encodeURIComponent(appCode)}`;

  const res = NextResponse.redirect(redirectUrl);
  // store optional account mapping in cookie for callback
  if (accountId) res.cookies.set('alice_vendor_account', accountId, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 300 });
  return res;
}
