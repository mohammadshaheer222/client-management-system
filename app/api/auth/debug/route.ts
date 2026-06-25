import { NextRequest, NextResponse } from 'next/server';
import { getSession, COOKIE_NAME } from '@/lib/auth';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  const session = await getSession();

  const secretString = process.env.JWT_SECRET || 'upreels-crm-fallback-secret';
  const SECRET = new TextEncoder().encode(secretString);

  let verifyResult: any = null;
  if (cookieToken) {
    try {
      const { payload } = await jwtVerify(cookieToken, SECRET);
      verifyResult = { success: true, payload };
    } catch (err: any) {
      verifyResult = { success: false, error: err.message, stack: err.stack };
    }
  }

  return NextResponse.json({
    success: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_SET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
    },
    cookie: {
      name: COOKIE_NAME,
      present: !!cookieToken,
      tokenLength: cookieToken?.length || 0,
    },
    session,
    verifyResult,
  });
}
