# AI Lead Follow-up OS — Portfolio Case Study

## User and problem

The target workflow is admissions/business-development lead follow-up. Leads are purchased from education lead sources such as CollegeDunia and CollegeDekho and enter a company CRM. Counselors then move interested/form-filled candidates into separate tracking sheets and use calls, WhatsApp, email/content sharing, and memory to manage follow-ups.

The observed workload is approximately 200 leads/day. The main bottleneck is fragmented operational context: the counselor must remember the previous conversation, decide priority, infer the next step and date, draft a personalized message, send it manually, and maintain tracking state.

## Existing workflow

CRM → manually filter/churn leads → personal/interested sheet → call candidate → interpret conversation → decide follow-up → draft message → WhatsApp/email → update tracking → remember next follow-up.

## Scope

The MVP consolidates the decision-support and follow-up-preparation layer. It accepts lead/conversation data, analyzes intent and stage, recommends priority and next action, computes a follow-up date, creates channel-specific WhatsApp and email drafts, presents the recommendation for human approval, and records execution/audit state.

## Non-goals

The MVP is not a replacement CRM, autonomous sales agent, bulk marketing tool, lead-acquisition system, payment system, or full admissions platform. It does not autonomously send WhatsApp messages.

## Architecture

React/Vite frontend → Node/Express API → MongoDB → AI service/provider abstraction → integration layer for email, sheets, and WhatsApp-ready output.

The AI provider is abstracted so the project can run with the deterministic mock provider, use a local Ollama model, or adopt another compatible provider without changing the workflow layer.

## AI-delegated work vs human judgment

AI handles repetitive interpretation and preparation: context extraction, intent/stage classification, priority recommendation, next-action recommendation, follow-up timing, channel recommendation, and draft generation.

The human retains final responsibility for consequential communication. External email sending requires approval, and WhatsApp is prepared for human sending. Low-confidence, sensitive, contradictory, or opt-out cases are routed to review.

## Evaluation

The synthetic regression suite contains 12 representative and edge/failure cases. The first iteration intentionally exposed four failures (TC04, TC08, TC11, TC12). Their root causes and hardening changes are retained in `evaluation/iteration-1-failures.json`.

After the fixes, the deterministic regression suite passed 12/12 cases and the hardening suite passed 3/3 checks. This demonstrates regression behavior of the current mock/ruleset; it is not a claim of production LLM accuracy.

The final measurement plan compares three workflows on the same cases: current manual workflow, current AI-assisted wording-only workflow, and AI Lead Follow-up OS. Time per lead, manual touches, major edits, quality, decision accuracy, and failure/recovery rates should be measured with observed runs before making an ROI claim.

## Reliability and safety

Lead conversation text is treated as untrusted data. AI outputs are schema-validated before state transitions. Communication is not marked successful until the provider confirms it. Failed sends are recoverable. Audit logs capture analysis, approval, execution, failure, and sync events.

## Limitations

The current project uses synthetic data and a deterministic mock provider by default. Real organizational CRM/WhatsApp integration, production authentication/authorization, and provider-specific email/WhatsApp delivery should be validated separately. The system's measured AI quality will depend on the chosen production model and prompt/configuration.

## First two weeks after handoff

Week 1: instrument real usage with anonymized operational telemetry, review false priorities and wrong follow-up dates, collect counselor edits, and adjust rules/prompts. Week 2: expand the evaluation set with newly observed failure modes, compare manual time/touches against the OS, tune approval thresholds, and validate whether email/document recommendations actually reduce operational effort.
