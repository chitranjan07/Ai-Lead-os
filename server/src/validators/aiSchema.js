const allowedIntents = new Set([
  'high_purchase_intent', 'medium_purchase_intent', 'low_purchase_intent',
  'information_seeking', 'not_interested', 'unknown'
]);
const allowedStages = new Set([
  'NEW', 'CONTACTED', 'INTERESTED', 'DISCUSSION_PENDING', 'FORM_FILLED',
  'REGISTRATION_PENDING', 'REGISTERED', 'NOT_INTERESTED', 'NO_RESPONSE'
]);
const allowedPriorities = new Set(['HIGH', 'MEDIUM', 'LOW']);
const allowedChannels = new Set(['WHATSAPP', 'EMAIL', 'BOTH', 'NONE']);

export function validateAnalysis(value) {
  if (!value || typeof value !== 'object') throw new Error('AI output must be an object.');
  if (!value.leadId) throw new Error('Missing leadId.');
  if (!allowedIntents.has(value.intent)) throw new Error(`Invalid intent: ${value.intent}`);
  if (!allowedStages.has(value.stage)) throw new Error(`Invalid stage: ${value.stage}`);
  if (!allowedPriorities.has(value.priority)) throw new Error(`Invalid priority: ${value.priority}`);
  if (!allowedChannels.has(value.recommendedChannel)) throw new Error(`Invalid channel: ${value.recommendedChannel}`);
  if (typeof value.confidence !== 'number' || value.confidence < 0 || value.confidence > 1) {
    throw new Error('Confidence must be a number between 0 and 1.');
  }
  if (!value.recommendedAction || !value.summary) throw new Error('Missing summary or recommendedAction.');
  if (!Array.isArray(value.objections)) throw new Error('Objections must be an array.');
  if (!value.followUpDate || Number.isNaN(Date.parse(value.followUpDate))) throw new Error('Invalid followUpDate.');
  return value;
}

export function validateMessages(value) {
  if (!value || typeof value !== 'object') throw new Error('Message output must be an object.');
  if (!value.whatsapp || typeof value.whatsapp.body !== 'string') throw new Error('WhatsApp body missing.');
  if (!value.email || typeof value.email.subject !== 'string' || typeof value.email.body !== 'string') {
    throw new Error('Email subject/body missing.');
  }
  return value;
}
