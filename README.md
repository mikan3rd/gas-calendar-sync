# gas-calendar-sync

Google Apps Script project: syncs your **default calendar** by adding given guest emails to events you **own**, within a rolling window. **`Bun.build`** emits a single **`dist/Code.js`** plus `appsscript.json` for clasp `rootDir: "dist"`.

## Development

Use [mise](https://mise.jdx.dev/) (or equivalent) to enable **Node 22** and **Bun**, then:

```sh
bun install
bun run typecheck
bun run build
```

- **`typecheck`**: `tsc --noEmit` (Bun does not replace the type checker; see [Bundler docs](https://bun.sh/docs/bundler)).
- **`build`**: [`scripts/build-gas.ts`](scripts/build-gas.ts) runs **`Bun.build`** on [`src/main.ts`](src/main.ts) (ES modules in `src/`), then strips the trailing `export { … }` so the artifact is a **plain script** (no `import`/`export`) with top-level `function syncCalendarGuests` / `setupTrigger` for GAS triggers. Copies `appsscript.json` into `dist/`.
- **`test`**: [`bun test`](https://bun.sh/docs/test) imports the same [`src/_pureGuests.ts`](src/_pureGuests.ts) `guests` helpers as production (no `globalThis`).

Output: `dist/Code.js` and `dist/appsscript.json` (gitignored `dist/`).

### Why strip `export`?

Apps Script expects **global** entry functions for the editor and time-driven triggers. `Bun.build` with `format: "esm"` already emits those functions at the top level and only adds a final `export { syncCalendarGuests, setupTrigger }`; removing that block keeps one file valid as a **non-module script** without using `globalThis` for `Guests`.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) uses [jdx/mise-action](https://github.com/jdx/mise-action) so **Bun and Node versions come from [`mise.toml`](mise.toml)**. The workflow runs `typecheck`, `test`, and **`build`** (same as local).

## Script Properties (set in the GAS project)

| Key | Required | Description |
|-----|----------|-------------|
| `SYNC_GUEST_EMAILS` | Yes | Comma-separated guest emails to add (e.g. `alice@example.com,bob@example.com`). Do not commit real addresses to the repo or README. |
| `SYNC_LOOKAHEAD_DAYS` | No | How many days ahead from “now” to scan events. Defaults to `14` if unset or invalid. |

## clasp (optional)

Copy `.clasp.json.example` to `.clasp.json`, set `scriptId`, then follow [google/clasp](https://github.com/google/clasp) for upload and auth. With a single `Code.js`, the Apps Script project can stay as **one server script file** (or you can merge/replace the default script in the editor).
