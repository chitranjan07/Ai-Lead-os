import { config } from './config.js';
import { AzureOpenAIProvider } from './services/ai/AzureOpenAIProvider.js';

const provider = new AzureOpenAIProvider();
const fakeLead = {
  leadId: 'SMOKE-001',
  name: 'Test Candidate',
  email: 'test@example.com',
  course: 'B.Tech CSE',
  source: 'Synthetic',
  stage: 'INTERESTED',
  formStatus: 'NOT_FILLED',
  conversation: [
    { channel: 'whatsapp', direction: 'inbound', message: 'I am interested in B.Tech CSE. I will discuss it with my parents tomorrow.' }
  ]
};

const result = await provider.analyzeLead(fakeLead);
console.log(JSON.stringify({ ok: true, provider: 'azure', deployment: config.azureOpenAIDeployment, result }, null, 2));
