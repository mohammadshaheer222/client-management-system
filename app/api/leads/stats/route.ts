import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function GET() {
  try {
    await dbConnect();

    const totalLeads = await Lead.countDocuments();

    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Leads with overdue follow-up (nextFollowupDate < today)
    const overdueFollowups = await Lead.countDocuments({
      nextFollowupDate: { $lt: today },
      status: { $nin: ['Completed', 'Lost'] },
    });

    // Leads with follow-up due today
    const todayFollowups = await Lead.countDocuments({
      nextFollowupDate: { $gte: today, $lt: tomorrow },
    });

    // Leads created this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newThisMonth = await Lead.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Recent leads
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        statusMap,
        overdueFollowups,
        todayFollowups,
        newThisMonth,
        recentLeads,
      },
    });
  } catch (error) {
    console.error('GET /api/leads/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
