# Google OAuth Testing Guide

This guide explains how to run automated tests for the Google OAuth login functionality.

## Quick Start

### 1. Install Dependencies

```bash
# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

### 2. Configure Credentials

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your Google credentials:

```env
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-password
```

**WARNING:** Never commit the `.env` file to version control! It's already in `.gitignore`.

### 3. Run Tests

```bash
# Run basic tests (credentials and button detection)
pytest test_oauth_automated.py

# Run in headless mode (default)
HEADLESS=true pytest test_oauth_automated.py -v

# Run with visible browser
HEADLESS=false pytest test_oauth_automated.py -v
```

## Test Categories

### Unit Tests (Always Run)

These tests verify the credential management and button detection logic:

```bash
# Run only unit tests
pytest test_oauth_automated.py::TestCredentials -v
pytest test_oauth_automated.py::TestGoogleButtonDetection -v
```

### OAuth Integration Tests (Optional)

These tests perform actual OAuth button clicks but don't complete login:

```bash
# Enable OAuth tests
RUN_OAUTH_TESTS=true pytest test_oauth_automated.py::TestOAuthFlow::test_oauth_login_basic -v
```

### Full OAuth Tests (Use Sparingly)

These tests perform complete login flows and may trigger rate limits:

```bash
# Enable full OAuth tests (use sparingly!)
RUN_FULL_OAUTH_TESTS=true HEADLESS=false pytest test_oauth_automated.py::TestOAuthFlow::test_oauth_login_complete -v
```

### 2FA Tests (Manual Interaction Required)

These tests require you to manually enter 2FA codes or press security keys:

```bash
# Enable 2FA tests (requires visible browser and manual interaction)
RUN_2FA_TESTS=true HEADLESS=false pytest test_oauth_automated.py::Test2FAFlow -v
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_EMAIL` | (required) | Your Google account email |
| `GOOGLE_PASSWORD` | (required) | Your Google account password |
| `HEADLESS` | `true` | Run browser in headless mode |
| `TEST_URL` | `https://public-oauth-test.netlify.app/` | URL to test |
| `RUN_OAUTH_TESTS` | `false` | Enable OAuth integration tests |
| `RUN_FULL_OAUTH_TESTS` | `false` | Enable full OAuth login tests |
| `RUN_2FA_TESTS` | `false` | Enable 2FA/security key tests |

## Running Tests with Coverage

```bash
# Run tests with coverage report
pytest test_oauth_automated.py --cov=. --cov-report=html

# View coverage report
open htmlcov/index.html  # On macOS
xdg-open htmlcov/index.html  # On Linux
start htmlcov/index.html  # On Windows
```

## Running Tests in CI/CD

For CI/CD pipelines, use headless mode and only run basic tests:

```bash
# Example GitHub Actions / GitLab CI
export HEADLESS=true
export GOOGLE_EMAIL="${GOOGLE_EMAIL}"  # From secrets
export GOOGLE_PASSWORD="${GOOGLE_PASSWORD}"  # From secrets

# Run only safe tests
pytest test_oauth_automated.py::TestCredentials -v
pytest test_oauth_automated.py::TestGoogleButtonDetection -v
```

## Manual Testing

To manually test the OAuth flow:

```bash
# Run the main script with visible browser
python test_google_oauth.py --url https://public-oauth-test.netlify.app/

# Test with 2FA
python test_google_oauth.py --url https://public-oauth-test.netlify.app/ --use-2fa

# Test with security key
python test_google_oauth.py --url https://public-oauth-test.netlify.app/ --use-security-key
```

## Troubleshooting

### "Google credentials not found" Error

**Solution:** Make sure you've created a `.env` file with your credentials:

```bash
cp .env.example .env
# Edit .env and add your credentials
```

Or set environment variables:

```bash
export GOOGLE_EMAIL="your-email@gmail.com"
export GOOGLE_PASSWORD="your-password"
```

### "Could not find Google sign-in button" Error

**Solution:**
1. Check that the test URL is correct and accessible
2. Try running with `HEADLESS=false` to see what's happening
3. Ensure the page has finished loading (increase wait time)

### Browser Not Opening in Headless Mode

**Solution:** This is expected! Headless mode runs without a visible browser. To see the browser:

```bash
HEADLESS=false pytest test_oauth_automated.py -v
```

### Playwright Installation Issues

**Solution:** Make sure Playwright browsers are installed:

```bash
playwright install chromium

# If that fails, try with dependencies
playwright install --with-deps chromium
```

### Rate Limiting from Google

**Solution:**
1. Don't run full OAuth tests too frequently
2. Use `RUN_OAUTH_TESTS=true` instead of `RUN_FULL_OAUTH_TESTS=true`
3. Wait a few minutes between test runs
4. Consider using a dedicated test account

### Tests Timing Out

**Solution:** Increase the timeout in `pytest.ini` or use the `--timeout` flag:

```bash
pytest test_oauth_automated.py --timeout=600 -v
```

## Test Structure

```
test_oauth_automated.py
├── TestCredentials           # Credential management tests
│   ├── test_get_credentials_missing
│   ├── test_get_credentials_success
│   └── test_set_credentials_for_testing
├── TestGoogleButtonDetection # Button detection tests
│   ├── test_find_google_buttons_exists
│   └── test_find_google_buttons_in_iframe_exists
├── TestOAuthFlow            # OAuth integration tests
│   ├── test_oauth_login_basic
│   └── test_oauth_login_complete
├── TestHeadlessMode         # Configuration tests
│   ├── test_headless_env_var
│   └── test_test_url_env_var
└── Test2FAFlow              # 2FA tests (manual)
    ├── test_oauth_with_2fa
    └── test_oauth_with_security_key
```

## Best Practices

1. **Use Headless Mode for CI/CD**: Always run `HEADLESS=true` in automated pipelines
2. **Protect Credentials**: Never commit `.env` file or expose credentials in logs
3. **Limit Full OAuth Tests**: Use `RUN_FULL_OAUTH_TESTS` sparingly to avoid rate limits
4. **Use Test Accounts**: Create dedicated Google test accounts for automation
5. **Monitor Rate Limits**: If you see rate limiting, reduce test frequency
6. **Run Unit Tests First**: Always run unit tests before integration tests

## Security Considerations

- ✅ Credentials are stored in `.env` file (not committed)
- ✅ `.env` is in `.gitignore`
- ✅ Environment variables are used for sensitive data
- ✅ No credentials in test code or logs
- ⚠️ Use a dedicated test account, not your personal account
- ⚠️ Enable 2FA on your test account for added security

## Example CI/CD Configuration

### GitHub Actions

```yaml
name: OAuth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          playwright install chromium --with-deps

      - name: Run tests
        env:
          HEADLESS: true
          GOOGLE_EMAIL: ${{ secrets.GOOGLE_EMAIL }}
          GOOGLE_PASSWORD: ${{ secrets.GOOGLE_PASSWORD }}
        run: |
          pytest test_oauth_automated.py::TestCredentials -v
          pytest test_oauth_automated.py::TestGoogleButtonDetection -v
```

### GitLab CI

```yaml
test:
  image: python:3.10
  before_script:
    - pip install -r requirements.txt
    - playwright install chromium --with-deps
  script:
    - export HEADLESS=true
    - pytest test_oauth_automated.py::TestCredentials -v
    - pytest test_oauth_automated.py::TestGoogleButtonDetection -v
  variables:
    GOOGLE_EMAIL: $GOOGLE_EMAIL
    GOOGLE_PASSWORD: $GOOGLE_PASSWORD
```

## Additional Resources

- [Scrapling Documentation](https://github.com/D4Vinci/Scrapling)
- [Playwright Documentation](https://playwright.dev/python/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review test output with `-v` flag for verbose logging
3. Run with `HEADLESS=false` to see what's happening visually
4. Check that credentials are correctly set in `.env`
5. Verify that Playwright browsers are installed

---

**Happy Testing!** 🧪
