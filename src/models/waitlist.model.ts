import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitlist extends Document {
  email: string;
  subscribedAt: Date;
  status: 'pending' | 'notified' | 'completed';
  source?: string;
}

const WaitlistSchema: Schema<IWaitlist> = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'notified', 'completed'],
      default: 'pending'
    },
    source: {
      type: String,
      default: 'homepage'
    }
  },
  {
    timestamps: true
  }
);

const Waitlist = mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);

export default Waitlist;
