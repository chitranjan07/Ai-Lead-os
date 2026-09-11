import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  channel: { type: String, enum: ['whatsapp', 'email', 'call'], required: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  message: { type: String, required: true }
}, { _id: false });

const leadSchema = new mongoose.Schema({
  leadId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  course: { type: String, required: true },
  source: { type: String, default: 'Synthetic' },
  stage: { type: String, default: 'NEW' },
  status: { type: String, default: 'ACTIVE' },
  formStatus: { type: String, default: 'NOT_FILLED' },
  conversation: { type: [messageSchema], default: [] },
  lastContactAt: { type: Date },
  nextFollowUpAt: { type: Date },
  latestAnalysis: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

export const Lead = mongoose.model('Lead', leadSchema);
