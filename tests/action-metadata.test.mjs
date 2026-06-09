import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

test("GitHub Action metadata exposes artifact report mode", async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const action = await readFile(path.join(root, "action.yml"), "utf8");
  const example = await readFile(path.join(root, "examples", "workflows", "maintainer-radar.yml"), "utf8");

  assert.match(action, /name: Maintainer Radar/);
  assert.match(action, /npx --yes maintainer-radar@latest/);
  assert.match(action, /uses: actions\/upload-artifact@v4/);
  assert.match(action, /private:/);
  assert.match(example, /uses: ts370102633-hue\/maintainer-radar@v0\.1\.5/);
});
