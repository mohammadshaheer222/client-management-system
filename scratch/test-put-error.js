const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://shaheercse2022_db_user:oULb8DoysOLztGNn@cluster0.2jqnhge.mongodb.net/?appName=Cluster0";

// Define Schema matching the updated one
const LeadSchema = new mongoose.Schema(
  {
    leadId: String,
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
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
    followupHistory: {
      type: [Date],
      default: [],
    },
  },
  { timestamps: true }
);

delete mongoose.models.Lead;
const Lead = mongoose.model('Lead', LeadSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    // Let's get one lead
    const leadDoc = await Lead.findOne({ leadId: 'UPR-001' });
    if (!leadDoc) {
      console.log('Lead not found');
      await mongoose.disconnect();
      return;
    }

    console.log('Found lead:', leadDoc.leadId);
    
    // Simulate form payload
    const body = {
      clientName: "Client 7",
      phoneNumber: "+91 99610 06827",
      requirement: "Photography + Videography",
      location: "Tirur",
      budget: "Below 20k",
      source: "UpReels",
      status: "Contacted",
      lastFollowupDate: "2026-06-24",
      nextFollowupDate: "2026-06-29",
      creatorAssigned: "Not assigned",
      remarks: "Need to assign creator",
      date: "25th June",
      followupHistory: ["2026-06-24"]
    };

    // If lastFollowupDate is changing, save the old one to history
    if (body.lastFollowupDate && leadDoc.lastFollowupDate) {
      const oldTime = new Date(leadDoc.lastFollowupDate).getTime();
      const newTime = new Date(body.lastFollowupDate).getTime();
      if (oldTime !== newTime) {
        const history = body.followupHistory || leadDoc.followupHistory || [];
        const alreadyExists = history.some((d) => new Date(d).getTime() === oldTime);
        if (!alreadyExists) {
          history.push(leadDoc.lastFollowupDate);
        }
        body.followupHistory = history;
      }
    }

    // Apply other fields
    console.log('Assigning body to leadDoc...');
    Object.assign(leadDoc, body);

    console.log('Saving leadDoc...');
    await leadDoc.save();
    console.log('Lead saved successfully!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

run();
