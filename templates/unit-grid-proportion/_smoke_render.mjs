// unit-grid-proportion 冒烟渲染（等价 scripts/render.mjs 单模板处理）
// 不动 motion-library 的 catalog.json，本地跑通 hyperframes render 冒烟。
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const TID = "unit-grid-proportion";
const templateDir = path.resolve("templates", TID);

// 读 schema，挑默认值（与 index.html fallback 对齐）
const html = await fs.readFile(path.join(templateDir, "index.html"), "utf8");
const m = html.match(/data-composition-variables='(\[.*?\])'/s);
if (!m) throw new Error("data-composition-variables not found");
const schema = JSON.parse(m[1]);
const values = {};
for (const item of schema) values[item.id] = item.default ?? null;

// 与 render.mjs 一致：有 exportMode 就强制 mp4
if (schema.some((s) => s.id === "exportMode")) values.exportMode = "mp4";

const outputDir = path.join(templateDir, "renders");
await fs.mkdir(outputDir, { recursive: true });
const output = path.join(outputDir, "smoke.mp4");
const variablesFile = path.join(outputDir, ".render-vars.json");
await fs.writeFile(variablesFile, JSON.stringify(values), "utf8");

const isWindows = process.platform === "win32";
const command = isWindows ? "cmd.exe" : "npx";
const shellPath = path.join(
  os.homedir(), ".cache", "hyperframes", "chrome", "chrome-headless-shell",
  "chrome-headless-shell-win64", "chrome-headless-shell.exe"
);
const hfArgs = [
  "--yes", "hyperframes@0.8.55", "render",
  "--strict-variables",
  "--variables-file", variablesFile,
  "--output", output,
];
const args = isWindows ? ["/c", "npx", ...hfArgs] : hfArgs;
const result = spawnSync(command, args, {
  cwd: templateDir,
  stdio: "inherit",
  env: { ...process.env, HYPERFRAMES_BROWSER_PATH: shellPath },
});
await fs.unlink(variablesFile).catch(() => {});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status || 0);
