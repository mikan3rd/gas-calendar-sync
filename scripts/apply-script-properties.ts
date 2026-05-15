import { claspRunJson } from "./claspRunJson";

const guest = (process.env.GAS_SYNC_GUEST_EMAILS ?? "").trim();
if (!guest) {
  console.info(
    "apply-script-properties: skip (GAS_SYNC_GUEST_EMAILS unset or empty)",
  );
  process.exit(0);
}

function main(): void {
  const lookahead = (process.env.GAS_SYNC_LOOKAHEAD_DAYS ?? "").trim();
  const out = claspRunJson("applyCiScriptProperties", [guest, lookahead]);
  if (out.error) {
    throw new Error(`clasp run: ${JSON.stringify(out.error)}`);
  }
  console.info("apply-script-properties: applyCiScriptProperties completed");
}

try {
  main();
} catch (err: unknown) {
  console.error(err);
  process.exit(1);
}
