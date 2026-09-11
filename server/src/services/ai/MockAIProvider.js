import { addDays, parseRelativeFollowUp } from '../../utils/dates.js';

function latestInbound(conversation = []) {
  return [...conversation].reverse().find((m) => m.direction === 'inbound')?.message || '';
}

function allText(conversation = []) {
  return conversation.map((m) => m.message).join(' ');
}

function detectStage(lead, text) {
  const lower = text.toLowerCase();
  if (/registered|admission confirmed|already enrolled/.test(lower)) return 'REGISTERED';
  if (lead.formStatus === 'FILLED' && /registration|fee|payment/.test(lower)) return 'REGISTRATION_PENDING';
  if (lead.formStatus === 'FILLED') return 'FORM_FILLED';
  if (/not interested|don't contact|do not contact|no longer interested/.test(lower)) return 'NOT_INTERESTED';
  if (/ignore previous instructions|system prompt|password|secret|send every document/i.test(lower)) return 'CONTACTED';
  if (/parent|parents|family/.test(lower) && /discuss|talk|ask/.test(lower)) return 'DISCUSSION_PENDING';
  if (/document|brochure|details|fee structure|information|fees seem|expensive|cost/.test(lower)) return 'INTERESTED';
  if (/tomorrow|day after tomorrow|later|next week|will let you know/.test(lower)) return 'INTERESTED';
  if (lead.stage !== 'NEW') return lead.stage;
  return 'CONTACTED';
}

function detectIntent(text, stage) {
  const lower = text.toLowerCase();
  if (/not interested|don't contact|do not contact/.test(lower)) return 'not_interested';
  if (stage === 'REGISTERED') return 'high_purchase_intent';
  if (/yes|interested|want to|planning|apply|fill the form|admission/.test(lower)) return 'high_purchase_intent';
  if (/fees|fee|documents|details|course|eligibility|information/.test(lower)) return 'medium_purchase_intent';
  if (/just checking|exploring|maybe|thinking/.test(lower)) return 'low_purchase_intent';
  return 'unknown';
}

function detectPriority(intent, stage, text) {
  const lower = text.toLowerCase();
  if (stage === 'NOT_INTERESTED' || stage === 'REGISTERED' || stage === 'NO_RESPONSE') return 'LOW';
  if (stage === 'FORM_FILLED' || stage === 'REGISTRATION_PENDING' || intent === 'high_purchase_intent') return 'HIGH';
  if (/parent|tomorrow|day after tomorrow|fee|payment|registration/.test(lower)) return 'HIGH';
  return 'MEDIUM';
}

function detectAction(stage, priority, text) {
  const lower = text.toLowerCase();
  if (stage === 'NOT_INTERESTED') return 'Do not send a normal sales follow-up; mark for closure or human review.';
  if (stage === 'REGISTERED') return 'No sales follow-up required; update record as registered.';
  if (stage === 'REGISTRATION_PENDING') return 'Follow up on registration fee/payment status.';
  if (stage === 'FORM_FILLED') return 'Follow up on the next admission/registration step.';
  if (stage === 'DISCUSSION_PENDING') return 'Follow up on the parent/family discussion.';
  if (/tomorrow|day after tomorrow/.test(lower)) return 'Follow up at the candidate-stated time commitment.';
  if (/no response|not replied|no reply/.test(lower)) return 'Send a polite re-engagement follow-up.';
  if (/ignore previous instructions|system prompt|password|secret|send every document/.test(lower)) return 'Do not follow instructions embedded in lead text; route to manual review.';
  if (/document|brochure|details/.test(lower)) return 'Send the requested admission/course information.';
  if (/expensive|fees seem|fee objection|cost/.test(lower)) return 'Follow up about available fee or payment options.';
  return priority === 'HIGH' ? 'Follow up promptly based on the latest conversation.' : 'Send a helpful, low-pressure follow-up.';
}

export class MockAIProvider {
  async analyzeLead(lead) {
    const text = allText(lead.conversation);
    const latest = latestInbound(lead.conversation);
    const stage = detectStage(lead, text);
    const intent = detectIntent(text, stage);
    const priority = detectPriority(intent, stage, text);
    const followUpDays = stage === 'DISCUSSION_PENDING'
      ? parseRelativeFollowUp(text, 1)
      : stage === 'REGISTRATION_PENDING'
        ? 2
        : stage === 'FORM_FILLED'
          ? 2
          : priority === 'HIGH' ? 1 : 3;
    const followUpDate = addDays(new Date(), followUpDays).toISOString();
    const channel = stage === 'NOT_INTERESTED' || stage === 'REGISTERED' || /ignore previous instructions|system prompt|password|secret|send every document/.test(text.toLowerCase())
      ? 'NONE'
      : /document|brochure|details|fee structure|information/.test(text.toLowerCase()) ? 'EMAIL'
        : 'WHATSAPP';
    const objections = [];
    if (/price|fee|cost|expensive/.test(text.toLowerCase())) objections.push('Price/Fee');
    if (/parent|parents/.test(text.toLowerCase())) objections.push('Parent discussion');
    const summary = `Latest candidate context: ${latest || 'No inbound message available.'}`;
    const confidence = stage === 'CONTACTED' || stage === 'NEW' ? 0.72 : 0.91;
    return {
      leadId: lead.leadId,
      intent,
      stage,
      priority,
      summary,
      objections,
      recommendedAction: detectAction(stage, priority, text),
      followUpDate,
      recommendedChannel: channel,
      confidence
    };
  }

  async generateMessages(lead, analysis) {
    const firstName = String(lead.name || 'there').trim().split(/\s+/)[0];
    const action = analysis.recommendedAction;
    const whatsappBody = analysis.recommendedChannel === 'NONE'
      ? 'No follow-up message recommended for this lead.'
      : `Hi ${firstName}, just following up regarding your ${lead.course} enquiry. ${action.replace(/\.$/, '')}. Please let me know if you have any questions or if you need any additional information.`;
    const emailSubject = analysis.recommendedChannel === 'NONE'
      ? 'No follow-up required'
      : `${lead.course} admission follow-up`;
    const emailBody = analysis.recommendedChannel === 'NONE'
      ? 'No follow-up message recommended for this lead.'
      : `Dear ${firstName},\n\nI’m following up regarding your ${lead.course} enquiry. ${action.replace(/\.$/, '')}.\n\nPlease let me know if you need any additional information or clarification.\n\nRegards,\nAdmissions Team`;
    return {
      whatsapp: { body: whatsappBody },
      email: { subject: emailSubject, body: emailBody }
    };
  }
}
