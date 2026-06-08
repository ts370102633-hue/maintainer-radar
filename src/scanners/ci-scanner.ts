import path from "node:path";
import type { ScannerContext, ScannerResult } from "../types.js";
import { exists } from "../utils/files.js";

export async function scanCi(context: ScannerContext): Promise<ScannerResult> {
  const githubWorkflowDir = path.join(context.repoPath, ".github", "workflows");
  const hasGithubActions = await exists(githubWorkflowDir);

  return {
    name: "CI",
    checks: [{
      id: "ci:github-actions",
      label: "GitHub Actions workflow",
      status: hasGithubActions ? "pass" : "warn",
      points: hasGithubActions ? 5 : 0,
      maxPoints: 5,
      detail: hasGithubActions ? ".github/workflows is present." : "No .github/workflows directory found.",
    }],
    findings: hasGithubActions ? [] : [{
      id: "ci-missing",
      title: "CI workflow is missing",
      severity: "medium",
      category: "build",
      recommendation: "Add a GitHub Actions workflow that runs build and test on pull requests.",
    }],
  };
}
