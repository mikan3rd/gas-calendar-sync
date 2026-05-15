import { homedir } from "node:os";
import { join } from "node:path";
import { resolveClaspScriptId } from "./claspConfig";
import {
  fetchAccessToken,
  loadClaspRefreshCreds,
  runAppsScriptFunction,
} from "./gasScriptsRun";

const EXPECTED = "deploy-smoke-ok";

async function main(): Promise<void> {
  const scriptId = resolveClaspScriptId();
  const rcPath = process.env.CLASPRC_PATH ?? join(homedir(), ".clasprc.json");
  const creds = await loadClaspRefreshCreds(rcPath);
  const accessToken = await fetchAccessToken(creds);
  const result = await runAppsScriptFunction(
    scriptId,
    accessToken,
    "deploySmokeTest",
    [],
  );
  if (result !== EXPECTED) {
    throw new Error(
      `deploySmokeTest: expected ${JSON.stringify(EXPECTED)}, got ${JSON.stringify(result)}`,
    );
  }
  console.info("run-deploy-smoke: deploySmokeTest OK");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
