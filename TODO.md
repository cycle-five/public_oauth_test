# TODO: Future Development Tasks

**Last Updated:** 2025-12-05  
**Status:** Active Development Planning

---

## 🔴 Critical (Fix ASAP)

### TEST-001: Remove or Implement Test Mode
**Priority:** Critical  
**Effort:** Medium (4-8 hours)  
**Files:** `index.html`, `README.md`, `test_google_oauth.py`

**Problem:**
- Test mode is advertised but not available
- Manual test button is commented out
- Dead code in JavaScript functions
- Misleading documentation

**Tasks:**
- [ ] Decision: Implement fully OR remove completely
- [ ] If implementing:
  - [ ] Uncomment manual button (index.html:240-248)
  - [ ] Test handleManualSignInClick() function
  - [ ] Document test mode selectors accurately
  - [ ] Add toggle between real/test mode
- [ ] If removing:
  - [ ] Remove handleManualSignInClick() function (lines 377-411)
  - [ ] Remove test-mode-info div (lines 269-274)
  - [ ] Update README.md to remove test mode references
  - [ ] Update selectors box to only show real selectors

**Acceptance Criteria:**
- No references to unavailable features in documentation
- All advertised features work
- Selectors list matches actual DOM elements

---

### TEST-002: Fix Python Test Dependencies
**Priority:** Critical  
**Effort:** Small (1-2 hours)  
**Files:** `test_google_oauth.py`, new `requirements.txt`

**Problem:**
- Script imports non-standard `scrapling_pick` package
- No dependency documentation
- Comment says "There's some stuff broken"
- Cannot run without undocumented setup

**Tasks:**
- [ ] Create requirements.txt with all dependencies:
  ```
  playwright>=1.40.0
  scrapling>=0.2.0
  ```
- [ ] Document or remove scrapling_pick dependency
- [ ] Add setup instructions to README
- [ ] Fix or remove "There's some stuff broken" comment
- [ ] Add error handling for missing credentials
- [ ] Test installation on clean environment

**Acceptance Criteria:**
- Test script runs after following documented setup
- All dependencies explicitly listed
- Clear error messages for missing configuration

---

### TEST-003: Update README to Match Reality
**Priority:** Critical  
**Effort:** Small (1 hour)  
**Files:** `README.md`

**Problem:**
- Claims test mode works without setup
- Lists selectors for non-existent elements
- Contains editorial comments
- Inconsistent with actual functionality

**Tasks:**
- [ ] Remove or clarify test mode references (line 21)
- [ ] Remove editorial comment (line 225)
- [ ] Remove author's note about commenting out button (line 7)
- [ ] Fix "No setup required • Tracking" footer text (line 289)
- [ ] Update selector examples to only working ones
- [ ] Add note about iframe rendering for Google button
- [ ] Add troubleshooting section

**Acceptance Criteria:**
- No claims about features that don't exist
- All examples work as documented
- No out-of-place comments or notes

---

## 🟡 High Priority (Fix Soon)

### TEST-004: Fix Bare Except Clauses
**Priority:** High  
**Effort:** Small (30 minutes)  
**Files:** `test_google_oauth.py`

**Problem:**
- Bare `except:` clauses catch all exceptions (lines 232, 297, 324)
- Violates Python best practices
- Catches KeyboardInterrupt, makes debugging hard

**Tasks:**
- [ ] Replace bare except with `except Exception as e:`
- [ ] Add logging for caught exceptions
- [ ] Test that KeyboardInterrupt still works

**Example Fix:**
```python
# Before
except:
    continue

# After
except Exception as e:
    log.debug(f"Selector '{selector}' failed: {e}")
    continue
```

---

### TEST-005: Add Security Warnings
**Priority:** High  
**Effort:** Small (1 hour)  
**Files:** `README.md`, `SECURITY.md` (new)

**Problem:**
- Client-side JWT parsing could be misused
- No guidance on proper token verification
- Missing rate limiting documentation

**Tasks:**
- [ ] Create SECURITY.md with warnings:
  - Client-side JWT parsing is for display only
  - Always verify tokens server-side in production
  - Example of proper server-side verification
  - Rate limiting considerations
  - OAuth security best practices
- [ ] Add security section to README
- [ ] Link to SECURITY.md from index.html comments

---

### TEST-006: Document Iframe Handling
**Priority:** High  
**Effort:** Medium (2-3 hours)  
**Files:** `README.md`, `SETUP_GUIDE.md`, new examples

**Problem:**
- Google button renders in iframe
- No documentation about iframe interaction
- Automation examples don't address iframe

**Tasks:**
- [ ] Document iframe structure in README
- [ ] Update automation examples to show iframe handling
- [ ] Add Playwright example with iframe:
  ```python
  frame = page.frame_locator('iframe[src*="accounts.google.com"]')
  button = frame.locator('button')
  button.click()
  ```
- [ ] Add Selenium example with iframe switching
- [ ] Document common iframe issues

---

## 🟢 Medium Priority (Should Consider)

### TEST-007: Add Error Recovery UI
**Priority:** Medium  
**Effort:** Medium (3-4 hours)  
**Files:** `index.html`

**Problem:**
- Once OAuth fails, page is stuck
- No way to retry without refresh
- Poor user experience on errors

**Tasks:**
- [ ] Add "Try Again" button to error states
- [ ] Add clear error messages for common issues:
  - Invalid Client ID
  - Popup blocked
  - Network error
  - User cancelled
- [ ] Add reset functionality
- [ ] Test error states

---

### TEST-008: Improve Configuration Management
**Priority:** Medium  
**Effort:** Medium (4-6 hours)  
**Files:** `netlify_build.sh`, `deploy.sh`, new templating

**Problem:**
- sed replacement is fragile
- No validation of substitution
- Special characters could break

**Tasks:**
- [ ] Replace sed with proper templating (envsubst or Node.js)
- [ ] Add validation after substitution
- [ ] Handle edge cases (special chars in CLIENT_ID)
- [ ] Add rollback on failure
- [ ] Document configuration approaches
- [ ] Test with various CLIENT_ID formats

---

### TEST-009: Add Automated Tests
**Priority:** Medium  
**Effort:** Large (8-12 hours)  
**Files:** New test directory, GitHub Actions

**Problem:**
- No automated testing
- Manual verification required
- Could break without noticing

**Tasks:**
- [ ] Add HTML validation tests
- [ ] Add JavaScript unit tests
- [ ] Add end-to-end tests (with mock OAuth)
- [ ] Set up GitHub Actions workflow
- [ ] Add badge to README
- [ ] Test on multiple browsers

**Example Tests:**
```javascript
// Validate HTML structure
test('page has required elements', () => {
  expect(document.querySelector('.container')).toBeTruthy();
  expect(document.querySelector('#g_id_onload')).toBeTruthy();
});

// Test configuration loading
test('config loads correctly', () => {
  expect(typeof GOOGLE_CLIENT_ID).toBe('string');
  expect(GOOGLE_CLIENT_ID.length).toBeGreaterThan(0);
});
```

---

### TEST-010: Add Health Check Endpoint
**Priority:** Medium  
**Effort:** Small (1-2 hours)  
**Files:** New `health.html` or `status.json`

**Tasks:**
- [ ] Create simple health check page
- [ ] Return JSON with status information
- [ ] Check if config is loaded
- [ ] Check if Google API is accessible
- [ ] Add monitoring documentation

---

## 🔵 Low Priority (Nice to Have)

### TEST-011: Build System
**Priority:** Low  
**Effort:** Large (16-24 hours)  
**Files:** New build configuration

**Tasks:**
- [ ] Evaluate build tools (Vite, webpack, Parcel)
- [ ] Split JavaScript into separate file
- [ ] Add CSS preprocessing (SCSS/LESS)
- [ ] Add minification for production
- [ ] Add source maps
- [ ] Add development server
- [ ] Add hot reload for development
- [ ] Update deployment scripts
- [ ] Document build process

---

### TEST-012: Multi-Provider OAuth
**Priority:** Low  
**Effort:** Large (24-40 hours per provider)  
**Files:** `index.html`, new provider files

**Providers to Add:**
- [ ] GitHub OAuth
- [ ] Microsoft OAuth
- [ ] Facebook OAuth
- [ ] Apple Sign In
- [ ] Twitter/X OAuth

**Tasks per Provider:**
- [ ] Research OAuth flow
- [ ] Add button UI
- [ ] Implement authentication
- [ ] Update documentation
- [ ] Add setup guide
- [ ] Add examples

---

### TEST-013: Analytics/Telemetry
**Priority:** Low  
**Effort:** Medium (6-8 hours)  
**Files:** `index.html`, new analytics module

**Tasks:**
- [ ] Choose privacy-respecting analytics (Plausible, GoatCounter)
- [ ] Make it opt-in or clearly documented
- [ ] Track useful metrics:
  - OAuth success/failure rates
  - Button click events
  - Common errors
- [ ] Add dashboard
- [ ] Document what's tracked
- [ ] Add opt-out mechanism

---

### TEST-014: Accessibility Improvements
**Priority:** Low  
**Effort:** Medium (6-10 hours)  
**Files:** `index.html`

**Tasks:**
- [ ] Run accessibility audit (axe, WAVE)
- [ ] Add ARIA labels to all interactive elements
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Ensure color contrast meets WCAG AA
- [ ] Add skip links
- [ ] Test with accessibility tools
- [ ] Document accessibility features

---

### TEST-015: Browser Compatibility Testing
**Priority:** Low  
**Effort:** Medium (4-6 hours)  
**Files:** New test suite, documentation

**Tasks:**
- [ ] Test on Chrome (latest, latest-1)
- [ ] Test on Firefox (latest, latest-1)
- [ ] Test on Safari (latest, latest-1)
- [ ] Test on Edge (latest)
- [ ] Test on mobile browsers
- [ ] Document supported browsers
- [ ] Add compatibility matrix to README
- [ ] Test OAuth flow on each browser

---

## 📋 Enhancement Ideas

### TEST-016: Interactive Demo Mode
Add interactive tutorial showing how automation works
- [ ] Step-by-step guide overlay
- [ ] Highlight selectors on hover
- [ ] Show example code snippets
- [ ] Record interactions

### TEST-017: Code Generator
Generate automation code based on user selections
- [ ] Select framework (Playwright, Selenium, etc.)
- [ ] Select language (Python, JavaScript, Java)
- [ ] Generate complete working example
- [ ] Copy to clipboard functionality

### TEST-018: OAuth Debugger
Tool to debug OAuth issues
- [ ] Show OAuth flow steps
- [ ] Display redirects
- [ ] Show tokens (safely)
- [ ] Validate configuration
- [ ] Common issues diagnostic

### TEST-019: Rate Limiting Simulator
Demonstrate handling of rate limits
- [ ] Simulate rate limit errors
- [ ] Show retry strategies
- [ ] Document best practices
- [ ] Test automation resilience

### TEST-020: Docker Development Environment
Complete development environment in Docker
- [ ] Dockerfile for local development
- [ ] Docker Compose with services
- [ ] Pre-configured OAuth settings
- [ ] One-command setup

---

## 📊 Effort Summary

| Priority | Tasks | Total Estimated Hours |
|----------|-------|----------------------|
| Critical | 3 | 6-11 hours |
| High | 3 | 3.5-6.5 hours |
| Medium | 4 | 18-28 hours |
| Low | 5 | 56-92 hours |
| **Total** | **15** | **83.5-137.5 hours** |

---

## 🎯 Recommended Roadmap

### Phase 1: Stabilization (Critical Items)
**Timeline:** 1-2 weeks  
**Focus:** Fix broken/misleading features
- TEST-001: Test mode decision
- TEST-002: Python dependencies
- TEST-003: README updates

### Phase 2: Quality (High Priority Items)
**Timeline:** 1 week  
**Focus:** Code quality and security
- TEST-004: Fix except clauses
- TEST-005: Security documentation
- TEST-006: Iframe documentation

### Phase 3: Enhancement (Medium Priority Items)
**Timeline:** 2-4 weeks  
**Focus:** User experience and reliability
- TEST-007: Error recovery
- TEST-008: Configuration management
- TEST-009: Automated tests
- TEST-010: Health check

### Phase 4: Growth (Low Priority Items)
**Timeline:** 2-3 months  
**Focus:** Expansion and optimization
- Selected items based on user feedback

---

## 📝 Notes

- All effort estimates are for a single developer
- Estimates include testing and documentation
- Priorities may change based on user feedback
- Some tasks can be parallelized
- Consider community contributions for Phase 4

---

## 🤝 Contributing

If you want to help with any of these tasks:
1. Check if task is already assigned in issues
2. Comment on the issue to claim it
3. Reference this TODO in your PR
4. Update this file when task is complete

---

**Maintained by:** Repository maintainers  
**Review Schedule:** Monthly  
**Last Review:** 2025-12-05
