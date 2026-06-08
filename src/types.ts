export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type Finding = {
  id: string;
  title: string;
  severity: Severity;
  category: "docs" | "security" | "build" | "release" | "oss" | "git";
  file?: string;
  evidence?: string;
  recommendation: string;
};

export type CheckStatus = "pass" | "warn" | "fail";

export type CheckResult = {
  id: string;
  label: string;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  detail: string;
};

export type ScannerContext = {
  repoPath: string;
  outputPath: string;
  now: Date;
};

export type ScannerResult = {
  name: string;
  checks: CheckResult[];
  findings: Finding[];
  metadata?: Record<string, unknown>;
};

export type HealthScore = {
  total: number;
  grade: "ready" | "usable" | "internal" | "high-risk";
  buckets: Array<{
    name: string;
    score: number;
    maxScore: number;
  }>;
};

export type MaintainerTask = {
  priority: 1 | 2 | 3;
  title: string;
  why: string;
  command?: string;
};

export type ReportManifest = {
  generatedAt: string;
  repoPath: string;
  score: HealthScore;
  checks: CheckResult[];
  findings: Finding[];
  tasks: MaintainerTask[];
  metadata: Record<string, unknown>;
};
