import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  leadId: String,
  action: { type: String, required: true },
  actor: { type: String, default: 'system' },
  channel: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditSchema);
