# Maintainer Radar Design

## Goal

Build a public, application-ready open-source project whose main purpose is to
help open-source maintainers reduce maintenance load and prepare repositories
for AI-assisted maintenance workflows.

## Primary Success Metric

Increase the chance of acceptance into Codex for Open Source by creating a
credible public maintainer tool with a runnable CLI, clear OSS packaging,
release surface, security posture, and practical maintainer workflow.

## Product

Maintainer Radar is a local-first CLI. A maintainer runs one command against a
repository and receives a Markdown report pack covering repository health,
security hygiene, OSS readiness, release readiness, and prioritized maintainer
tasks.

## MVP Scope

- CLI command: `maintainer-radar scan [repo-path]`
- Local deterministic scanners
- Markdown report pack
- JSON manifest
- README, LICENSE, SECURITY.md, CONTRIBUTING.md, roadmap
- Tests for scan output and secret detection

## Non-goals

- No web app in v0.1.0.
- No SaaS.
- No GitHub OAuth.
- No automatic PR creation.
- No network calls.
- No upload of repository content.

## Risk Controls

- Secret evidence is redacted.
- Reports are local by default.
- Scanners are deterministic without API keys.
- Generated reports warn users to review before publishing.

## Acceptance Criteria

- `npm run build` passes.
- `npm test` passes.
- `node dist/cli.js scan .` writes a complete report pack.
- Git repository is initialized and committed.
- A public GitHub repository can be created and pushed.
- README frames the project as a maintainer workflow tool.
