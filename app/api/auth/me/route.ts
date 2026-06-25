import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ success: true, data: session });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return res;
}
