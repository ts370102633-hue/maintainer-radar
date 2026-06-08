# Contributing

Maintainer Radar is built for practical open-source maintenance workflows.

## Good First Contributions

- Add scanner rules for common project ecosystems.
- Improve report wording and remediation steps.
- Add tests for risk detection.
- Add examples for real open-source maintenance workflows.

## Development

```bash
npm install
npm run build
npm test
npm run example
```

## Pull Request Expectations

- Keep scanner rules deterministic and local-first.
- Do not add network calls unless the feature is clearly opt-in.
- Do not print raw secrets.
- Add or update tests for new scanner behavior.
- Keep report text actionable for maintainers.

## Maintainer Workflow

Maintainers use this project to:

- review repository health
- find documentation gaps
- identify sensitive-file risks
- prepare releases
- create follow-up maintenance tasks
