# Contributing to OAuth Test Page

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

---

## 🚀 Getting Started

### What Can You Contribute?

- **Bug fixes** - Fix issues listed in GitHub Issues
- **Documentation** - Improve guides, add examples, fix typos
- **Features** - Implement items from TODO.md
- **Tests** - Add automated tests
- **Examples** - Add automation examples for different frameworks
- **Translations** - Translate documentation to other languages

### Before You Start

1. **Read the documentation:**
   - [README.md](README.md) - Project overview
   - [CODE_REVIEW.md](CODE_REVIEW.md) - Current issues and analysis
   - [TODO.md](TODO.md) - Planned improvements
   - [SECURITY.md](SECURITY.md) - Security guidelines

2. **Check existing issues:**
   - Look for [existing issues](https://github.com/cycle-five/public_oauth_test/issues)
   - Comment if you want to work on something
   - Avoid duplicate work

3. **Start small:**
   - First contribution? Pick a "good first issue"
   - Familiarize yourself with the codebase
   - Ask questions if unsure

---

## 💻 Development Setup

### Prerequisites

- **Web browser** (Chrome, Firefox, Safari, or Edge)
- **Python 3.8+** (for local testing)
- **Git** (for version control)
- **Text editor** (VS Code, Sublime, etc.)

### Local Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/public_oauth_test.git
   cd public_oauth_test
   ```

2. **Set up Google OAuth (optional for HTML changes):**
   - Follow [SETUP_GUIDE.md](SETUP_GUIDE.md)
   - Create `config.js` from `config.example.js`
   - Add your Google Client ID

3. **Start local server:**
   ```bash
   # Simple HTTP server (for non-OAuth testing)
   python -m http.server 8000
   
   # HTTPS server (for OAuth testing)
   ./deploy.sh
   # Select option 1 (Test locally)
   ```

4. **Test your changes:**
   - Open `http://localhost:8000` (HTTP)
   - Or `https://localhost:8000` (HTTPS with OAuth)

### Python Test Script Setup (Optional)

If working on the Python test script:

```bash
# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Note: You'll need to handle the scrapling_pick dependency
# See requirements.txt for alternatives
```

---

## 🔄 Contribution Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions
- `refactor/` - Code refactoring

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

- **Manual testing:**
  - Test in multiple browsers
  - Test with OAuth enabled and disabled
  - Test responsive design
  
- **Automated testing** (when available):
  ```bash
  # Run tests (when implemented)
  npm test
  # or
  pytest
  ```

### 4. Commit Your Changes

```bash
git add .
git commit -m "Brief description of changes"
```

**Commit message guidelines:**
- Use present tense ("Add feature" not "Added feature")
- Be specific and concise
- Reference issues when applicable (#123)

**Examples:**
```
Add GitHub OAuth provider support
Fix selector documentation for Google button
Update README with iframe handling examples
Implement test mode toggle (#42)
```

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub.

---

## 📝 Code Standards

### HTML

```html
<!-- Use semantic HTML -->
<button class="google-btn" id="google-signin-btn">
    <!-- Descriptive content -->
</button>

<!-- Add ARIA labels for accessibility -->
<button aria-label="Sign in with Google">
    Sign in with Google
</button>

<!-- Keep structure clean and indented -->
<div class="container">
    <div class="inner">
        <p>Content</p>
    </div>
</div>
```

### CSS

```css
/* Use clear, descriptive class names */
.google-btn {
    /* Group related properties */
    /* Use consistent spacing */
    background-color: #4285f4;
    color: white;
    padding: 12px 24px;
    
    /* Add comments for complex styles */
    transition: all 0.3s ease;
}

/* Use BEM naming when appropriate */
.button--primary { }
.button__icon { }
```

### JavaScript

```javascript
// Use camelCase for variables and functions
const clientIdConfigured = false;

function handleCredentialResponse(response) {
    // Use descriptive variable names
    const userPayload = parseJwt(response.credential);
    
    // Add error handling
    if (!userPayload) {
        console.error('Failed to parse JWT');
        return;
    }
    
    // Add comments for complex logic
    // Check if OAuth response contains required fields
    // before updating UI
}

// Use const/let, avoid var
const MAX_RETRIES = 3;
let retryCount = 0;

// Add JSDoc for functions
/**
 * Parse JWT token for display purposes only
 * @param {string} token - The JWT token to parse
 * @returns {Object} Decoded token payload
 */
function parseJwt(token) {
    // Implementation
}
```

### Python

```python
# Follow PEP 8
import time
from playwright.sync_api import Page

def find_google_buttons(page: Page) -> list:
    """
    Find Google OAuth buttons on the page.
    
    Args:
        page: Playwright Page object
        
    Returns:
        List of button Locators
    """
    google_buttons = []
    
    # Use meaningful variable names
    for selector in google_button_selectors:
        try:
            button = page.locator(selector)
            if button.is_visible(timeout=1000):
                google_buttons.append(button)
        except Exception as e:
            # Specific exception handling with logging
            log.debug(f"Selector '{selector}' failed: {e}")
            continue
    
    return google_buttons
```

### Shell Scripts

```bash
#!/bin/bash
# Add description at top
# Purpose: Deploy OAuth test page

set -e  # Exit on error

# Use functions for complex logic
check_dependencies() {
    if ! command -v python3 &> /dev/null; then
        echo "Error: Python 3 is required"
        exit 1
    fi
}

# Add comments for clarity
# Check if config.js exists before deploying
if [ ! -f "config.js" ]; then
    echo "Warning: config.js not found"
fi
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] **Browsers:**
  - [ ] Chrome/Chromium
  - [ ] Firefox
  - [ ] Safari (if available)
  - [ ] Edge

- [ ] **Functionality:**
  - [ ] OAuth button appears
  - [ ] OAuth flow works (if configured)
  - [ ] Error states display correctly
  - [ ] Console has no errors

- [ ] **Responsive Design:**
  - [ ] Desktop (1920x1080)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)

- [ ] **Accessibility:**
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatibility
  - [ ] Color contrast meets standards

### Automated Testing (Future)

When automated tests are added:

```bash
# Run linting
npm run lint

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

---

## 📚 Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing behavior
- Fix bugs that affect usage
- Add new dependencies
- Change configuration

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start |
| `SETUP_GUIDE.md` | Detailed OAuth setup |
| `CODE_REVIEW.md` | Current issues analysis |
| `TODO.md` | Future development tasks |
| `SECURITY.md` | Security guidelines |
| `CONTRIBUTING.md` | This file |

### Documentation Standards

```markdown
# Use clear headings

## Organize with hierarchy

### Add examples when helpful

```javascript
// Code examples should be complete and working
const example = "like this";
```

- Use lists for steps
- **Bold** important terms
- `Code format` for commands and code
- Links to [relevant resources](https://example.com)

⚠️ Use emoji sparingly for important callouts
```

---

## 🔀 Pull Request Process

### Before Creating PR

1. **Update from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Review your changes:**
   ```bash
   git diff main
   ```

3. **Test thoroughly** (see Testing Guidelines)

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Related Issues
Fixes #123
Related to #456

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Done
- Tested in Chrome, Firefox, Safari
- Tested OAuth flow
- Tested responsive design
- No console errors

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes
- [ ] Tested in multiple browsers
```

### Review Process

1. **Automated checks** (when set up):
   - Linting
   - Tests
   - Security scans

2. **Manual review:**
   - Code quality
   - Documentation
   - Testing coverage
   - Security considerations

3. **Feedback:**
   - Address review comments
   - Push updates to same branch
   - PR updates automatically

4. **Approval and merge:**
   - Maintainer approves
   - Squash and merge to main
   - Branch deleted

---

## 🎯 Priority Areas

Looking for where to contribute? Focus on:

### High Priority
1. **Fix test mode** - Remove or fully implement (TODO.md #TEST-001)
2. **Python dependencies** - Fix requirements.txt (TODO.md #TEST-002)
3. **Documentation** - Fix README inconsistencies (TODO.md #TEST-003)

### Good First Issues
- Fix typos in documentation
- Add browser compatibility info
- Improve error messages
- Add code comments

### Advanced Contributions
- Add automated tests
- Implement multi-provider OAuth
- Add build system
- Improve accessibility

---

## 💬 Communication

### Getting Help

- **GitHub Issues** - Ask questions, report bugs
- **Discussions** - General discussion, ideas
- **Pull Requests** - Code review, feedback

### Be Respectful

- Be kind and professional
- Assume good intentions
- Provide constructive feedback
- Welcome newcomers

---

## 📜 License

By contributing, you agree that your contributions will be placed in the public domain, consistent with the project's existing license.

---

## 🙏 Recognition

Contributors will be:
- Listed in GitHub contributors
- Mentioned in release notes (for significant contributions)
- Acknowledged in README (for major features)

---

## ❓ Questions?

If you have questions about contributing:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with your question

Thank you for contributing! 🎉
