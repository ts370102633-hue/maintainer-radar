import type { CheckResult, Finding, HealthScore, MaintainerTask, ScannerResult } from "../types.js";

export function flattenChecks(results: ScannerResult[]): CheckResult[] {
  return results.flatMap((result) => result.checks);
}

export function flattenFindings(results: ScannerResult[]): Finding[] {
  return results.flatMap((result) => result.findings);
}

export function calculateHealthScore(results: ScannerResult[]): HealthScore {
  const buckets = results.map((result) => {
    const maxScore = result.checks.reduce((sum, check) => sum + check.maxPoints, 0);
    const score = result.checks.reduce((sum, check) => sum + check.points, 0);
    return { name: result.name, score, maxScore };
  });

  const rawTotal = buckets.reduce((sum, bucket) => sum + bucket.score, 0);
  const rawMax = buckets.reduce((sum, bucket) => sum + bucket.maxScore, 0) || 1;
  const total = Math.round((rawTotal / rawMax) * 100);
  const grade = total >= 80 ? "ready" : total >= 60 ? "usable" : total >= 40 ? "internal" : "high-risk";

  return { total, grade, buckets };
}

export function createMaintainerTasks(findings: Finding[], score: HealthScore): MaintainerTask[] {
  const tasks: MaintainerTask[] = [];

  for (const finding of findings) {
    const priority: 1 | 2 | 3 =
      finding.severity === "critical" || finding.severity === "high" ? 1 :
      finding.severity === "medium" ? 2 : 3;
    tasks.push({
      priority,
      title: finding.title,
      why: finding.recommendation,
    });
  }

  if (score.total < 80) {
    tasks.push({
      priority: score.total < 60 ? 1 : 2,
      title: "Improve OSS readiness score before applying for maintainer support",
      why: "Maintainer support programs evaluate public repo visibility, maintenance evidence, release surface, docs, and security hygiene.",
    });
  }

  return tasks.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title)).slice(0, 20);
}
