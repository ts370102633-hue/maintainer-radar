# Maintainer Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, runnable maintainer workflow CLI optimized for Codex for Open Source application credibility.

**Architecture:** A local-first TypeScript CLI coordinates deterministic scanners, scoring, and Markdown report writing. The first release avoids network calls and AI dependency so it is safe, reproducible, and easy to review.

**Tech Stack:** Node.js 20+, TypeScript, Node built-in test runner, GitHub CLI for publishing.

---

### Task 1: Project Skeleton

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.env.example`

- [x] Define a public npm-ready package with `maintainer-radar` bin.
- [x] Configure TypeScript output to `dist`.
- [x] Add build, test, scan, and example scripts.

### Task 2: Core Types and Utilities

**Files:**
- Create: `src/types.ts`
- Create: `src/utils/files.ts`

- [x] Define findings, checks, scanner result, health score, task, and manifest types.
- [x] Add local file existence, text read, and safe recursive file listing utilities.

### Task 3: Scanners

**Files:**
- Create: `src/scanners/docs-scanner.ts`
- Create: `src/scanners/package-scanner.ts`
- Create: `src/scanners/security-scanner.ts`
- Create: `src/scanners/git-scanner.ts`
- Create: `src/scanners/ci-scanner.ts`
- Create: `src/scanners/release-scanner.ts`
- Create: `src/rules/secret-patterns.ts`

- [x] Implement documentation checks.
- [x] Implement package script checks.
- [x] Implement secret and sensitive-file checks with redaction.
- [x] Implement git, CI, and release surface checks.

### Task 4: Scoring and Reports

**Files:**
- Create: `src/scoring/health-score.ts`
- Create: `src/reports/markdown-writer.ts`

- [x] Convert scanner checks to a 0-100 score.
- [x] Generate prioritized maintainer tasks.
- [x] Write six Markdown reports and a JSON manifest.

### Task 5: CLI

**Files:**
- Create: `src/index.ts`
- Create: `src/cli.ts`

- [x] Implement `maintainer-radar scan [repo-path] [--out report-dir] [--json]`.
- [x] Print report location and summary.

### Task 6: OSS Packaging

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `SECURITY.md`
- Create: `CONTRIBUTING.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `docs/architecture.md`
- Create: `docs/roadmap.md`
- Create: `docs/oss-application-strategy.md`

- [x] Frame the project as an open-source maintainer workflow tool.
- [x] Document local-first data handling and security boundaries.
- [x] Provide application strategy language.

### Task 7: Tests and Verification

**Files:**
- Create: `tests/scan.test.mjs`

- [x] Test report generation on a sample repo.
- [x] Test obvious secret detection.
- [ ] Run `npm install`.
- [ ] Run `npm run build`.
- [ ] Run `npm test`.
- [ ] Run self-scan and preserve example output.

### Task 8: GitHub Publication

**Files:**
- Modify: Git repository metadata.

- [ ] Initialize git.
- [ ] Commit v0.1.0.
- [ ] Create public GitHub repo `ts370102633-hue/maintainer-radar`.
- [ ] Push default branch and tag `v0.1.0`.
