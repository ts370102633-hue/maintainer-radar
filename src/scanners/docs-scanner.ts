import path from "node:path";
import type { CheckResult, Finding, ScannerContext, ScannerResult } from "../types.js";
import { exists, readTextIfExists } from "../utils/files.js";

type RequiredDoc = {
  file: string;
  label: string;
  points: number;
  recommendation: string;
};

const requiredDocs: RequiredDoc[] = [
  { file: "README.md", label: "README", points: 8, recommendation: "Add a clear README with purpose, install, usage, examples, and maintenance workflow." },
  { file: "LICENSE", label: "LICENSE", points: 5, recommendation: "Add an OSI-approved license such as MIT or Apache-2.0." },
  { file: "SECURITY.md", label: "Security policy", points: 5, recommendation: "Add SECURITY.md with vulnerability reporting and data-handling guidance." },
  { file: "CONTRIBUTING.md", label: "Contributor guide", points: 4, recommendation: "Add CONTRIBUTING.md with development setup, PR expectations, and maintainer workflow." },
  { file: ".env.example", label: "Environment example", points: 3, recommendation: "Add .env.example so users can configure the project without exposing secrets." },
];

export async function scanDocs(context: ScannerContext): Promise<ScannerResult> {
  const checks: CheckResult[] = [];
  const findings: Finding[] = [];

  for (const doc of requiredDocs) {
    const present = await exists(path.join(context.repoPath, doc.file));
    checks.push({
      id: `docs:${doc.file}`,
      label: doc.label,
      status: present ? "pass" as const : "fail" as const,
      points: present ? doc.points : 0,
      maxPoints: doc.points,
      detail: present ? `${doc.file} is present.` : `${doc.file} is missing.`,
    });
    if (!present) {
      findings.push({
        id: `missing-${doc.file.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        title: `${doc.label} is missing`,
        severity: doc.file === "LICENSE" ? "high" as const : "medium" as const,
        category: "docs" as const,
        recommendation: doc.recommendation,
      });
    }
  }

  const readme = await readTextIfExists(path.join(context.repoPath, "README.md"));
  if (readme) {
    const hasInstall = /install|npm|pip|cargo|go install|setup/i.test(readme);
    const hasUsage = /usage|quick start|getting started|example/i.test(readme);
    const hasMaintainer = /maintainer|triage|release|pull request|issue/i.test(readme);
    checks.push({
      id: "docs:readme-content",
      label: "README maintenance usefulness",
      status: hasInstall && hasUsage && hasMaintainer ? "pass" : "warn",
      points: [hasInstall, hasUsage, hasMaintainer].filter(Boolean).length,
      maxPoints: 3,
      detail: `README signals: install=${hasInstall}, usage=${hasUsage}, maintainer=${hasMaintainer}.`,
    });
  }

  return { name: "Documentation", checks, findings };
}
