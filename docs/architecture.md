# AI Lead Follow-up OS — Architecture

The v0 is a modular monolith with React/Vite frontend, Express API, MongoDB persistence, a provider-agnostic AI service, and channel integration services.

## Data flow

Lead source (CSV/CRM export) -> Lead Store -> AI Analysis -> Follow-up Recommendation -> Message Draft -> Validation -> Human Approval -> Email / WhatsApp-ready output -> Audit Log + Status update.

## Design decisions

- AI provider is abstracted behind `AIService`; v0 defaults to a deterministic mock provider and can use Ollama locally.
- Email provider is abstracted; v0 defaults to dry-run/mock and can use SMTP.
- Lead text is untrusted input and is never treated as instructions.
- External messaging requires human approval.
- A send failure cannot be recorded as `SENT`.
- MongoDB stores lead, follow-up, and audit data.
