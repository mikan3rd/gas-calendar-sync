import { spawnSync } from "node:child_process";

export type ClaspRunJsonResult = {
  response?: unknown;
  error?: { code?: number; message?: string; details?: unknown };
};

/** `bunx clasp --json run …` — same auth/project as `clasp push` (`.clasprc.json` + `.clasp.json`). */
export function claspRunJson(
  functionName: string,
  parameters: unknown[] = [],
): ClaspRunJsonResult {
  const args = ["clasp", "--json", "run", functionName];
  if (parameters.length > 0) {
    args.push("--params", JSON.stringify(parameters));
  }
  const r = spawnSync("bunx", args, {
    encoding: "utf8",
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stdout = (r.stdout ?? "").trim();
  const stderr = (r.stderr ?? "").trim();
  if (r.status !== 0) {
    let hint = stdout || stderr || `exit ${r.status}`;
    try {
      if (stdout) {
        const parsed: unknown = JSON.parse(stdout);
        hint = JSON.stringify(parsed);
      }
    } catch {
      /* use hint as-is */
    }
    throw new Error(`clasp run ${functionName} failed (${r.status}): ${hint}`);
  }
  if (!stdout) {
    throw new Error(`clasp run ${functionName}: empty stdout`);
  }
  return JSON.parse(stdout) as ClaspRunJsonResult;
}
