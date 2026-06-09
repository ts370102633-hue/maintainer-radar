# Maintainer Radar

Maintainer Radar is a local-first CLI that generates repository health,
security hygiene, release readiness, and OSS application readiness reports for
open-source maintainers.

It is built for the maintenance work that usually sits between coding and
project stewardship: reviewing repo health, spotting sensitive files before a
public release, checking docs and release surfaces, and creating prioritized
maintainer tasks.

## Why This Exists

Open-source maintainers carry invisible work: triaging issues, reviewing pull
requests, preparing releases, protecting security hygiene, and keeping docs
useful. Maintainer Radar gives maintainers a fast local report they can use
before publishing, applying for maintainer support, or handing a project to an
AI coding agent.

## Quick Start

Run the current public source release from GitHub:

```bash
npx --yes github:ts370102633-hue/maintainer-radar scan .
```

Or install it globally from GitHub:

```bash
npm install -g github:ts370102633-hue/maintainer-radar
maintainer-radar scan .
```

The npm registry package is planned after maintainer account login and publish
2FA setup. Until then, use the GitHub install path above or run from a local
clone:

```bash
npm install
npm run build
node dist/cli.js scan .
```

After scanning, open:

```text
maintainer-radar-report/01-summary.md
```

## CLI Usage

```bash
maintainer-radar scan [repo-path] [--out report-dir] [--json] [--private]
```

Examples:

```bash
maintainer-radar scan .
maintainer-radar scan /path/to/repo --out maintainer-radar-report
maintainer-radar scan /path/to/private-repo --out private-report --private
maintainer-radar scan . --json
```

## Report Outputs

The CLI writes:

```text
maintainer-radar-report/
  01-summary.md
  02-health-score.md
  03-security-risks.md
  04-oss-readiness.md
  05-release-readiness.md
  06-maintainer-tasks.md
  manifest.json
```

When `--private` is used, the report also includes:

```text
00-private-report-notice.md
```

Use private mode for internal repositories, customer projects, portfolio tools,
or anything that may contain local paths or sensitive operational context.

## What It Checks

- README, LICENSE, SECURITY.md, CONTRIBUTING.md, and .env.example
- build, test, lint, and public package signals
- ecosystem detection for Node.js, Python, and Go projects
- Git repository, origin, release tags, and commit history
- GitHub Actions workflow presence
- release notes and roadmap presence
- common secret patterns and sensitive-looking files

## Local-first Data Handling

Maintainer Radar does not upload repository content. It reads local files and
writes local Markdown reports. Secret findings are redacted in report evidence,
but maintainers should still review generated reports before publishing.

## Intended Maintainer Workflows

- pre-open-source readiness review
- release readiness check
- security and privacy hygiene check
- AI handoff pack before using Codex or another coding agent
- application readiness review for open-source maintainer support programs

## Non-goals

- It is not a full SAST tool.
- It is not a dependency vulnerability scanner.
- It does not replace legal review.
- It does not automatically upload code or reports.

## Development

```bash
npm install
npm run build
npm test
npm run example
```

## Ecosystem Support

v0.1.3 detects:

- Node.js through `package.json`
- Python through `pyproject.toml`, `requirements.txt`, or `setup.py`
- Go through `go.mod`

Python and Go projects receive ecosystem-specific readiness checks so
maintainers can see whether dependency and test/build signals are present.
Non-Node projects are not penalized for missing `package.json` when a Python or
Go manifest is detected.

## Roadmap

- GitHub Action mode
- richer language ecosystem detection
- optional AI summary generation
- issue and pull request triage inputs
- release note drafting
- maintainer support application drafts

## License

MIT
