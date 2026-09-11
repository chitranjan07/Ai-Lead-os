import nodemailer from 'nodemailer';
import { config } from '../../config.js';

export class EmailService {
  constructor() {
    this.provider = config.emailProvider;
    this.transporter = null;
    if (this.provider === 'smtp') {
      if (!config.smtp.host || !config.smtp.user || !config.smtp.password) {
        throw new Error('SMTP provider selected but SMTP configuration is incomplete.');
      }
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: { user: config.smtp.user, pass: config.smtp.password }
      });
    }
  }

  async send({ to, subject, text }) {
    if (!to) throw new Error('Recipient email is missing.');
    if (this.provider === 'mock') {
      return { provider: 'mock', accepted: [to], messageId: `mock-${Date.now()}`, dryRun: true };
    }
    const info = await this.transporter.sendMail({ from: config.emailFrom, to, subject, text });
    return { provider: 'smtp', accepted: info.accepted, rejected: info.rejected, messageId: info.messageId, dryRun: false };
  }
}

export const emailService = new EmailService();
