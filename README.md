# gas-calendar-sync

Google Apps Script project: syncs your **default calendar** by adding given guest emails to events you **own**, within a rolling window. TypeScript compiles to `dist/`, aligned with clasp `rootDir: "dist"`.

## Development

Use [mise](https://mise.jdx.dev/) (or equivalent) to enable **Node 22** and **Bun**, then:

```sh
bun install
bun run typecheck
bun run build
```

`build` runs `tsc`, then copies `appsscript.json` into `dist/` via `bun run copy:manifest` (works on Windows as long as Bun is available).

Optional: `bun test` — covers CSV email normalization only (no GAS APIs).

Output lives in `dist/` (ignored by git).

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) uses [jdx/mise-action](https://github.com/jdx/mise-action) so **Bun and Node versions come from [`mise.toml`](mise.toml)**—the same pins as local development. [`oven-sh/setup-bun`](https://github.com/oven-sh/setup-bun)’s `bun-version-file` only reads specific filenames (for example `package.json`, `.tool-versions`, `.bun-version`), not `mise.toml`.

## Script Properties (set in the GAS project)

| Key | Required | Description |
|-----|----------|-------------|
| `SYNC_GUEST_EMAILS` | Yes | Comma-separated guest emails to add (e.g. `alice@example.com,bob@example.com`). Do not commit real addresses to the repo or README. |
| `SYNC_LOOKAHEAD_DAYS` | No | How many days ahead from “now” to scan events. Defaults to `14` if unset or invalid. |

## clasp (optional)

Copy `.clasp.json.example` to `.clasp.json`, set `scriptId`, then follow [google/clasp](https://github.com/google/clasp) for upload and auth.
