import { promises as fs } from "node:fs";
import path from "node:path";
import type { CheckResult, Finding, HealthScore, MaintainerTask, ReportManifest } from "../types.js";

export async function writeReports(outputPath: string, manifest: ReportManifest): Promise<void> {
  await fs.mkdir(outputPath, { recursive: true });
  const writes = [
    write("01-summary.md", summary(manifest)),
    write("02-health-score.md", healthScore(manifest.score, manifest.checks)),
    write("03-security-risks.md", securityRisks(manifest.findings)),
    write("04-oss-readiness.md", ossReadiness(manifest)),
    write("05-release-readiness.md", releaseReadiness(manifest.checks, manifest.findings)),
    write("06-maintainer-tasks.md", maintainerTasks(manifest.tasks)),
    write("manifest.json", JSON.stringify(manifest, null, 2)),
  ];
  if (manifest.metadata.privateReport === true) {
    writes.unshift(write("00-private-report-notice.md", privateReportNotice(manifest)));
  }
  await Promise.all(writes);

  async function write(file: string, content: string) {
    await fs.writeFile(path.join(outputPath, file), content, "utf8");
  }
}

function privateReportNotice(manifest: ReportManifest): string {
  return `# Private Report Notice

This report was generated in private scan mode.

Repository:

\`\`\`text
${manifest.repoPath}
\`\`\`

## Do Not Publish Without Review

This report may contain local paths, sensitive-file findings, customer or project
context, portfolio context, or other private operational details.

Before committing, sharing, or publishing this report:

1. Review every Markdown file and \`manifest.json\`.
2. Remove private paths and customer/project names if they are not meant to be public.
3. Redact security findings that reveal sensitive operational structure.
4. Prefer publishing only an aggregate score or manually reviewed excerpt.

Generated at: ${manifest.generatedAt}
`;
}

function summary(manifest: ReportManifest): string {
  return `# Maintainer Radar Summary

Generated at: ${manifest.generatedAt}

Repository:

\`\`\`text
${manifest.repoPath}
\`\`\`

Overall score: **${manifest.score.total}/100**

Grade: **${manifest.score.grade}**

## What This Means

${gradeMessage(manifest.score)}

## Top Findings

${listFindings(manifest.findings.slice(0, 8))}

## Next Maintainer Actions

${listTasks(manifest.tasks.slice(0, 8))}
`;
}

function healthScore(score: HealthScore, checks: CheckResult[]): string {
  return `# Health Score

Overall: **${score.total}/100**

Grade: **${score.grade}**

## Buckets

| Bucket | Score |
| --- | ---: |
${score.buckets.map((bucket) => `| ${bucket.name} | ${bucket.score}/${bucket.maxScore} |`).join("\n")}

## Checks

| Check | Status | Score | Detail |
| --- | --- | ---: | --- |
${checks.map((check) => `| ${escapeMd(check.label)} | ${check.status} | ${check.points}/${check.maxPoints} | ${escapeMd(check.detail)} |`).join("\n")}
`;
}

function securityRisks(findings: Finding[]): string {
  const security = findings.filter((finding) => finding.category === "security");
  return `# Security and Privacy Risks

${security.length === 0 ? "No security or privacy findings were detected by the local rule scan." : listFindings(security)}

## Reminder

This scanner is a first pass. It does not replace a full security review,
dependency audit, legal review, or maintainer review before publishing a repo.
`;
}

function ossReadiness(manifest: ReportManifest): string {
  const blocking = manifest.findings.filter((finding) => finding.severity === "critical" || finding.severity === "high");
  const estimatedChance =
    manifest.score.total >= 85 && blocking.length === 0 ? "high" :
    manifest.score.total >= 70 && blocking.length === 0 ? "medium-high" :
    manifest.score.total >= 55 ? "medium" : "low";

  return `# OSS Application Readiness

Estimated readiness: **${estimatedChance}**

This estimate is based on repository hygiene, visible maintainer surface,
release readiness, documentation, and security risk signals.

## Strong Signals

${manifest.checks.filter((check) => check.status === "pass").slice(0, 10).map((check) => `- ${check.label}`).join("\n") || "- No strong signals detected yet."}

## Blocking or Weak Signals

${listFindings(manifest.findings.filter((finding) => finding.severity !== "low").slice(0, 12))}

## Suggested Application Framing

Maintainer Radar helps open-source maintainers reduce review and release load by
generating local-first repository health reports, security hygiene checks,
release-readiness notes, and prioritized maintainer tasks. Codex can be used to
maintain scanner rules, review pull requests, improve documentation, and build
automation for real maintainer workflows.
`;
}

function releaseReadiness(checks: CheckResult[], findings: Finding[]): string {
  const releaseChecks = checks.filter((check) => check.id.startsWith("release:") || check.id.startsWith("git:release"));
  const releaseFindings = findings.filter((finding) => finding.category === "release");
  return `# Release Readiness

## Checks

| Check | Status | Score | Detail |
| --- | --- | ---: | --- |
${releaseChecks.map((check) => `| ${escapeMd(check.label)} | ${check.status} | ${check.points}/${check.maxPoints} | ${escapeMd(check.detail)} |`).join("\n") || "| No release checks | info | 0/0 | No release checks ran. |"}

## Release Tasks

${releaseFindings.length ? listFindings(releaseFindings) : "No release-specific findings were detected."}
`;
}

function maintainerTasks(tasks: MaintainerTask[]): string {
  return `# Maintainer Tasks

${listTasks(tasks)}
`;
}

function gradeMessage(score: HealthScore): string {
  if (score.grade === "ready") return "This repository looks ready for public OSS maintenance workflows. Review the report manually before publishing.";
  if (score.grade === "usable") return "This repository is usable but should address weak documentation, release, or security signals before applying for maintainer support.";
  if (score.grade === "internal") return "This repository still looks like an internal project. Clean up security, docs, and release signals before presenting it as OSS.";
  return "This repository is high-risk to publish. Address critical findings before using it in any public application.";
}

function listFindings(findings: Finding[]): string {
  if (findings.length === 0) return "- No findings.";
  return findings.map((finding) => {
    const where = finding.file ? ` (${finding.file})` : "";
    return `- **[${finding.severity}] ${finding.title}${where}**: ${finding.recommendation}`;
  }).join("\n");
}

function listTasks(tasks: MaintainerTask[]): string {
  if (tasks.length === 0) return "- No tasks.";
  return tasks.map((task) => `- **P${task.priority}: ${task.title}** - ${task.why}`).join("\n");
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
