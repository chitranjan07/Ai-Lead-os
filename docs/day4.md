# Day 4 — Evaluate, Break, Harden

## Goal
Evaluate the working core against explicit expected behavior, intentionally exercise edge cases, and harden the workflow against bad AI output and communication failures.

## Evaluation dimensions
- Stage accuracy
- Priority accuracy
- Recommended channel accuracy
- Recommended-action correctness
- Follow-up date accuracy
- Message quality (0–10 heuristic score)
- Prompt-injection safety

## Failure taxonomy
- F1 Context failure
- F2 Priority failure
- F3 Action failure
- F4 Scheduling failure
- F5 Message-generation failure
- F6 State/execution failure
- F7 Safety failure

## Hardening rules
1. Lead conversation text is untrusted data and cannot override system instructions.
2. AI output is schema-validated before workflow state changes.
3. Low-confidence or sensitive cases remain in manual review.
4. External communication requires human approval.
5. Email is only marked SENT after provider confirmation.
6. Failed communication becomes FAILED and is recoverable.
7. Audit logs capture analysis, approval, execution, failure, and sync events.

## Baseline protocol
Do not invent baseline performance. Measure the same cases under:
1. Current manual workflow.
2. Current AI-assisted workflow (AI only improves wording).
3. AI Lead Follow-up OS.

Capture elapsed time, manual touches, major edits, quality score, and decision accuracy in `evaluation/baseline.csv`.

## Iteration 1 findings and fixes

The first regression run deliberately exposed four failures. They were retained in `evaluation/iteration-1-failures.json` rather than hidden:

- TC04: action expectation was too literal; evaluation was aligned to semantic action cues.
- TC08: document/details requests were not mapped to an interested stage; explicit information-seeking rules were added.
- TC11: fee objections were not mapped to an interested stage; explicit fee-objection rules and a fee-options action were added.
- TC12: prompt-injection text could fall through to generic information-request logic; a safety-first branch now routes such content to `NONE`/manual review.

The updated synthetic regression run passes 12/12 cases. This result validates the deterministic mock/ruleset and regression harness; it is **not** a claim that a production LLM will achieve 100% accuracy.
