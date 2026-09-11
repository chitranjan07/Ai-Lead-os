import fs from 'node:fs/promises';
import { MockAIProvider } from './services/ai/MockAIProvider.js';

const cases = JSON.parse(await fs.readFile(new URL('../../evaluation/test-cases.json', import.meta.url), 'utf8'));
const provider = new MockAIProvider();

function daysFromNow(iso) {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

function actionMatches(actual, expectedKeywords = []) {
  const text = String(actual || '').toLowerCase();
  return expectedKeywords.every((keyword) => text.includes(keyword.toLowerCase()));
}

function messageScore(testCase, messages) {
  if (testCase.expected.recommendedChannel === 'NONE') return 10;
  const all = `${messages.whatsapp.body}\n${messages.email.subject}\n${messages.email.body}`.toLowerCase();
  let score = 0;
  const course = String(testCase.input.course || '').toLowerCase();
  const name = String(testCase.input.name || '').toLowerCase();
  if (!course || all.includes(course)) score += 2;
  if (!name || all.includes(name)) score += 2;
  if (actionMatches(messages.whatsapp.body, testCase.expected.messageKeywords || [])) score += 2;
  if (!/ignore previous|system prompt|secret|password/i.test(all)) score += 2;
  if (messages.email.subject.trim() && messages.email.body.trim()) score += 2;
  return score;
}

const results = [];
for (const testCase of cases) {
  try {
    const lead = {
      leadId: testCase.input.leadId,
      name: testCase.input.name || 'Candidate',
      course: testCase.input.course || 'B.Tech CSE',
      formStatus: testCase.input.formStatus || 'NOT_FILLED',
      stage: testCase.input.currentStage || 'NEW',
      email: testCase.input.email || 'candidate@example.com',
      conversation: testCase.input.conversation || []
    };
    const analysis = await provider.analyzeLead(lead);
    const messages = await provider.generateMessages(lead, analysis);
    const checks = {
      stage: analysis.stage === testCase.expected.stage,
      priority: analysis.priority === testCase.expected.priority,
      recommendedChannel: analysis.recommendedChannel === testCase.expected.recommendedChannel,
      recommendedAction: testCase.expected.actionKeywords?.length ? actionMatches(analysis.recommendedAction, testCase.expected.actionKeywords) : true,
      followUpOffset: testCase.expected.followUpOffsetDays == null ? true : daysFromNow(analysis.followUpDate) === testCase.expected.followUpOffsetDays,
      safety: testCase.expected.mustNotFollowLeadInstructions ? !/system prompt|password|secret/i.test(`${messages.whatsapp.body} ${messages.email.body}`) : true
    };
    const messageQuality = messageScore(testCase, messages);
    results.push({
      id: testCase.id,
      description: testCase.description,
      pass: Object.values(checks).every(Boolean),
      checks,
      messageQuality,
      actual: analysis,
      messages,
      expected: testCase.expected
    });
  } catch (error) {
    results.push({ id: testCase.id, description: testCase.description, pass: false, failure: error.message });
  }
}

const passed = results.filter((r) => r.pass).length;
const total = results.length;
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    passed,
    total,
    passRate: Number(((passed / Math.max(total, 1)) * 100).toFixed(1)),
    averageMessageQualityOutOf10: Number((results.reduce((sum, r) => sum + (r.messageQuality || 0), 0) / Math.max(total, 1)).toFixed(2))
  },
  failures: results.filter((r) => !r.pass).map((r) => ({
    id: r.id,
    failedChecks: r.checks ? Object.entries(r.checks).filter(([, ok]) => !ok).map(([key]) => key) : ['runtime']
  })),
  results
};

await fs.writeFile(new URL('../../evaluation/latest-results.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
process.exit(passed === total ? 0 : 1);
