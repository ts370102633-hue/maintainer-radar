import path from "node:path";
import type { CheckResult, Finding, ScannerContext, ScannerResult } from "../types.js";
import { exists, readTextIfExists } from "../utils/files.js";

type Ecosystem = "node" | "python" | "go";

export async function scanEcosystem(context: ScannerContext): Promise<ScannerResult> {
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];
  const ecosystems: Ecosystem[] = [];

  const hasPackageJson = await exists(path.join(context.repoPath, "package.json"));
  const hasPyproject = await exists(path.join(context.repoPath, "pyproject.toml"));
  const hasRequirements = await exists(path.join(context.repoPath, "requirements.txt"));
  const hasSetupPy = await exists(path.join(context.repoPath, "setup.py"));
  const hasGoMod = await exists(path.join(context.repoPath, "go.mod"));

  if (hasPackageJson) ecosystems.push("node");
  if (hasPyproject || hasRequirements || hasSetupPy) ecosystems.push("python");
  if (hasGoMod) ecosystems.push("go");

  checks.push({
    id: "ecosystem:detected",
    label: "Project ecosystem detection",
    status: ecosystems.length > 0 ? "pass" : "warn",
    points: ecosystems.length > 0 ? 2 : 0,
    maxPoints: 2,
    detail: ecosystems.length > 0 ? `Detected ecosystems: ${ecosystems.join(", ")}.` : "No supported ecosystem manifest detected yet.",
  });

  if (hasPyproject || hasRequirements || hasSetupPy) {
    const hasPythonDependencyManifest = hasPyproject || hasRequirements;
    const pyprojectText = await readTextIfExists(path.join(context.repoPath, "pyproject.toml"));
    const hasPythonTestSignal = Boolean(pyprojectText && /(pytest|unittest|tox|nox)/i.test(pyprojectText));
    const hasPythonBuildBackend = Boolean(pyprojectText && /build-backend|setuptools|poetry|hatchling|flit/i.test(pyprojectText));
    const pythonPoints = [hasPythonDependencyManifest, hasPythonTestSignal, hasPythonBuildBackend].filter(Boolean).length;

    checks.push({
      id: "ecosystem:python",
      label: "Python maintainer readiness",
      status: pythonPoints >= 2 ? "pass" : "warn",
      points: pythonPoints,
      maxPoints: 3,
      detail: `Python signals: dependencyManifest=${hasPythonDependencyManifest}, testSignal=${hasPythonTestSignal}, buildBackend=${hasPythonBuildBackend}.`,
    });

    if (!hasPythonDependencyManifest || !hasPythonTestSignal) {
      findings.push({
        id: "python-readiness-gap",
        title: "Python project maintenance signals are incomplete",
        severity: "medium",
        category: "build",
        recommendation: "For Python projects, include pyproject.toml or requirements.txt and document a test command such as pytest, tox, or nox.",
      });
    }
  }

  if (hasGoMod) {
    const goModText = await readTextIfExists(path.join(context.repoPath, "go.mod"));
    const hasModuleName = Boolean(goModText && /^module\s+\S+/m.test(goModText));
    const hasGoSum = await exists(path.join(context.repoPath, "go.sum"));
    checks.push({
      id: "ecosystem:go",
      label: "Go maintainer readiness",
      status: hasModuleName ? "pass" : "warn",
      points: (hasModuleName ? 2 : 0) + (hasGoSum ? 1 : 0),
      maxPoints: 3,
      detail: `Go signals: moduleName=${hasModuleName}, goSum=${hasGoSum}.`,
    });

    if (!hasModuleName) {
      findings.push({
        id: "go-module-gap",
        title: "Go module name is missing",
        severity: "medium",
        category: "build",
        file: "go.mod",
        recommendation: "Add a module declaration to go.mod so maintainers and CI can resolve the project correctly.",
      });
    }
  }

  return {
    name: "Ecosystem support",
    checks,
    findings,
    metadata: {
      ecosystems,
      files: {
        packageJson: hasPackageJson,
        pyprojectToml: hasPyproject,
        requirementsTxt: hasRequirements,
        setupPy: hasSetupPy,
        goMod: hasGoMod,
      },
    },
  };
}
