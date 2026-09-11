# Evaluation

The evaluation set contains 12 representative, edge, and failure cases. Expected behavior focuses on stage, priority, and channel recommendation, with additional manual scoring for message quality, follow-up date accuracy, and human intervention.

Run:

```bash
npm run seed
npm run test:evaluation
```

The generated `evaluation/latest-results.json` is an artifact, not a claim of production accuracy. Baseline timings and final timings must be measured during the sprint rather than invented.
