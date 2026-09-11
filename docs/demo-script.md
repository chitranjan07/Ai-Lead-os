# 5-Minute Demo Script

## 0:00–0:40 — Problem and baseline

"Admissions counselors can handle around 200 purchased leads per day. The problem is not just writing a message. They have to move between CRM data, sheets and WhatsApp, remember previous conversations, decide who needs follow-up, decide when, write the message, and update the tracking state. I built an approval-first AI Lead Follow-up OS to consolidate that workflow."

Show the old workflow diagram.

## 0:40–1:20 — New workflow

Show the dashboard and explain:

"A lead enters the system with course, status and conversation context. The AI analyzes the context and produces structured decisions instead of a free-form paragraph."

Show priority, stage, reason, action, follow-up date, confidence, and channel.

## 1:20–2:20 — Live lead example

Open a synthetic lead whose message says the candidate is interested but needs to discuss the course with parents.

Show:
- `DISCUSSION_PENDING`
- high priority
- follow-up date
- recommendation
- personalized WhatsApp draft
- email alternative

Say: "The important part is the reason. The counselor can see why the system made the recommendation."

## 2:20–3:10 — Human approval and email

Edit the email subject/body, then approve in mock mode.

Show that the system records the execution result and audit event.

Explain: "Real email sending is an explicit configuration. The default is dry-run. WhatsApp is not autonomously sent; the counselor stays in control."

## 3:10–4:00 — Failure handling

Run the evaluation/hardening flow. Show a prompt-injection test and explain that lead text is treated as untrusted data.

Show a failed or rejected case and its manual-review path.

## 4:00–4:40 — Evaluation evidence

Show the 12-case evaluation result: 12/12 on the current deterministic regression suite, plus the retained first-iteration failures.

Say: "I did not hide failures. Four cases initially failed; I kept them as an iteration artifact, fixed the root causes, and reran regression."

Clarify that this is synthetic/mock regression evidence, not production-LLM accuracy.

## 4:40–5:00 — Limitation and next step

"The biggest remaining limitation is production validation with real anonymized operational data and a production model/provider. The next two weeks would focus on measuring time, manual touches, edits, and decision accuracy against the existing workflow, then expanding the test set from real failure modes."
