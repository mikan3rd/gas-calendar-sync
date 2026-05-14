# gas-calendar-sync

Google Apps Script: add configured **guest** emails to events you **own** on your **default calendar**, within a rolling window. [`scripts/build-gas.ts`](scripts/build-gas.ts) runs **`Bun.build`** and writes **`dist/Code.js`** plus `appsscript.json` for clasp with **`rootDir: "dist"`**.

## Development

Use [mise](https://mise.jdx.dev/) (Node 22 + Bun per [`mise.toml`](mise.toml)).

```sh
bun install
bun run lint
bun run typecheck
bun test
bun run build
```

`build` strips the bundle’s trailing `export { … }` so Apps Script sees plain global functions (e.g. `syncCalendarGuests`, `setupTrigger`). Output: `dist/Code.js`, `dist/appsscript.json` (gitignored `dist/`).

## First-time setup

Per Apps Script project and GitHub repository.

1. **Create a script** at [script.google.com](https://script.google.com), or run `clasp create --type standalone` after [`clasp login`](https://github.com/google/clasp). The **project ID** is the segment in `https://script.google.com/home/projects/<ID>/edit`.
2. **Enable the [Apps Script API](https://console.cloud.google.com/apis/library/script.googleapis.com)** for the Google account you use with clasp if `clasp push` fails with an API error.
3. **Link locally**: `cp .clasp.json.example .clasp.json`, set `"scriptId"`. Run `clasp login`, then `bun run build` and `clasp push` to verify upload.
4. **Script properties** in the GAS editor (Project settings → Script properties): set at least `SYNC_GUEST_EMAILS` ([table below](#script-properties)). `clasp push` does not set these.
5. **GitHub** — Settings → Secrets and variables:
   - **Variable** `CLASP_SCRIPT_ID`: same value as `scriptId` in `.clasp.json`.
   - **Secret** `CLASPRC_JSON_B64`: base64 of `~/.clasprc.json` from the machine where `clasp login` works (refresh token inside; rotate if leaked).

   ```sh
   # macOS (single line into the secret)
   base64 -i ~/.clasprc.json | tr -d '\n' | pbcopy
   ```

   ```sh
   # Linux
   base64 -w0 ~/.clasprc.json
   ```

6. **CI**: with this workflow on **`main`**, every **`push` to `main`** that passes **`check`** runs **`deploy`** (`bunx clasp push`).

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) uses [mise-action](https://github.com/jdx/mise-action). **Pull requests**: `check` only (lint, typecheck, test, build). **Push to `main`**: `check`, then **`deploy`** (rebuild + `clasp push`). Secrets: [First-time setup](#first-time-setup) step 5.

## Script properties

| Key | Required | Description |
|-----|----------|-------------|
| `SYNC_GUEST_EMAILS` | Yes | Comma-separated guest emails. Do not commit real addresses. |
| `SYNC_LOOKAHEAD_DAYS` | No | Days ahead to scan; default `14` if unset or invalid. |
