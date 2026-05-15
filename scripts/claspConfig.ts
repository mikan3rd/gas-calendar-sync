import { readFileSync } from "node:fs";
import { join } from "node:path";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** `CLASP_SCRIPT_ID` が無いときはカレントの `.clasp.json`（CI は直前のステップで書く）。 */
export function resolveClaspScriptId(): string {
  const fromEnv = (process.env.CLASP_SCRIPT_ID ?? "").trim();
  if (fromEnv) return fromEnv;
  const path = join(process.cwd(), ".clasp.json");
  const raw = readFileSync(path, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed) || typeof parsed.scriptId !== "string") {
    throw new Error(
      ".clasp.json: missing scriptId (set CLASP_SCRIPT_ID or fix file)",
    );
  }
  const id = parsed.scriptId.trim();
  if (!id) {
    throw new Error(".clasp.json: scriptId is empty");
  }
  return id;
}
