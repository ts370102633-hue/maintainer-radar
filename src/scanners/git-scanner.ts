import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ScannerContext, ScannerResult } from "../types.js";

const execFileAsync = promisify(execFile);

async function git(context: ScannerContext, args: string[]) {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd: context.repoPath, timeout: 5000 });
    return stdout.trim();
  } catch {
    return undefined;
  }
}

export async function scanGit(context: ScannerContext): Promise<ScannerResult> {
  const root = await git(context, ["rev-parse", "--show-toplevel"]);
  const isRepo = Boolean(root);
  const remote = isRepo ? await git(context, ["remote", "get-url", "origin"]) : undefined;
  const tags = isRepo ? await git(context, ["tag", "--list"]) : undefined;
  const commitCountText = isRepo ? await git(context, ["rev-list", "--count", "HEAD"]) : undefined;
  const commitCount = commitCountText ? Number(commitCountText) : 0;
  const hasReleaseTag = Boolean(tags && tags.split("\n").filter(Boolean).length > 0);

  const checks = [
    {
      id: "git:repo",
      label: "Git repository",
      status: isRepo ? "pass" as const : "fail" as const,
      points: isRepo ? 5 : 0,
      maxPoints: 5,
      detail: isRepo ? "Repository is under git." : "No git repository detected.",
    },
    {
      id: "git:remote",
      label: "Remote origin",
      status: remote ? "pass" as const : "warn" as const,
      points: remote ? 3 : 0,
      maxPoints: 3,
      detail: remote ? `origin: ${remote}` : "No git remote origin detected.",
    },
    {
      id: "git:release-tag",
      label: "Release tag",
      status: hasReleaseTag ? "pass" as const : "warn" as const,
      points: hasReleaseTag ? 4 : 0,
      maxPoints: 4,
      detail: hasReleaseTag ? "At least one git tag exists." : "No release tags detected.",
    },
    {
      id: "git:history",
      label: "Commit history",
      status: commitCount >= 3 ? "pass" as const : "warn" as const,
      points: Math.min(3, commitCount),
      maxPoints: 3,
      detail: `${commitCount} commits detected.`,
    },
  ];

  const findings = [];
  if (!isRepo) {
    findings.push({
      id: "git-missing",
      title: "Project is not a git repository",
      severity: "high" as const,
      category: "git" as const,
      recommendation: "Initialize git and push to a public repository before applying for OSS maintainer support.",
    });
  }
  if (isRepo && !hasReleaseTag) {
    findings.push({
      id: "release-tag-missing",
      title: "No release tag found",
      severity: "medium" as const,
      category: "release" as const,
      recommendation: "Create a v0.1.0 release tag to show a maintained release surface.",
    });
  }

  return { name: "Git", checks, findings, metadata: { remote, commitCount } };
}
