import { type SpawnSyncReturns, spawnSync } from "node:child_process";

export type ClaspRunJsonResult = {
  response?: unknown;
  error?: { code?: number; message?: string; details?: unknown };
};

const CLASP_DIAG_LOG_MAX = 12_000;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n… (${s.length - max} more chars)`;
}

/** stdout 空・非 0 終了時の調査用（--params の値はログに出さない）。 */
function logClaspRunDiagnostics(
  functionName: string,
  parameterCount: number,
  r: SpawnSyncReturns<string>,
  rawStdout: string,
  rawStderr: string,
): void {
  const stdout = rawStdout.trim();
  const stderr = rawStderr.trim();
  console.error("[claspRunJson]", {
    functionName,
    parameterCount,
    status: r.status,
    signal: r.signal,
    spawnError: r.error?.message,
    stdoutBytes: Buffer.byteLength(rawStdout, "utf8"),
    stderrBytes: Buffer.byteLength(rawStderr, "utf8"),
    stdoutTrimEmpty: stdout.length === 0,
    stderrTrimEmpty: stderr.length === 0,
  });
  if (stderr)
    console.error(
      "[claspRunJson] stderr:\n",
      truncate(stderr, CLASP_DIAG_LOG_MAX),
    );
  if (stdout)
    console.error(
      "[claspRunJson] stdout:\n",
      truncate(stdout, CLASP_DIAG_LOG_MAX),
    );
}

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
  const rawOut = r.stdout ?? "";
  const rawErr = r.stderr ?? "";
  const stdout = rawOut.trim();
  const stderr = rawErr.trim();
  if (r.status !== 0) {
    logClaspRunDiagnostics(functionName, parameters.length, r, rawOut, rawErr);
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
    logClaspRunDiagnostics(functionName, parameters.length, r, rawOut, rawErr);
    const tail = stderr ? ` stderr: ${truncate(stderr, 500)}` : "";
    throw new Error(`clasp run ${functionName}: empty stdout${tail}`);
  }
  return JSON.parse(stdout) as ClaspRunJsonResult;
}
