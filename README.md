# OAuth Test Page - Public Testing Resource

[live version here!](https://public-oauth-test.netlify.app/)

A free, public webpage designed specifically for testing OAuth button detection and automation with tools like Selenium, Playwright, Puppeteer, and Cypress.

**⚠️ Note:** This page uses **real Google OAuth only**. You will need a Google Client ID from your Google Cloud developer account (free to create - see [SETUP_GUIDE.md](SETUP_GUIDE.md)).

**📖 Quick Navigation:** See [QUICKREF.md](QUICKREF.md) for fast access to all documentation.

## 🎯 Purpose

This page provides a **simple, reliable target** for testing automation frameworks with **real Google OAuth**.

### Features:

- ✅ **Authentic Google sign-in flow**
- ✅ **Real JWT tokens** 
- ✅ **Actual Google authentication screens**
- ✅ **Perfect for end-to-end testing**
- ✅ **Free to use and deploy**
- ✅ **No server required** - static HTML page

Perfect for:
- Learning web automation
- Testing button detection logic
- Validating automation frameworks
- CI/CD pipeline testing
- Educational purposes
- Real OAuth flow testing

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete Google OAuth setup instructions
- **[SECURITY.md](SECURITY.md)** - Important security guidelines and best practices
- **[CODE_REVIEW.md](CODE_REVIEW.md)** - Analysis of current codebase and known issues
- **[TODO.md](TODO.md)** - Future development roadmap
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guidelines for contributors

## 🚀 Quick Start

### Local Setup (5 minutes)

1. **Get a Google OAuth Client ID**:
   - See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed step-by-step instructions
   - Takes about 5 minutes
   - Completely free

2. **Configure the page**:
   ```bash
   # Copy the example config
   cp config.example.js config.js

   # Edit config.js and add your Client ID
   nano config.js
   ```

3. **Serve and test**:
   ```bash
   python -m http.server 8000
   ```

Visit: `http://localhost:8000` - Now with real Google OAuth!

### Deploy to Public Hosting

This is a **single static HTML file** with no dependencies. Deploy anywhere:

#### GitHub Pages (Free)
1. Create a new repository
2. Upload `index.html`
3. Enable GitHub Pages in Settings
4. Access at: `https://yourusername.github.io/repo-name/`

#### Netlify (Free)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd public_oauth_test
netlify deploy --prod
```

Or drag and drop the folder at [netlify.com/drop](https://app.netlify.com/drop)

#### Vercel (Free)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd public_oauth_test
vercel --prod
```

#### Cloudflare Pages (Free)
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Create new project
3. Upload the folder
4. Deploy

#### Any Static Host
Works with: AWS S3, Google Cloud Storage, Azure Static Web Apps, Surge.sh, Render, etc.

## 📋 Testing Examples

### Python + Playwright (Scrapling)

```python
from scrapling.fetchers import StealthySession

def test_google_button():
    def click_button(page):
        page.click("button:has-text('Sign in with Google')")
        page.wait_for_timeout(2000)

    with StealthySession(headless=False) as session:
        session.fetch(
            "https://your-domain.com",
            page_action=click_button,
            wait=3000
        )

test_google_button()
```

### Python + Selenium

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://your-domain.com")

button = driver.find_element(By.ID, "google-signin-btn")
button.click()

driver.quit()
```

### JavaScript + Playwright

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://your-domain.com');
  await page.click('button:has-text("Sign in with Google")');

  await browser.close();
})();
```

### JavaScript + Puppeteer

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://your-domain.com');
  await page.click('#google-signin-btn');

  await browser.close();
})();
```

### Cypress

```javascript
describe('OAuth Button Test', () => {
  it('should click Google sign-in button', () => {
    cy.visit('https://your-domain.com')
    cy.get('#google-signin-btn').click()
    cy.contains('Success').should('be.visible')
  })
})
```

## 🎨 Available Selectors

⚠️ **Important:** Google's OAuth button renders inside an iframe. For automation:

**Main page selectors:**
```python
# The container element
page.locator(".g_id_signin")
page.locator("#g_id_signin_container")
```

**Iframe selectors (for Playwright):**
```python
# Access the Google button inside the iframe
frame = page.frame_locator('iframe[src*="accounts.google.com"]')
button = frame.locator('button')
button.click()
```

**For other frameworks:** See automation examples above for iframe handling patterns.

## 🔍 Features

- ✅ **Real Google OAuth** - Authentic authentication flow
- ✅ **Visual feedback** - Shows success state when authenticated
- ✅ **Console logging** - Detailed logs for debugging
- ✅ **Custom events** - Fires `oauth-authenticated` event
- ✅ **User info display** - Shows authenticated user details
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **Zero dependencies** - Pure HTML/CSS/JS
- ✅ **Fast loading** - Optimized for automation

## 📊 What Gets Logged

When OAuth authentication completes successfully:

```javascript
{
  "type": "real",
  "email": "user@example.com",
  "name": "User Name",
  "timestamp": "2024-10-01T12:34:56.789Z"
}
```

Console logs also include:
- OAuth initialization status
- Button rendering status
- Available selectors
- Authentication events

## 🤝 Contributing

Want to improve this page? See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Priority improvements needed:**
- Add more OAuth providers (GitHub, Facebook, Microsoft)
- Implement automated testing
- Add comprehensive error recovery
- Improve accessibility

See [TODO.md](TODO.md) for the complete roadmap.

## 📜 License

This project is in the public domain. Use it however you want:
- Personal projects
- Commercial projects
- Educational purposes
- Testing and automation
- No attribution required (but appreciated!)

## 🌟 Why This Exists

Testing OAuth automation is tricky:
1. Real OAuth providers block automation
2. Setting up OAuth credentials is complex
3. Rate limits make testing difficult
4. Terms of Service often prohibit automation

This page solves all those problems by providing a **simple, reliable, automation-friendly target** for testing.

## 💡 Use Cases

- **Learning**: Perfect for automation tutorials and courses
- **CI/CD**: Use in continuous integration pipelines  
- **Development**: Test automation logic during development
- **Debugging**: Isolate button detection issues
- **Demos**: Show automation capabilities to clients

## 🐍 Python Test Script

The repository includes `test_google_oauth.py` - a complete automation example.

**Setup:**
```bash
# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Note: You'll need to configure credentials
# See requirements.txt for credential management options
```

**Usage:**
```bash
# Run basic test
python test_google_oauth.py --url https://your-oauth-page.com

# With 2FA support
python test_google_oauth.py --use-2fa

# With hardware security key
python test_google_oauth.py --use-security-key
```

⚠️ **Note:** The script has external dependencies. See [CODE_REVIEW.md](CODE_REVIEW.md) for known issues.

## ⚠️ Known Issues

See [CODE_REVIEW.md](CODE_REVIEW.md) for detailed analysis of:
- Incomplete features
- Deprecated code patterns
- Security considerations
- Documentation gaps

## 🗺️ Roadmap

See [TODO.md](TODO.md) for the complete development roadmap including:
- Critical fixes needed
- Planned improvements
- Future features
- Contribution opportunities

## 🛡️ Security

**Important:** This is a testing tool using real OAuth.

- ⚠️ Client-side JWT parsing is for display only
- ⚠️ Always verify tokens server-side in production
- ⚠️ Be mindful of rate limits when testing
- ⚠️ Use test accounts, not production accounts

See [SECURITY.md](SECURITY.md) for complete security guidelines.

## GITHUB

[code here](https://github.com/cycle-five/public_oauth_test)

## 🔗 Related Projects

If you find this useful, check out:
- [Scrapling](https://github.com/D4Vinci/Scrapling) - Undetectable web scraping library
- [Playwright](https://playwright.dev/) - Modern automation framework
- [Selenium](https://www.selenium.dev/) - Popular automation tool

---

**Made for the testing community** 🧪

If you deploy this publicly, consider sharing the URL with the community!
