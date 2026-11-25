# public_oauth_test

A public page with a real **Google Sign-In** button, as a target for testing
browser automation that finds and drives "Sign in with Google" (for example
`cycle-five/casino_automation`).

Live at <https://oauth.page.twkr.io/>.

Looking for plain username and password forms (password managers, credential
brokers)? Those pages moved to
[CycleFive/login-fixtures](https://github.com/CycleFive/login-fixtures), live at
<https://login.page.twkr.io/>.

## What the page does

- Renders Google's official Sign-In button (Google Identity Services, popup
  mode) with the Client ID from `config.js`.
- On a successful sign-in it decodes the returned ID token in the page, shows
  the name and email, logs to the console and fires an `oauth-authenticated`
  event on `window`.
- Without a Client ID the button does not render and the console says so.
  The old manual "test mode" button is commented out in `index.html` and is
  not available.

## Selectors

The clickable button is inside Google's iframe, not in the page's own DOM.

- `#g_id_signin_container` / `.g_id_signin`: the container Google renders into
- `#g_id_onload`: the GIS configuration element
- `iframe[src*="accounts.google.com"]`: Google's button iframe
- `button:has-text("Sign in with Google")` (or the button's text): inside that
  iframe, so use a frame locator

Google detects and may block automated sign-ins on its own pages. This page
only gives you a real button and a real popup to reach.

## Configuration

The page needs an OAuth 2.0 Client ID (Web application) whose **Authorized
JavaScript origins** include every origin you serve it from, for example
`https://oauth.page.twkr.io` and `http://localhost:8000`.
[SETUP_GUIDE.md](SETUP_GUIDE.md) walks through creating one.

- **GitHub Pages (how the live site is deployed):** the workflow in
  `.github/workflows/pages.yml` writes `config.js` from the `GOOGLE_CLIENT_ID`
  (or `GOOGLE_APP_ID`) variable on the `github-pages` environment, using
  `scripts/write-config.sh`. `config.js` is never committed.
- **Locally:** `cp config.example.js config.js`, put your Client ID in it,
  then `python3 -m http.server 8000` and open <http://localhost:8000>.
- `netlify_build.sh` and `deploy.sh` are older deploy helpers for other hosts.

Test: `bash tests/write-config.test.sh`.

## `test_google_oauth.py`

A Scrapling and Playwright script that finds the Google button (including
inside iframes) and drives the sign-in. It imports `get_credentials` from a
local `scrapling_pick` module that is not in this repository, so it does not
run as is.

## License

Public domain. Use it however you want; attribution appreciated, not required.
