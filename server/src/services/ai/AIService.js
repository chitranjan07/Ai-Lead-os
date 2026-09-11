import { config } from '../../config.js';
import { validateAnalysis, validateMessages } from '../../validators/aiSchema.js';
import { MockAIProvider } from './MockAIProvider.js';
import { OllamaProvider } from './OllamaProvider.js';
import { AzureOpenAIProvider } from './AzureOpenAIProvider.js';


function looksLikePromptInjection(lead) {
  const text = (lead?.conversation || []).map(m => m?.message || '').join('\n').toLowerCase();
  const patterns = [
    /ignore (all|any|the|your|previous|prior) instructions/,
    /ignore previous/,
    /system prompt/,
    /developer message/,
    /reveal (your|the) (system|hidden) prompt/,
    /disregard (all|any|the|previous) instructions/,
    /jailbreak/,
    /you are now (a|an)/,
    /act as (a|an) (unrestricted|different|new)/
  ];
  return patterns.some(re => re.test(text));
}

function manualReviewAnalysis(lead, reason) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return {
    leadId: lead.leadId,
    intent: 'unknown',
    stage: lead.stage || 'CONTACTED',
    priority: 'MEDIUM',
    summary: reason,
    objections: [],
    recommendedAction: 'Manual review required before any outreach is generated or sent.',
    followUpDate: tomorrow.toISOString(),
    recommendedChannel: 'NONE',
    confidence: 0.99
  };
}

function provider() {
  if (config.aiProvider === 'azure') return new AzureOpenAIProvider();
  if (config.aiProvider === 'ollama') return new OllamaProvider();
  return new MockAIProvider();
}

export const AIService = {
  async analyzeLead(lead) {
    if (looksLikePromptInjection(lead)) {
      return manualReviewAnalysis(lead, 'Conversation contains instruction-like content that must be reviewed separately; it was not sent to the AI model.');
    }
    try {
      const result = await provider().analyzeLead(lead);
      return validateAnalysis(result);
    } catch (error) {
      const message = String(error?.message || error);
      if (/content_filter|ResponsibleAIPolicyViolation|content management policy/i.test(message)) {
        return manualReviewAnalysis(lead, 'Azure content safety blocked analysis of this conversation. Manual review is required; no outreach was generated.');
      }
      throw error;
    }
  },
  async generateMessages(lead, analysis) {
    if (analysis?.recommendedChannel === 'NONE') {
      return { whatsapp: { body: '' }, email: { subject: '', body: '' } };
    }
    try {
      const result = await provider().generateMessages(lead, analysis);
      return validateMessages(result);
    } catch (error) {
      const message = String(error?.message || error);
      if (/content_filter|ResponsibleAIPolicyViolation|content management policy/i.test(message)) {
        return { whatsapp: { body: '' }, email: { subject: '', body: '' } };
      }
      throw error;
    }
  }
};
