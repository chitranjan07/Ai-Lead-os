import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_lead_followup_os',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  aiProvider: process.env.AI_PROVIDER || 'mock',
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY || '',
  azureOpenAIDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || '',
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || 'v1',
  ollamaUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',
  emailProvider: process.env.EMAIL_PROVIDER || 'mock',
  emailFrom: process.env.EMAIL_FROM || 'Admissions Team <admissions@example.com>',
  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER || 'mock',
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION || 'v23.0',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    defaultCountryCode: String(process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '')
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD
  },
  requireApproval: String(process.env.REQUIRE_APPROVAL ?? 'true').toLowerCase() !== 'false'
};
