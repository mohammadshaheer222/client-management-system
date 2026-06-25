import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember extends Document {
  name: string;
  pinHash: string;        // SHA-256 of the 4-digit PIN
  color: string;          // avatar background color
  role: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema<IMember> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      unique: true,
    },
    pinHash: {
      type: String,
      required: [true, 'PIN is required'],
    },
    color: {
      type: String,
      default: '#4f8ef7',
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  { timestamps: true }
);

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;
