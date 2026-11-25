# Tests

`write-config.test.sh` tests `scripts/write-config.sh`, which writes
`config.js` from `GOOGLE_CLIENT_ID` (or `GOOGLE_APP_ID`) at build time:

    bash tests/write-config.test.sh

`tests/` is excluded from the GitHub Pages artifact (see `.github/workflows/pages.yml`).

The login test pages and their Playwright suite moved to
[CycleFive/login-fixtures](https://github.com/CycleFive/login-fixtures).
