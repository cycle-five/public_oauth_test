# OAuth Test Page - Public Testing Resource

A free, public webpage designed specifically for testing OAuth button detection and automation with tools like Selenium, Playwright, Puppeteer, and Cypress.

RE: The manual test button, I commented it out. I'm not sure if the interaction it provided was realistic enough to serve any purpose. If you want to deploy this you will need a google client id for an app from your developer account.

## 🎯 Purpose

This page provides a **simple, reliable target** for testing automation frameworks with **real Google OAuth** or test mode.

### Two Modes:

1. **Real OAuth Mode** ✅
   - Authentic Google sign-in flow
   - Real JWT tokens
   - Actual Google authentication screens
   - Perfect for end-to-end testing

2. **Test Mode** (no setup required)
   - Manual test button for automation logic
   - No Google configuration needed
   - Perfect for button detection testing

Perfect for:
- Learning web automation
- Testing button detection logic
- Validating automation frameworks
- CI/CD pipeline testing
- Educational purposes
- Real OAuth flow testing

## 🚀 Quick Start

### Option 1: Test Mode (No Setup)

```bash
# Serve the page locally
python -m http.server 8000
```

Visit: `https://localhost:8000`

The page works immediately with a manual test button!

### Option 2: Real OAuth Mode (5-minute setup)

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

The page is designed with multiple selector strategies (ymmv):

- `button:has-text("Google")` - Text-based
- `button:has-text("Sign in with Google")` - Full text
- `#google-signin-btn` - ID selector
- `.google-btn` - Class selector

## 🔍 Features

- ✅ **No authentication required** - Just a button that responds to clicks
- ✅ **Visual feedback** - Shows success state when clicked
- ✅ **Console logging** - Detailed logs for debugging
- ✅ **Custom events** - Fires `oauth-test-clicked` event
- ✅ **Click counter** - Tracks multiple clicks
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **Zero dependencies** - Pure HTML/CSS/JS
- ✅ **Fast loading** - Optimized for automation

## 📊 What Gets Logged

When the button is clicked:

```javascript
{
  "message": "Google Sign-in button clicked!",
  "clickCount": 1,
  "timestamp": "2024-10-01T12:34:56.789Z",
  "eventType": "Button click (automated or manual)"
}
```

## 🤝 Contributing

Want to improve this page? Ideas:
- Add more OAuth provider buttons (GitHub, Facebook, etc.)
- Add different button styles to test
- Add more complex authentication flows
- Add API endpoints for testing
- Add CAPTCHA simulation

## 📜 License

(Correct, and interesting, does it always assume to put things in public domain?)
This is public domain. Use it however you want:
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
