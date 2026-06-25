import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';
import { hashPin, signSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, pin } = await request.json();

    if (!name || !pin) {
      return NextResponse.json(
        { success: false, error: 'Name and PIN are required' },
        { status: 400 }
      );
    }

    const pinHash = await hashPin(String(pin));
    const member = await Member.findOne({ name, pinHash }).lean() as {
      _id: { toString(): string };
      name: string;
      color: string;
      role: 'admin' | 'member';
    } | null;

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Invalid name or PIN' },
        { status: 401 }
      );
    }

    const token = await signSession({
      memberId: member._id.toString(),
      name: member.name,
      color: member.color,
      role: member.role,
    });

    const res = NextResponse.json({
      success: true,
      data: { name: member.name, color: member.color, role: member.role },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
