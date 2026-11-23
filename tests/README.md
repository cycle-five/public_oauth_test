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
