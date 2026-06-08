# Architecture

Maintainer Radar is a local-first Node.js CLI.

## Units

- `src/cli.ts`: parses CLI arguments and prints the result summary.
- `src/index.ts`: coordinates scans, scoring, tasks, and report writing.
- `src/scanners/*`: deterministic scanners for docs, package metadata, git,
  CI, release readiness, and security hygiene.
- `src/scoring/health-score.ts`: converts checks and findings into a 0-100
  score and maintainer tasks.
- `src/reports/markdown-writer.ts`: writes Markdown and JSON outputs.
- `src/rules/*`: scanner rules and patterns.

## Data Flow

1. User runs `maintainer-radar scan`.
2. The CLI resolves the repository and output directory.
3. Scanners run locally against files and git metadata.
4. Checks and findings are flattened.
5. A health score and task list are generated.
6. Markdown reports and `manifest.json` are written locally.

## Safety Boundaries

- No network calls in v0.1.0.
- No report upload.
- No raw secret printing by design.
- No automatic file modification in the scanned repository.
