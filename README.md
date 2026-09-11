# AI Lead Follow-up OS

An approval-first AI workflow for admissions lead follow-up.

### CSV import
Use **Choose CSV File** in the dashboard to open the operating system file picker and select a `.csv` file. The importer reads the selected file in the browser and sends its contents to the API.

Expected header:

```csv
leadId,name,email,phone,course,source,stage,formStatus,lastMessage
```


## MVP

- Analyze lead context and conversation
- Predict stage, intent, priority, next action, follow-up date, and channel
- Generate WhatsApp and email drafts
- Require human approval before execution
- Record workflow/audit state
- Run a 12-case evaluation set
- Work without a paid AI account using the deterministic mock provider
- Optionally use Ollama locally
- Optionally send controlled real emails via SMTP

## Setup

```bash
npm install
npm run seed
npm run dev
```

Frontend: http://localhost:5173
API: http://localhost:4000

## Optional local AI

Install Ollama separately, then set:

```env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

## Optional email

Default is safe mock/dry-run. To use SMTP:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=...
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM=Admissions Team <you@example.com>
```

Only test with controlled recipients and approved content.

## Day 3 additions
- CSV lead import (`POST /api/leads/import`)
- Search/filterable lead queue
- Analyze-visible workflow
- Human approval + rejection
- Email execution with mock dry-run or SMTP
- WhatsApp-ready copy action (no autonomous WhatsApp send)
- Execution result + audit log state
- Sample CSV in `sample-data/leads.csv`

## Day 4 Evaluation

Run the synthetic regression suite:

```bash
cd server
npm run evaluate
```

Run hardening checks:

```bash
npm run hardening
```

The evaluation report is written to `evaluation/latest-results.json`; CSV results are in `evaluation/results.csv`. The reported 12/12 result is for the deterministic mock/ruleset regression suite and should not be presented as production-LLM accuracy.

## Day 5 Handoff

See:
- `docs/case-study.md`
- `docs/operator-runbook.md`
- `docs/demo-script.md`
- `docs/evaluation-summary.md`
- `docs/adoption-plan.md`
- `docs/ai-collaboration.md`

### Final synthetic evidence

- Regression: 12/12 passed
- Hardening: 3/3 passed
- Average message-quality heuristic: 10/10 under the deterministic mock/ruleset

These figures are regression-harness evidence only, not production AI accuracy or ROI.

## Azure OpenAI + MongoDB Atlas quick start

Set `AI_PROVIDER=azure` and provide `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`. The deployment value is the name of your Azure model deployment, not necessarily the base model name. The app uses Azure OpenAI's `/openai/v1/chat/completions` endpoint.

For MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string and allow your development machine's IP in Atlas Network Access. Never commit `.env`.

Then run:

```bash
npm install
npm run seed
npm run dev
```

The frontend is at `http://localhost:5173` and the API is at `http://localhost:4000`.

## Real channel setup

### Email
Set `EMAIL_PROVIDER=smtp` and configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`. The server uses Nodemailer SMTP. Keep credentials in `server/.env` only.

### WhatsApp
Set `WHATSAPP_PROVIDER=meta_cloud`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_GRAPH_VERSION`. The `Approve & send` action will call the Meta WhatsApp Cloud API for approved text messages. Recipient numbers should be E.164; the app can prepend the configured default country code to a 10-digit number.

Important: WhatsApp messaging availability depends on the conversation state and Meta business/template requirements. Test with a WhatsApp Business test recipient before production use. See Meta's WhatsApp Business Platform documentation for current messaging rules.


## Manual review approval
Manual-review follow-ups with a sendable draft can now be explicitly approved after human inspection. Safety-blocked cases with recommendedChannel=NONE remain non-sendable.
