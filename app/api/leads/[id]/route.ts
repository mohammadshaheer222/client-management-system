import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import mongoose from 'mongoose';

/** Resolve a lead by leadId slug (UPR-001) OR MongoDB _id (fallback). */
async function findLead(id: string) {
  // Try leadId slug first
  const bySlug = await Lead.findOne({ leadId: id.toUpperCase() }).lean();
  if (bySlug) return bySlug;

  // Fallback to MongoDB _id (for any existing links)
  if (mongoose.isValidObjectId(id)) {
    return Lead.findById(id).lean();
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const lead = await findLead(id);

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('GET /api/leads/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Don't allow overwriting the leadId
    delete body.leadId;

    let lead = null;

    // Try slug first
    const existing = await Lead.findOne({ leadId: id.toUpperCase() }).lean();
    if (existing) {
      lead = await Lead.findByIdAndUpdate(
        (existing as { _id: mongoose.Types.ObjectId })._id,
        body,
        { new: true, runValidators: true }
      ).lean();
    } else if (mongoose.isValidObjectId(id)) {
      lead = await Lead.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      }).lean();
    }

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('PUT /api/leads/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    let lead = null;
    const existing = await Lead.findOne({ leadId: id.toUpperCase() }).lean();
    if (existing) {
      lead = await Lead.findByIdAndDelete(
        (existing as { _id: mongoose.Types.ObjectId })._id
      ).lean();
    } else if (mongoose.isValidObjectId(id)) {
      lead = await Lead.findByIdAndDelete(id).lean();
    }

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('DELETE /api/leads/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
