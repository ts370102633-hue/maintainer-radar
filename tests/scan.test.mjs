import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { runScan } from "../dist/index.js";

test("runScan scores a minimal OSS-ready repo and writes reports", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "maintainer-radar-"));
  const out = path.join(dir, "report");
  try {
    await writeFile(path.join(dir, "README.md"), "Install with npm. Usage examples. Maintainer triage and release workflow.");
    await writeFile(path.join(dir, "LICENSE"), "MIT");
    await writeFile(path.join(dir, "SECURITY.md"), "Report vulnerabilities.");
    await writeFile(path.join(dir, "CONTRIBUTING.md"), "Run tests before PRs.");
    await writeFile(path.join(dir, ".env.example"), "OPENAI_API_KEY=");
    await mkdir(path.join(dir, ".github", "workflows"), { recursive: true });
    await writeFile(path.join(dir, "CHANGELOG.md"), "# Changelog");
    await mkdir(path.join(dir, "docs"), { recursive: true });
    await writeFile(path.join(dir, "docs", "roadmap.md"), "# Roadmap");
    await writeFile(path.join(dir, "package.json"), JSON.stringify({
      name: "sample",
      version: "0.1.0",
      scripts: { build: "tsc", test: "node --test", lint: "eslint ." },
    }));

    const manifest = await runScan({ repoPath: dir, outputPath: out });
    assert.equal(manifest.score.grade === "ready" || manifest.score.grade === "usable", true);
    assert.equal(manifest.findings.some((finding) => finding.severity === "critical"), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("runScan detects obvious secret patterns", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "maintainer-radar-secret-"));
  try {
    await writeFile(path.join(dir, "README.md"), "Usage and maintainer workflow.");
    const fakeKey = "sk-" + "test".repeat(8);
    await writeFile(path.join(dir, "config.txt"), `OPENAI_API_KEY=${fakeKey}`);
    const manifest = await runScan({ repoPath: dir, outputPath: path.join(dir, "report") });
    assert.equal(manifest.findings.some((finding) => finding.id.includes("openai-key")), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
