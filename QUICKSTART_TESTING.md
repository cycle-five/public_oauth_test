# Quick Start - OAuth Testing

Get started with automated OAuth testing in 5 minutes!

## 1. Setup (First Time Only)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install browser
playwright install chromium

# Configure credentials
cp .env.example .env
# Edit .env and add your Google email and password
```

## 2. Run Tests

### Option A: Using the Helper Script (Recommended)

```bash
# Run unit tests (fast, no browser)
./run_tests.sh unit

# Run tests in headless mode
./run_tests.sh headless

# Run tests with visible browser
./run_tests.sh headed

# See all options
./run_tests.sh help
```

### Option B: Using pytest Directly

```bash
# Run all basic tests
pytest test_oauth_automated.py -v

# Run in headless mode (default)
HEADLESS=true pytest test_oauth_automated.py -v

# Run with visible browser
HEADLESS=false pytest test_oauth_automated.py -v
```

### Option C: Run Manual Test

```bash
# Test with default URL
python test_google_oauth.py

# Test with custom URL
python test_google_oauth.py --url https://your-url.com

# Test with 2FA
python test_google_oauth.py --use-2fa

# Test with security key
python test_google_oauth.py --use-security-key
```

## 3. What Gets Tested?

✅ **Credential Management** - Loads credentials from .env file
✅ **Button Detection** - Finds Google OAuth buttons on page
✅ **OAuth Integration** - Clicks button and navigates to Google (optional)
✅ **Full Login Flow** - Complete OAuth login (optional, use sparingly)
✅ **2FA Support** - Manual 2FA code entry (optional)
✅ **Security Key Support** - Hardware key authentication (optional)

## Files Created

| File | Purpose |
|------|---------|
| `scrapling_pick.py` | Credential management module |
| `test_oauth_automated.py` | Automated test suite |
| `.env.example` | Example environment configuration |
| `requirements.txt` | Python dependencies |
| `pytest.ini` | Pytest configuration |
| `run_tests.sh` | Test helper script |
| `TESTING.md` | Comprehensive testing guide |

## Troubleshooting

**Problem:** "Google credentials not found"
**Solution:** Create `.env` file and add your credentials

**Problem:** "Module not found"
**Solution:** Make sure you've activated venv and run `pip install -r requirements.txt`

**Problem:** Browser not visible
**Solution:** Use `HEADLESS=false` or `./run_tests.sh headed`

## Next Steps

- Read [TESTING.md](TESTING.md) for comprehensive documentation
- Run `./run_tests.sh help` for all available commands
- Check `pytest.ini` for test configuration options

## Security Reminder

⚠️ **Never commit your `.env` file!** It contains sensitive credentials.
✅ The `.env` file is already in `.gitignore`

---

**Happy Testing!** 🚀
