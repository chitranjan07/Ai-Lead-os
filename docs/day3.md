# Day 3 — Working Core

## Trigger → Output
1. Import synthetic lead data through CSV or JSON.
2. Select a lead from the operations queue.
3. Analyze the lead with the configurable AI provider.
4. Create validated priority, stage, next action, follow-up date, channel and confidence.
5. Generate channel-specific WhatsApp and email drafts.
6. Human reviews, edits, approves or rejects.
7. Approval executes the selected email through the configured email service; WhatsApp is prepared for manual send.
8. Record execution status, provider result and audit events.
9. Sync lead status through the Google Sheets integration abstraction (mock in v0).

## Email automation
The default email provider is `mock`, so approval never sends an external email. To enable a controlled SMTP test, set `EMAIL_PROVIDER=smtp` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM` in `.env`.

## Reliability invariant
A failed email must produce `FAILED` and must never be recorded as completed. The system records `DRY_RUN_SENT` separately from real `SENT`.

## Integration boundaries
- Lead source: CSV/CRM export abstraction
- Tracking: Google Sheets abstraction
- Communication: Email service + WhatsApp-ready message
- AI: Mock provider or local Ollama provider
