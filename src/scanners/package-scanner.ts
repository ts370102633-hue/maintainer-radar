import path from "node:path";
import type { CheckResult, Finding, ScannerContext, ScannerResult } from "../types.js";
import { readTextIfExists } from "../utils/files.js";

export async function scanPackage(context: ScannerContext): Promise<ScannerResult> {
  const packagePath = path.join(context.repoPath, "package.json");
  const text = await readTextIfExists(packagePath);
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];

  if (!text) {
    return {
      name: "Build and package",
      checks: [{
        id: "package:manifest",
        label: "Package manifest",
        status: "warn",
        points: 0,
        maxPoints: 4,
        detail: "package.json was not found. This may be fine for non-Node projects.",
      }],
      findings: [],
    };
  }

  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {
      name: "Build and package",
      checks: [{
        id: "package:parse",
        label: "package.json parse",
        status: "fail",
        points: 0,
        maxPoints: 4,
        detail: "package.json is not valid JSON.",
      }],
      findings: [{
        id: "package-json-invalid",
        title: "package.json is invalid",
        severity: "high",
        category: "build",
        file: "package.json",
        recommendation: "Fix package.json so maintainers can install, build, and test the project.",
      }],
    };
  }

  const scripts = (pkg.scripts ?? {}) as Record<string, string>;
  const hasBuild = Boolean(scripts.build);
  const hasTest = Boolean(scripts.test);
  const hasLint = Boolean(scripts.lint);
  const isPrivate = pkg.private === true;

  checks.push(
    {
      id: "package:build",
      label: "Build script",
      status: hasBuild ? "pass" as const : "warn" as const,
      points: hasBuild ? 5 : 0,
      maxPoints: 5,
      detail: hasBuild ? `build script: ${scripts.build}` : "No build script found.",
    },
    {
      id: "package:test",
      label: "Test script",
      status: hasTest ? "pass" as const : "warn" as const,
      points: hasTest ? 5 : 0,
      maxPoints: 5,
      detail: hasTest ? `test script: ${scripts.test}` : "No test script found.",
    },
    {
      id: "package:lint",
      label: "Lint script",
      status: hasLint ? "pass" as const : "warn" as const,
      points: hasLint ? 3 : 0,
      maxPoints: 3,
      detail: hasLint ? `lint script: ${scripts.lint}` : "No lint script found.",
    },
    {
      id: "package:private",
      label: "Public package readiness",
      status: isPrivate ? "fail" as const : "pass" as const,
      points: isPrivate ? 0 : 3,
      maxPoints: 3,
      detail: isPrivate ? "package.json has private=true." : "package is not marked private.",
    },
  );

  if (isPrivate) {
    findings.push({
      id: "package-private",
      title: "Package is marked private",
      severity: "medium",
      category: "oss",
      file: "package.json",
      recommendation: "Remove private=true before publishing an OSS package or explain why the repo is source-only.",
    });
  }

  return { name: "Build and package", checks, findings, metadata: { packageName: pkg.name, version: pkg.version } };
}
