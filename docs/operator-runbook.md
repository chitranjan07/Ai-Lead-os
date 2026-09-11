# Operator Runbook

## Start

1. Copy `.env.example` to `.env`.
2. Start MongoDB with Docker Compose or use a configured MongoDB instance.
3. From `server/`, run `npm install` and `npm run seed`.
4. Start the API with `npm run dev`.
5. From `client/`, run `npm install` and `npm run dev`.
6. Open the Vite URL shown in the terminal.

## Safe default

Email provider is `mock` by default. No real external email is sent until SMTP is explicitly configured. WhatsApp remains human-operated.

## Daily workflow

Import the approved CSV/CRM export → review the lead queue → analyze the due/selected leads → inspect AI reason, priority, action, date, and channel → edit when necessary → approve or reject → execute approved email or copy the WhatsApp-ready message → verify status and audit trail.

## When AI output looks wrong

Reject the draft, inspect the conversation and state, and route the lead to manual review. Do not override a safety or opt-out flag simply to send a message.

## When email fails

Keep the lead in a recoverable failed state. Check SMTP configuration/provider response, retry only after correcting the issue, and verify that the system records `SENT` only after provider confirmation.

## Evaluation

Run `cd server && npm run evaluate` for the 12-case regression suite and `npm run hardening` for validation/safety checks.

## Before production

Add real authentication/authorization, organization-level tenant isolation, production secret storage, provider webhooks/status handling, rate limits, structured data retention policy, consent/opt-out handling, monitoring, and a reviewed production evaluation set.
