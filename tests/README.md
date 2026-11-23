# End-to-end tests

Playwright (chromium) tests for the static pages and service worker.

    cd tests
    npm install
    npx playwright install chromium
    npm test

`fixtures.js` exports `test` with two test-scoped fixtures: `serverURL`
(fresh Node `http` static server of the repo root on `127.0.0.1`, ephemeral
port) and `requestLog` (array of `{method, url}` the server received during
that test).

`write-config.test.sh` is a separate bash test for `scripts/write-config.sh`.

`tests/` is excluded from the GitHub Pages artifact (see `.github/workflows/pages.yml`).

## storage-control.mjs

Standalone CLI (not a Playwright spec) that drives a REAL Chrome through a login
on the test pages, then reports which browser storage tables gained rows. It
prints row counts and table names only, never stored values. Needs a real
Chrome/Chromium and a display for headed runs; requires `sqlite3` on PATH.

    node tests/storage-control.mjs [--url /login/any.html] [--mode typed|script]
         [--policy none|protected] [--headed|--headless] [--channel chrome|chromium]
         [--username <u>] [--password <p>]

- `--mode typed` sends real keystrokes; `script` sets `.value` and dispatches synthetic input/change events.
- `--policy protected` seeds the fresh profile's Preferences to disable the password manager and autofill (a per-profile emulation, not a true managed policy).
- Each run uses a fresh temp profile, removed afterwards.

Examples:

    node tests/storage-control.mjs --url /login/any.html --mode typed --policy none --headed --channel chrome
    node tests/storage-control.mjs --mode script --policy protected --headless --channel chromium
