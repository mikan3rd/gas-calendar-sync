import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export type RefreshCreds = {
  client_id: string;
  client_secret: string;
  refresh_token: string;
};

/** Legacy global `~/.clasprc.json` lacks client id/secret; use clasp package defaults. */
async function claspDefaultOAuthClient(): Promise<{
  client_id: string;
  client_secret: string;
}> {
  const pkgJson = require.resolve("@google/clasp/package.json");
  const modPath = join(dirname(pkgJson), "build/src/auth/oauth_client.js");
  const mod = (await import(pathToFileURL(modPath).href)) as {
    DEFAULT_CLASP_OAUTH_CLIENT_ID: string;
    DEFAULT_CLASP_OAUTH_CLIENT_SECRET: string;
  };
  return {
    client_id: mod.DEFAULT_CLASP_OAUTH_CLIENT_ID,
    client_secret: mod.DEFAULT_CLASP_OAUTH_CLIENT_SECRET,
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function loadClaspRefreshCreds(
  rcPath: string,
): Promise<RefreshCreds> {
  const raw = readFileSync(rcPath, "utf8");
  const store: unknown = JSON.parse(raw);
  if (!isRecord(store)) {
    throw new Error("Invalid ~/.clasprc.json: expected object");
  }

  const v3 = store.tokens;
  if (isRecord(v3) && isRecord(v3.default)) {
    const t = v3.default;
    const cid = String(t.client_id ?? "");
    const csec = String(t.client_secret ?? "");
    const rtok = String(t.refresh_token ?? "");
    if (cid && csec && rtok) {
      return { client_id: cid, client_secret: csec, refresh_token: rtok };
    }
  }

  if (isRecord(store.token) && isRecord(store.oauth2ClientSettings)) {
    const tok = store.token;
    const o = store.oauth2ClientSettings;
    const rtok = String(tok.refresh_token ?? "");
    const cid = String(o.clientId ?? "");
    const csec = String(o.clientSecret ?? "");
    if (rtok && cid && csec) {
      return { client_id: cid, client_secret: csec, refresh_token: rtok };
    }
  }

  const legacyRt = String(store.refresh_token ?? "");
  if (legacyRt) {
    const { client_id, client_secret } = await claspDefaultOAuthClient();
    return { client_id, client_secret, refresh_token: legacyRt };
  }

  throw new Error(
    "Could not read refresh credentials from ~/.clasprc.json (expected clasp v3 or legacy format).",
  );
}

export async function fetchAccessToken(creds: RefreshCreds): Promise<string> {
  const body = new URLSearchParams({
    client_id: creds.client_id,
    client_secret: creds.client_secret,
    refresh_token: creds.refresh_token,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    throw new Error(
      `OAuth token refresh failed: ${res.status} ${JSON.stringify(data)}`,
    );
  }
  if (!isRecord(data) || typeof data.access_token !== "string") {
    throw new Error(
      `OAuth token response missing access_token: ${JSON.stringify(data)}`,
    );
  }
  return data.access_token;
}

function throwIfRunBodyFailed(data: Record<string, unknown>): void {
  if (data.error) {
    throw new Error(`scripts.run: ${JSON.stringify(data.error)}`);
  }
  const resp = data.response;
  if (isRecord(resp) && resp.error) {
    throw new Error(`Apps Script execution: ${JSON.stringify(resp.error)}`);
  }
}

export async function runAppsScriptFunction(
  scriptId: string,
  accessToken: string,
  functionName: string,
  parameters: unknown[],
): Promise<unknown> {
  const url = `https://script.googleapis.com/v1/scripts/${encodeURIComponent(scriptId)}:run`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      function: functionName,
      parameters,
      devMode: true,
    }),
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    throw new Error(`scripts.run HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  if (!isRecord(data)) {
    throw new Error(`scripts.run: unexpected body ${JSON.stringify(data)}`);
  }
  throwIfRunBodyFailed(data);
  const resp = data.response;
  if (isRecord(resp) && "result" in resp) {
    return resp.result;
  }
  return undefined;
}
