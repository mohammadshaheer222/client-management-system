import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Member from '@/models/Member';
import { hashPin, getSession } from '@/lib/auth';
import mongoose from 'mongoose';

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return false;
  return true;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Admin required' }, { status: 403 });
    }
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }
    await Member.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/members/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete member' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    if (!(await requireAdmin())) {
      return NextResponse.json({ success: false, error: 'Admin required' }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const update: Record<string, string> = {};

    if (body.pin) update.pinHash = await hashPin(String(body.pin));
    if (body.color) update.color = body.color;
    if (body.role)  update.role  = body.role;

    const member = await Member.findByIdAndUpdate(id, update, { new: true, select: '-pinHash' }).lean();
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('PATCH /api/members/[id]:', error);
    return NextResponse.json({ success: false, error: 'Failed to update member' }, { status: 500 });
  }
}
