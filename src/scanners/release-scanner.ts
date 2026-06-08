import path from "node:path";
import type { ScannerContext, ScannerResult } from "../types.js";
import { exists } from "../utils/files.js";

export async function scanRelease(context: ScannerContext): Promise<ScannerResult> {
  const changelog = await exists(path.join(context.repoPath, "CHANGELOG.md"));
  const releaseNotes = await exists(path.join(context.repoPath, "docs", "release-notes.md"));
  const roadmap = await exists(path.join(context.repoPath, "docs", "roadmap.md"));

  const checks = [
    {
      id: "release:notes",
      label: "Release notes surface",
      status: changelog || releaseNotes ? "pass" as const : "warn" as const,
      points: changelog || releaseNotes ? 5 : 0,
      maxPoints: 5,
      detail: changelog || releaseNotes ? "Release notes or changelog found." : "No CHANGELOG.md or docs/release-notes.md found.",
    },
    {
      id: "release:roadmap",
      label: "Roadmap",
      status: roadmap ? "pass" as const : "warn" as const,
      points: roadmap ? 3 : 0,
      maxPoints: 3,
      detail: roadmap ? "docs/roadmap.md found." : "No docs/roadmap.md found.",
    },
  ];

  return {
    name: "Release readiness",
    checks,
    findings: checks
      .filter((check) => check.status !== "pass")
      .map((check) => ({
        id: `${check.id}:missing`,
        title: check.label,
        severity: "low" as const,
        category: "release" as const,
        recommendation: check.id === "release:roadmap"
          ? "Add docs/roadmap.md with near-term maintainer tasks and public issues."
          : "Add CHANGELOG.md or docs/release-notes.md before publishing v0.1.0.",
      })),
  };
}
