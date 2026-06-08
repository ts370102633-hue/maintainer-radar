import { promises as fs } from "node:fs";
import path from "node:path";

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTextIfExists(filePath: string): Promise<string | undefined> {
  if (!(await exists(filePath))) return undefined;
  return fs.readFile(filePath, "utf8");
}

export async function listFiles(root: string, options: { maxFiles?: number } = {}): Promise<string[]> {
  const maxFiles = options.maxFiles ?? 5000;
  const ignored = new Set([".git", "node_modules", "dist", "build", ".next", "coverage", ".venv", "__pycache__"]);
  const results: string[] = [];

  async function walk(current: string) {
    if (results.length >= maxFiles) return;
    const entries = await fs.readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (results.length >= maxFiles) return;
      if (ignored.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      const relative = path.relative(root, absolute);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        results.push(relative);
      }
    }
  }

  await walk(root);
  return results;
}

export function normalizePath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}
