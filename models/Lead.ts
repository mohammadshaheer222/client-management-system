import mongoose, { Schema, Document, Model } from 'mongoose';

export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Quotation Sent'
  | 'Follow-up'
  | 'Confirmed'
  | 'Completed'
  | 'Lost';

export interface ILead extends Document {
  leadId: string;
  date: Date;
  clientName: string;
  phoneNumber: string;
  requirement: string;
  location: string;
  budget: string;
  source: string;
  addedBy: string;          // member name who created the lead
  assignedTo: string;       // member name assigned to handle it
  status: LeadStatus;
  lastFollowupDate?: Date;
  nextFollowupDate?: Date;
  creatorAssigned: string;
  remarks: string;
  closureDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema<ILead> = new Schema(
  {
    leadId: {
      type: String,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    requirement: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    budget: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      default: 'UpReels',
      trim: true,
    },
    addedBy: {
      type: String,
      trim: true,
      default: '',
    },
    assignedTo: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'New Lead',
        'Contacted',
        'Quotation Sent',
        'Follow-up',
        'Confirmed',
        'Completed',
        'Lost',
      ],
      default: 'New Lead',
    },
    lastFollowupDate: { type: Date },
    nextFollowupDate: { type: Date },
    creatorAssigned: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    closureDate: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate UpReels ID before saving: UPR-001, UPR-002 …
LeadSchema.pre('save', async function () {
  if (!this.leadId) {
    const count = await (this.constructor as Model<ILead>).countDocuments();
    this.leadId = `UPR-${String(count + 1).padStart(3, '0')}`;
  }
});

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
