import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { leadId: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const sortOptions: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const leads = await Lead.find(query).sort(sortOptions).lean();
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getSession();
    const body = await request.json();

    // Auto-set addedBy from current logged-in member
    if (session?.name) {
      body.addedBy = session.name;
    }

    const lead = await Lead.create(body);
    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
