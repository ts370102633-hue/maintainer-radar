#!/usr/bin/env node
import path from "node:path";
import { runScan } from "./index.js";

type ParsedArgs = {
  command: string;
  repoPath: string;
  outputPath?: string;
  json: boolean;
  privateReport: boolean;
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "help" || args.command === "--help" || args.command === "-h") {
    printHelp();
    return;
  }
  if (args.command !== "scan") {
    throw new Error(`Unknown command: ${args.command}. Run maintainer-radar help.`);
  }

  const manifest = await runScan({ repoPath: args.repoPath, outputPath: args.outputPath, privateReport: args.privateReport });
  if (args.json) {
    process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
    return;
  }

  const out = path.resolve(args.outputPath ?? path.join(path.resolve(args.repoPath), "maintainer-radar-report"));
  if (args.privateReport) {
    process.stdout.write("Private scan mode: keep this report local and review it before sharing.\n");
  }
  process.stdout.write([
    `Maintainer Radar score: ${manifest.score.total}/100 (${manifest.score.grade})`,
    `Findings: ${manifest.findings.length}`,
    `Report: ${out}`,
    "",
  ].join("\n"));
}

function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? "scan";
  let repoPath = command === "scan" ? (argv[1] && !argv[1].startsWith("-") ? argv[1] : ".") : ".";
  let outputPath: string | undefined;
  let json = false;
  let privateReport = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--out" || arg === "-o") {
      outputPath = argv[index + 1];
      index += 1;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--private") {
      privateReport = true;
    }
  }

  if (command !== "scan") repoPath = ".";
  return { command, repoPath, outputPath, json, privateReport };
}

function printHelp() {
  process.stdout.write(`Maintainer Radar

Usage:
  maintainer-radar scan [repo-path] [--out report-dir] [--json] [--private]

Examples:
  maintainer-radar scan .
  maintainer-radar scan /path/to/repo --out maintainer-radar-report
  maintainer-radar scan /path/to/private-repo --out private-report --private
  maintainer-radar scan . --json
`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`maintainer-radar failed: ${message}\n`);
  process.exitCode = 1;
});
