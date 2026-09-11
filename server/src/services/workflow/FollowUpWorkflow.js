import { Lead } from '../../models/Lead.js';
import { FollowUp } from '../../models/FollowUp.js';
import { AuditLog } from '../../models/AuditLog.js';
import { AIService } from '../ai/AIService.js';
import { emailService } from '../integrations/EmailService.js';
import { whatsappService } from '../integrations/WhatsAppService.js';
import { sheetsService } from '../integrations/GoogleSheetsService.js';

async function audit(leadId, action, metadata = {}, channel) {
  await AuditLog.create({ leadId, action, metadata, channel });
}

function isSuccessful(execution, key) {
  return ['SENT', 'DRY_RUN_SENT'].includes(execution?.[key]?.status);
}

export const FollowUpWorkflow = {
  async analyze(leadId) {
    const lead = await Lead.findOne({ leadId }).lean();
    if (!lead) throw new Error('Lead not found.');
    const analysis = await AIService.analyzeLead(lead);
    const messages = analysis.recommendedChannel === 'NONE'
      ? { whatsapp: { body: '' }, email: { subject: '', body: '' } }
      : await AIService.generateMessages(lead, analysis);
    await Lead.updateOne({ leadId }, { $set: { stage: analysis.stage, nextFollowUpAt: new Date(analysis.followUpDate), latestAnalysis: analysis } });
    const nextState = analysis.recommendedChannel === 'NONE' || analysis.confidence < 0.6 ? 'MANUAL_REVIEW' : 'AWAITING_APPROVAL';
    const followUp = await FollowUp.findOneAndUpdate(
      { leadId, state: { $in: ['AWAITING_APPROVAL', 'EDITED', 'MANUAL_REVIEW', 'FAILED', 'PARTIAL_FAILURE'] } },
      {
        $set: {
          stage: analysis.stage,
          priority: analysis.priority,
          reason: analysis.summary,
          recommendedAction: analysis.recommendedAction,
          followUpDate: new Date(analysis.followUpDate),
          recommendedChannel: analysis.recommendedChannel,
          confidence: analysis.confidence,
          messages,
          state: nextState,
          failureReason: undefined
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await audit(leadId, 'AI_ANALYSIS_CREATED', { followUpId: followUp._id.toString(), analysis });
    return followUp.toObject();
  },

  async approve(followUpId, edits = {}) {
    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) throw new Error('Follow-up not found.');
    if (followUp.state === 'COMPLETED') throw new Error('Follow-up has already been completed.');
    if (followUp.state === 'REJECTED') throw new Error('Rejected follow-up cannot be approved.');
    if (edits.whatsappBody !== undefined) followUp.messages.whatsapp.body = edits.whatsappBody;
    if (edits.emailSubject !== undefined) followUp.messages.email.subject = edits.emailSubject;
    if (edits.emailBody !== undefined) followUp.messages.email.body = edits.emailBody;

    const lead = await Lead.findOne({ leadId: followUp.leadId });
    if (!lead) throw new Error('Lead not found for follow-up.');

    followUp.state = 'SENDING';
    followUp.approvedAt = new Date();
    followUp.approvedBy = edits.approvedBy || 'demo-user';
    await followUp.save();
    await audit(followUp.leadId, 'FOLLOWUP_APPROVED', { followUpId: followUp.id, edited: Boolean(edits.emailBody || edits.emailSubject || edits.whatsappBody) });

    const execution = followUp.execution || { email: null, whatsapp: null };
    const failures = [];

    try {
      if ((followUp.recommendedChannel === 'EMAIL' || followUp.recommendedChannel === 'BOTH') && !isSuccessful(execution, 'email')) {
        try {
          if (!lead.email) throw new Error('Lead does not have an email address.');
          const providerResult = await emailService.send({
            to: lead.email,
            subject: followUp.messages.email.subject,
            text: followUp.messages.email.body
          });
          execution.email = { status: providerResult.dryRun ? 'DRY_RUN_SENT' : 'SENT', providerResult };
          await audit(followUp.leadId, 'EMAIL_EXECUTED', execution.email, 'email');
        } catch (error) {
          execution.email = { status: 'FAILED', error: error.message };
          failures.push(`Email: ${error.message}`);
          await audit(followUp.leadId, 'EMAIL_FAILED', { error: error.message }, 'email');
        }
      }

      if ((followUp.recommendedChannel === 'WHATSAPP' || followUp.recommendedChannel === 'BOTH') && !isSuccessful(execution, 'whatsapp')) {
        try {
          if (!lead.phone) throw new Error('Lead does not have a phone number.');
          const providerResult = await whatsappService.sendText({ to: lead.phone, body: followUp.messages.whatsapp.body });
          execution.whatsapp = { status: providerResult.dryRun ? 'DRY_RUN_SENT' : 'SENT', providerResult };
          await audit(followUp.leadId, 'WHATSAPP_EXECUTED', execution.whatsapp, 'whatsapp');
        } catch (error) {
          execution.whatsapp = { status: 'FAILED', error: error.message };
          failures.push(`WhatsApp: ${error.message}`);
          await audit(followUp.leadId, 'WHATSAPP_FAILED', { error: error.message }, 'whatsapp');
        }
      }

      const requested = [];
      if (followUp.recommendedChannel === 'EMAIL' || followUp.recommendedChannel === 'BOTH') requested.push('email');
      if (followUp.recommendedChannel === 'WHATSAPP' || followUp.recommendedChannel === 'BOTH') requested.push('whatsapp');
      const successful = requested.filter(channel => isSuccessful(execution, channel));

      followUp.execution = execution;
      followUp.providerResult = execution.email?.providerResult || null;
      followUp.failureReason = failures.join(' | ') || undefined;

      if (successful.length === requested.length) {
        followUp.state = 'COMPLETED';
        followUp.sentAt = new Date();
      } else if (successful.length > 0) {
        followUp.state = 'PARTIAL_FAILURE';
      } else {
        followUp.state = 'FAILED';
      }
      await followUp.save();

      if (successful.length > 0) {
        lead.lastContactAt = new Date();
        lead.latestAnalysis = { ...(lead.latestAnalysis || {}), lastExecutionAt: new Date().toISOString() };
        await lead.save();
        const sheetResult = await sheetsService.upsertLeadStatus(lead);
        await audit(followUp.leadId, 'LEAD_STATUS_SYNCED', sheetResult, 'sheets');
      }

      if (failures.length) {
        throw new Error(failures.join(' | '));
      }

      return followUp.toObject();
    } catch (error) {
      if (followUp.state !== 'FAILED' && followUp.state !== 'PARTIAL_FAILURE') {
        followUp.state = 'FAILED';
      }
      followUp.failureReason = error.message;
      followUp.execution = execution;
      await followUp.save();
      await audit(followUp.leadId, 'FOLLOWUP_FAILED', { error: error.message, execution });
      throw error;
    }
  },

  async reject(followUpId, reason) {
    const followUp = await FollowUp.findByIdAndUpdate(
      followUpId,
      { $set: { state: 'REJECTED', failureReason: reason || 'Rejected by human reviewer.' } },
      { new: true }
    );
    if (!followUp) throw new Error('Follow-up not found.');
    await audit(followUp.leadId, 'FOLLOWUP_REJECTED', { followUpId, reason });
    return followUp.toObject();
  }
};
