export type SecretPattern = {
  id: string;
  label: string;
  regex: RegExp;
  severity: "medium" | "high" | "critical";
};

export const secretPatterns: SecretPattern[] = [
  {
    id: "openai-key",
    label: "OpenAI-style API key",
    regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g,
    severity: "critical",
  },
  {
    id: "github-token",
    label: "GitHub token",
    regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g,
    severity: "critical",
  },
  {
    id: "generic-secret-assignment",
    label: "Generic secret assignment",
    regex: /\b(?:api[_-]?key|secret|token|password)\b\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{12,}/gi,
    severity: "high",
  },
  {
    id: "private-key",
    label: "Private key block",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    severity: "critical",
  },
];

export const sensitiveFilePatterns = [
  /^\.env$/,
  /^\.env\./,
  /cookie/i,
  /credential/i,
  /secret/i,
  /token/i,
  /private/i,
  /workspace\.json$/i,
  /positions\.json$/i,
  /portfolio/i,
  /customer/i,
  /client/i,
];
