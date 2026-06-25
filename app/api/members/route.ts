import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';
import { hashPin, getSession } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const members = await Member.find({}, { pinHash: 0 }).lean();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('GET /api/members error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Only admins can add members (skip check if no members exist yet — first setup)
    const count = await Member.countDocuments();
    if (count > 0) {
      const session = await getSession();
      if (!session || session.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
      }
    }

    const { name, pin, color, role } = await request.json();
    if (!name || !pin) {
      return NextResponse.json({ success: false, error: 'Name and PIN required' }, { status: 400 });
    }

    const pinHash = await hashPin(String(pin));
    const member = await Member.create({
      name: name.trim(),
      pinHash,
      color: color || '#4f8ef7',
      role: count === 0 ? 'admin' : (role || 'member'), // first member is always admin
    });

    return NextResponse.json(
      { success: true, data: { _id: member._id, name: member.name, color: member.color, role: member.role } },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('POST /api/members error:', error);
    const msg = error instanceof Error && error.message.includes('duplicate')
      ? 'A member with that name already exists'
      : 'Failed to create member';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
