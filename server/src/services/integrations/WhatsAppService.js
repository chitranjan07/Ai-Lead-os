import { config } from '../../config.js';

function normalizePhone(value) {
  if (!value) return '';
  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (raw.startsWith('+')) return digits;
  if (config.whatsapp.defaultCountryCode && digits.length <= 10) {
    return `${config.whatsapp.defaultCountryCode}${digits}`;
  }
  return digits;
}

export class WhatsAppService {
  constructor() {
    this.provider = config.whatsapp.provider;
  }

  async sendText({ to, body }) {
    if (!to) throw new Error('Recipient WhatsApp number is missing.');
    if (!body?.trim()) throw new Error('WhatsApp message body is empty.');

    if (this.provider === 'mock') {
      return {
        provider: 'mock',
        messageId: `mock-wa-${Date.now()}`,
        accepted: [to],
        dryRun: true
      };
    }

    if (this.provider !== 'meta_cloud') {
      throw new Error(`Unsupported WhatsApp provider: ${this.provider}`);
    }

    const recipient = normalizePhone(to);
    if (!recipient) throw new Error('Invalid WhatsApp recipient number. Use an E.164 number such as +919876543210.');
    if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
      throw new Error('WhatsApp Cloud API is not fully configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.');
    }

    const url = `https://graph.facebook.com/${config.whatsapp.graphVersion}/${config.whatsapp.phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.whatsapp.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: { preview_url: false, body }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(`WhatsApp Cloud API error ${response.status}: ${detail}`);
    }

    return {
      provider: 'meta_cloud',
      messageId: data?.messages?.[0]?.id || null,
      accepted: data?.messages?.map(m => m.id) || [],
      recipient,
      dryRun: false,
      raw: data
    };
  }
}

export const whatsappService = new WhatsAppService();
