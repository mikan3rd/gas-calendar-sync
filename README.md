# gas-calendar-sync

Google Apps Script: add configured **guest** emails to events you **own** on your **default calendar**, within a rolling window. [`scripts/build-gas.ts`](scripts/build-gas.ts) runs **`Bun.build`** and writes **`dist/Code.js`** plus copies **[`appsscript.json`](appsscript.json)** to **`dist/appsscript.json`** for clasp with **`rootDir: "dist"`**.

## Development

Use [mise](https://mise.jdx.dev/) (Node 22 + Bun per [`mise.toml`](mise.toml)).

```sh
bun install
bun run lint
bun run typecheck
bun test
bun run build
```

`build` strips the bundle’s trailing `export { … }` so Apps Script sees plain global functions (e.g. `syncCalendarGuests`, `setupTrigger`). Output: `dist/Code.js`, `dist/appsscript.json` (gitignored `dist/`). CI **`deploy`** uses **`bun run build:smoke`** ([`src/main.smoke.ts`](src/main.smoke.ts): `deploySmokeTest` and `applyCiScriptProperties` only — no calendar sync entrypoints).

## First-time setup

Per Apps Script project and GitHub repository.

1. **Create a script** at [script.google.com](https://script.google.com), or run `clasp create --type standalone` after [`clasp login`](https://github.com/google/clasp). The **project ID** is the segment in `https://script.google.com/home/projects/<ID>/edit`.
2. **Enable the [Apps Script API](https://console.cloud.google.com/apis/library/script.googleapis.com)** for the Google account you use with clasp if `clasp push` fails with an API error.
3. **Link locally**: `cp .clasp.json.example .clasp.json`, set `"scriptId"`. Run `clasp login`, then `bun run build` and `clasp push` to verify upload.
4. **Script properties** ([table](#script-properties)): set in the GAS editor (**Project settings → Script properties**), **or** let CI set them after each push using GitHub Secrets `GAS_SYNC_GUEST_EMAILS` (and optionally `GAS_SYNC_LOOKAHEAD_DAYS`) — see [CI](#ci). `clasp push` alone does not create or update these keys.
5. **GitHub** — Settings → Secrets and variables → Actions. Naming follows [Google’s clasp + GitHub Actions example](https://developers.google.com/apps-script/guides/clasp#continuous_integration):
   - **Secret** `CLASPRC_JSON`: paste the full contents of `~/.clasprc.json` from the machine where `clasp login` works (contains a refresh token; rotate if leaked).
   - **Secret** `CLASP_JSON`: paste the full contents of your repo’s `.clasp.json` (must include `"rootDir": "dist"` so `clasp push` matches this project’s build output).
   - **Optional secrets** (only if you want CI to write script properties after `clasp push`): `GAS_SYNC_GUEST_EMAILS` (comma-separated emails), `GAS_SYNC_LOOKAHEAD_DAYS` (e.g. `14`). If `GAS_SYNC_GUEST_EMAILS` is unset or empty, that step is skipped.

   ```sh
   # Copy values into GitHub Secrets (paste whole file bodies, not base64)
   cat ~/.clasprc.json
   cat .clasp.json
   ```

6. **CI**: `check` runs **`bun run build`**. **`deploy`**: **`bun run build:smoke`**, clasp secrets, **`clasp push --force`** then **`clasp deploy --description="$(git rev-parse --short HEAD)"`** ([clasp deploy flow](https://developers.google.com/apps-script/guides/clasp?hl=ja#deploy_a_published_project)), then **`run-deploy-smoke`**, then optional **`apply-script-properties`**.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) uses [mise-action](https://github.com/jdx/mise-action). **`check`**: lint, typecheck, test, **`bun run build`**. **`deploy`**: **`bun run build:smoke`**, `CLASPRC_JSON` / `CLASP_JSON`, **`clasp push --force`**, **`clasp deploy --description=<short SHA>`** (new version + new deployment each run when `--versionNumber` is omitted; see `clasp deploy -h`), then [`scripts/run-deploy-smoke.ts`](scripts/run-deploy-smoke.ts), then optional [`scripts/apply-script-properties.ts`](scripts/apply-script-properties.ts). **GCP project mismatch** (`403 PERMISSION_DENIED`): align clasp account and the script’s GCP project.

Secrets and variables: [First-time setup](#first-time-setup) steps 5–6.

## Script properties

| Key | Required | Description |
|-----|----------|-------------|
| `SYNC_GUEST_EMAILS` | Yes | Comma-separated guest emails. Do not commit real addresses. |
| `SYNC_LOOKAHEAD_DAYS` | No | Days ahead to scan; default `14` if unset or invalid. |
