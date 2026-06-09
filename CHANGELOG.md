# Changelog

## v0.1.2 - 2026-06-09

- Add ecosystem detection for Node.js, Python, and Go projects.
- Add Python readiness checks for dependency manifests, test signals, and build backend signals.
- Add Go readiness checks for `go.mod` module declarations and `go.sum`.
- Add test coverage for Python and Go ecosystem detection.

## v0.1.1 - 2026-06-09

- Add `--private` scan mode for internal repositories.
- Add a `00-private-report-notice.md` output file in private mode.
- Add test coverage for private report notice generation.

## v0.1.0 - 2026-06-08

- Add local-first repository health scan.
- Add documentation, package, CI, git, release, and security scanners.
- Add Markdown report pack and JSON manifest output.
- Add OSS application readiness report.
- Add tests for report generation and secret detection.
