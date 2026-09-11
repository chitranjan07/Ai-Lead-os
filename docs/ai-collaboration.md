# AI Collaboration Note

## Tools and role

AI assistants were used as an engineering copilot for architecture exploration, implementation scaffolding, debugging ideas, test-case generation, documentation drafting, and review of edge cases.

## Delegated work

- propose alternative workflow architectures
- draft schemas, API contracts, and prompt structures
- generate synthetic lead scenarios and edge cases
- suggest failure modes and validation rules
- draft documentation and demo narrative

## Verification

Generated code was checked through direct source inspection and Node syntax/evaluation runs. The synthetic regression suite and hardening suite were executed after changes. Important workflow decisions were reviewed against the original operational problem rather than accepted solely because an AI suggested them.

## Rejected / manually corrected ideas

- autonomous WhatsApp sending was rejected for the MVP because it adds operational risk and integration complexity
- unnecessary multi-agent architecture was rejected because it did not solve a demonstrated bottleneck
- fabricated business-impact metrics were rejected; time and ROI claims remain measurement tasks
- production candidate data was not used; the evaluation uses synthetic data

## Human-owned decisions

The project scope, target user, human-approval boundary, non-goals, evaluation criteria, safety requirements, integration priorities, and final acceptance decisions remain human-owned.
