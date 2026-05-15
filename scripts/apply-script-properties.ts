import { homedir } from "node:os";
import { join } from "node:path";
import {
  fetchAccessToken,
  loadClaspRefreshCreds,
  runAppsScriptFunction,
} from "./gasScriptsRun";

const guest = (process.env.GAS_SYNC_GUEST_EMAILS ?? "").trim();
if (!guest) {
  console.info(
    "apply-script-properties: skip (GAS_SYNC_GUEST_EMAILS unset or empty)",
  );
  process.exit(0);
}

async function runApply(): Promise<void> {
  const scriptIdEnv = (process.env.CLASP_SCRIPT_ID ?? "").trim();
  if (!scriptIdEnv) {
    throw new Error(
      "CLASP_SCRIPT_ID is required when GAS_SYNC_GUEST_EMAILS is set",
    );
  }

  const rcPath = process.env.CLASPRC_PATH ?? join(homedir(), ".clasprc.json");
  const creds = await loadClaspRefreshCreds(rcPath);
  const accessToken = await fetchAccessToken(creds);
  const lookahead = (process.env.GAS_SYNC_LOOKAHEAD_DAYS ?? "").trim();
  await runAppsScriptFunction(
    scriptIdEnv,
    accessToken,
    "applyCiScriptProperties",
    [guest, lookahead],
  );
  console.info("apply-script-properties: applyCiScriptProperties completed");
}

runApply().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
