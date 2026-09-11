import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  whatsapp: { body: { type: String, default: '' } },
  email: { subject: { type: String, default: '' }, body: { type: String, default: '' } }
}, { _id: false });

const followUpSchema = new mongoose.Schema({
  leadId: { type: String, required: true, index: true },
  stage: String,
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
  reason: String,
  recommendedAction: String,
  followUpDate: Date,
  recommendedChannel: { type: String, enum: ['WHATSAPP', 'EMAIL', 'BOTH', 'NONE'] },
  confidence: Number,
  messages: messageSchema,
  state: {
    type: String,
    enum: ['AWAITING_APPROVAL', 'EDITED', 'REJECTED', 'SENDING', 'COMPLETED', 'FAILED', 'PARTIAL_FAILURE', 'MANUAL_REVIEW'],
    default: 'AWAITING_APPROVAL'
  },
  approvedBy: String,
  approvedAt: Date,
  sentAt: Date,
  execution: mongoose.Schema.Types.Mixed,
  providerResult: mongoose.Schema.Types.Mixed,
  failureReason: String
}, { timestamps: true });

export const FollowUp = mongoose.model('FollowUp', followUpSchema);
