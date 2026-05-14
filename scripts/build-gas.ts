import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = path.join(import.meta.dir, "..");
const dist = path.join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const result = await Bun.build({
  entrypoints: [path.join(root, "src/main.ts")],
  outdir: dist,
  format: "esm",
  target: "browser",
  minify: false,
  sourcemap: "none",
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

const bundledPath = path.join(dist, "main.js");
let code = await Bun.file(bundledPath).text();
// Bun emits trailing `export {…}`; GAS needs a plain script without import/export.
code = code.replace(/\r?\nexport\s*\{[\s\S]*?\}\s*;?\s*(?:\r\n|\n|\r)?$/, "\n");
await Bun.write(path.join(dist, "Code.js"), code);
await rm(bundledPath);

await Bun.write(
  path.join(dist, "appsscript.json"),
  Bun.file(path.join(root, "appsscript.json")),
);

console.log("Built", path.join(dist, "Code.js"));
