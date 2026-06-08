import path from "node:path";
import type { Finding, ScannerContext, ScannerResult } from "../types.js";
import { listFiles, normalizePath, readTextIfExists } from "../utils/files.js";
import { secretPatterns, sensitiveFilePatterns } from "../rules/secret-patterns.js";

const textExtensions = new Set([
  ".env", ".json", ".js", ".ts", ".tsx", ".jsx", ".py", ".rb", ".go", ".rs", ".java", ".md", ".txt", ".yml", ".yaml", ".toml", ".ini", ".sh", ".cjs", ".mjs",
]);

export async function scanSecurity(context: ScannerContext): Promise<ScannerResult> {
  const files = await listFiles(context.repoPath, { maxFiles: 3000 });
  const findings: Finding[] = [];
  let scannedTextFiles = 0;

  for (const file of files) {
    const normalized = normalizePath(file);
    if (sensitiveFilePatterns.some((pattern) => pattern.test(normalized))) {
      findings.push({
        id: `sensitive-file:${normalized}`,
        title: "Sensitive-looking file path",
        severity: normalized === ".env" ? "critical" : "medium",
        category: "security",
        file: normalized,
        recommendation: "Verify this file does not contain private customer data, credentials, portfolio data, cookies, or production configuration before publishing.",
      });
    }

    const ext = path.extname(file);
    const base = path.basename(file);
    if (!textExtensions.has(ext) && !textExtensions.has(base)) continue;

    const absolute = path.join(context.repoPath, file);
    const text = await readTextIfExists(absolute);
    if (!text || text.length > 250_000) continue;
    scannedTextFiles += 1;

    for (const pattern of secretPatterns) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(text);
      if (match) {
        findings.push({
          id: `secret:${pattern.id}:${normalized}`,
          title: pattern.label,
          severity: pattern.severity,
          category: "security",
          file: normalized,
          evidence: redact(match[0]),
          recommendation: "Remove the secret, rotate it if it was ever committed, and replace it with an environment variable documented in .env.example.",
        });
      }
    }
  }

  const criticalOrHigh = findings.filter((finding) => finding.severity === "critical" || finding.severity === "high").length;
  const medium = findings.filter((finding) => finding.severity === "medium").length;
  const points = Math.max(0, 25 - criticalOrHigh * 8 - medium * 2);

  return {
    name: "Security and privacy",
    checks: [{
      id: "security:secret-scan",
      label: "Secret and sensitive file scan",
      status: criticalOrHigh > 0 ? "fail" : medium > 0 ? "warn" : "pass",
      points,
      maxPoints: 25,
      detail: `Scanned ${scannedTextFiles} text files. Critical/high findings=${criticalOrHigh}, medium findings=${medium}.`,
    }],
    findings,
    metadata: { scannedFiles: files.length, scannedTextFiles },
  };
}

function redact(value: string): string {
  if (value.length <= 12) return "[redacted]";
  return `${value.slice(0, 5)}...[redacted]...${value.slice(-4)}`;
}
