import path from "node:path";
import type { ReportManifest, ScannerContext } from "./types.js";
import { scanDocs } from "./scanners/docs-scanner.js";
import { scanPackage } from "./scanners/package-scanner.js";
import { scanSecurity } from "./scanners/security-scanner.js";
import { scanGit } from "./scanners/git-scanner.js";
import { scanCi } from "./scanners/ci-scanner.js";
import { scanRelease } from "./scanners/release-scanner.js";
import { calculateHealthScore, createMaintainerTasks, flattenChecks, flattenFindings } from "./scoring/health-score.js";
import { writeReports } from "./reports/markdown-writer.js";

export type ScanOptions = {
  repoPath: string;
  outputPath?: string;
  privateReport?: boolean;
};

export async function runScan(options: ScanOptions): Promise<ReportManifest> {
  const repoPath = path.resolve(options.repoPath);
  const outputPath = path.resolve(options.outputPath ?? path.join(repoPath, "maintainer-radar-report"));
  const context: ScannerContext = { repoPath, outputPath, now: new Date() };

  const results = await Promise.all([
    scanDocs(context),
    scanPackage(context),
    scanSecurity(context),
    scanGit(context),
    scanCi(context),
    scanRelease(context),
  ]);

  const checks = flattenChecks(results);
  const findings = flattenFindings(results);
  const score = calculateHealthScore(results);
  const tasks = createMaintainerTasks(findings, score);
  const metadata = {
    privateReport: options.privateReport === true,
    ...Object.fromEntries(results.map((result) => [result.name, result.metadata ?? {}])),
  };

  const manifest: ReportManifest = {
    generatedAt: context.now.toISOString(),
    repoPath,
    score,
    checks,
    findings,
    tasks,
    metadata,
  };

  await writeReports(outputPath, manifest);
  return manifest;
}
