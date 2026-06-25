const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in process.env');
  process.exit(1);
}

// Define Schema
const LeadSchema = new mongoose.Schema(
  {
    leadId: String,
    date: Date,
    clientName: String,
    phoneNumber: String,
    requirement: String,
    location: String,
    budget: String,
    source: String,
    status: String,
    lastFollowupDate: Date,
    nextFollowupDate: Date,
    creatorAssigned: String,
    remarks: String,
    closureDate: Date,
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');
    
    const count = await Lead.countDocuments();
    console.log('Total Leads in DB:', count);

    const leads = await Lead.find().limit(5).lean();
    console.log('Sample Leads:', JSON.stringify(leads, null, 2));

    const today = new Date();
    today.setHours(0,0,0,0);
    console.log('Today boundary:', today);

    const overdueCount = await Lead.countDocuments({
      nextFollowupDate: { $lt: today },
      status: { $nin: ['Completed', 'Lost'] }
    });
    console.log('Overdue leads count:', overdueCount);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error running test:', error);
  }
}

run();
