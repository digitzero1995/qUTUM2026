import { NextResponse, NextRequest } from 'next/server';
import { getTradesForAccount } from '@/lib/alice';

export async function GET(req: NextRequest) {
  try {
    const accountId = new URL(req.url).searchParams.get('accountId') || undefined;
    const trades = await getTradesForAccount(accountId);
    return NextResponse.json({ trades });
  } catch (error: any) {
    console.error('Failed to fetch Alice trades:', error);
    const msg = error?.message ?? 'Unknown error';

    const m = msg.match(/HTTP (\d{3})/);
    const status = m ? Number(m[1]) : 500;

    return NextResponse.json({ error: msg }, { status });
  }
}
