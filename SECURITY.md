# Security Guidelines

**Last Updated:** 2025-12-05  
**Version:** 1.0

---

## ⚠️ Important Security Notice

This OAuth test page is designed for **testing and educational purposes**. While it uses real Google OAuth, there are important security considerations you must understand before using this in any production context.

---

## 🔐 OAuth Security Best Practices

### 1. Client-Side JWT Parsing

**⚠️ WARNING:** The page includes client-side JWT parsing for display purposes only:

```javascript
// Parse JWT token (client-side only, don't use for verification!)
function parseJwt(token) {
    // ... decoding logic ...
}
```

**Why This Is Unsafe for Production:**
- Client-side code can be manipulated by users
- JWT signatures are not verified
- Anyone can create fake tokens with arbitrary data
- This is for **demonstration only**

**What You Should Do Instead:**

Always verify JWT tokens on your server:

```python
# Python example using PyJWT
import jwt
from jwt import PyJWKClient

# Google's public keys
jwks_client = PyJWKClient("https://www.googleapis.com/oauth2/v3/certs")

def verify_google_token(token):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="YOUR_CLIENT_ID",  # Must match your Client ID
            issuer="https://accounts.google.com"
        )
        return data  # Token is valid
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
```

```javascript
// Node.js example using google-auth-library
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
```

### 2. Never Expose Client Secret

**✅ Safe to Expose:**
- Client ID (in this repository)
- Redirect URIs
- OAuth endpoints

**❌ Never Expose:**
- Client Secret (not used in this implementation, but if you add it)
- Refresh tokens
- Access tokens
- User passwords

**This Project:**
- Uses Google's JavaScript SDK which only requires Client ID
- Does not use Client Secret (correct for client-side apps)
- Tokens are handled by Google's library

### 3. HTTPS Requirements

OAuth **requires HTTPS** in production:

**For Development:**
```bash
# localhost with HTTP is allowed for testing
python -m http.server 8000
# Visit: http://localhost:8000
```

**For Production:**
```bash
# Must use HTTPS
https://yourdomain.com
```

**Why:**
- Protects tokens in transit
- Required by OAuth 2.0 specification
- Google enforces this for non-localhost

### 4. Authorized Origins

Only add trusted domains to your OAuth configuration:

```
✅ Good:
https://yourdomain.com
https://staging.yourdomain.com
http://localhost:8000

❌ Bad:
http://yourdomain.com (no HTTPS)
*://yourdomain.com (wildcard)
https://*.yourdomain.com (subdomain wildcard)
```

---

## 🤖 Automation Security

### Rate Limiting

**Problem:** Excessive automation can:
- Trigger Google's bot detection
- Get your IP rate-limited
- Violate Terms of Service

**Best Practices:**
1. **Add delays between requests:**
   ```python
   import time
   time.sleep(2)  # 2 second delay
   ```

2. **Implement exponential backoff:**
   ```python
   retries = 0
   max_retries = 5
   
   while retries < max_retries:
       try:
           # Your OAuth call
           break
       except RateLimitError:
           wait_time = (2 ** retries) + random.uniform(0, 1)
           time.sleep(wait_time)
           retries += 1
   ```

3. **Use test accounts:**
   - Create separate accounts for testing
   - Don't use production accounts
   - Respect test user limits

4. **Monitor usage:**
   - Track API calls
   - Set up alerts for unusual activity
   - Review logs regularly

### Bot Detection

Google has sophisticated bot detection. Your automation might be blocked if:
- You make too many requests too quickly
- You don't handle user interactions naturally
- Your user agent is suspicious
- You bypass CAPTCHA

**Recommendations:**
- Use this page for testing automation logic, not production scraping
- Implement proper OAuth flows in your application
- Use Google's official APIs when available
- Respect robots.txt and Terms of Service

---

## 🔒 Data Protection

### What This Page Collects

**On the Client Side:**
- Name and email from Google OAuth response
- Timestamps of authentication
- Browser console logs (local only)

**What We Don't Collect:**
- No server-side logging (static page)
- No analytics (unless you add them)
- No persistent storage
- No third-party tracking

### User Privacy

If you deploy this publicly:

1. **Add a Privacy Policy:**
   - Explain what data is processed
   - How tokens are handled
   - Who can access the data

2. **Be Transparent:**
   - Show users what information you receive
   - Explain why you need OAuth
   - Provide opt-out mechanisms

3. **Minimize Data Collection:**
   - Only request scopes you need
   - Don't store tokens unnecessarily
   - Clear data after use

### GDPR Considerations

If you have EU users:
- ✅ Obtain explicit consent before OAuth
- ✅ Allow users to view their data
- ✅ Provide data deletion mechanism
- ✅ Document data processing
- ✅ Implement appropriate security measures

---

## 🚨 Common Security Mistakes

### 1. ❌ Storing Client Secret in Code

```javascript
// NEVER DO THIS:
const CLIENT_SECRET = "YOUR_SECRET_HERE";  // ❌ Exposed!
```

**Solution:** This project doesn't need Client Secret (client-side flow).

### 2. ❌ Accepting Any Token

```javascript
// NEVER DO THIS:
function handleLogin(token) {
    const user = parseJwt(token);  // ❌ Not verified!
    loginUser(user);
}
```

**Solution:** Always verify on server (see section 1).

### 3. ❌ Insecure Redirect URIs

```javascript
// NEVER DO THIS:
const redirectUri = req.query.redirect;  // ❌ Open redirect!
window.location = redirectUri;
```

**Solution:** Whitelist allowed redirect URIs.

### 4. ❌ Long-Lived Tokens

```javascript
// NEVER DO THIS:
localStorage.setItem('token', token);  // ❌ Persists forever!
```

**Solution:** Use session storage, implement expiration, refresh tokens properly.

### 5. ❌ Ignoring CORS

```javascript
// NEVER DO THIS:
Access-Control-Allow-Origin: *  // ❌ Allows any domain!
```

**Solution:** Specify exact origins or don't use CORS for sensitive operations.

---

## 📋 Security Checklist

Before deploying this to production:

- [ ] **Remove test mode code** if not needed
- [ ] **Implement server-side token verification**
- [ ] **Use HTTPS** (not HTTP)
- [ ] **Validate redirect URIs** on server
- [ ] **Add rate limiting** to prevent abuse
- [ ] **Implement CSRF protection**
- [ ] **Set up security headers** (CSP, X-Frame-Options, etc.)
- [ ] **Add logging and monitoring** for suspicious activity
- [ ] **Create privacy policy** and terms of service
- [ ] **Implement token expiration** and refresh
- [ ] **Test security** with tools like OWASP ZAP
- [ ] **Keep dependencies updated**
- [ ] **Enable 2FA** on Google Cloud project
- [ ] **Monitor OAuth usage** in Google Console
- [ ] **Set up alerts** for unusual activity

---

## 🔍 Security Testing

### Recommended Tools

1. **OWASP ZAP** - Web app security scanner
2. **Burp Suite** - Security testing proxy
3. **Google Lighthouse** - Includes security checks
4. **npm audit** - Check for vulnerable dependencies (if using Node.js)

### What to Test

- [ ] JWT token validation
- [ ] Redirect URI validation
- [ ] CSRF protection
- [ ] XSS vulnerabilities
- [ ] SQL injection (if you add a database)
- [ ] Rate limiting
- [ ] Session management
- [ ] Error message leakage

---

## 📞 Reporting Security Issues

If you discover a security vulnerability in this project:

1. **Do NOT** open a public issue
2. Email the maintainer privately (see repository)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work to address the issue promptly.

---

## 📚 Additional Resources

### OAuth Security
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OWASP OAuth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html)

### JWT Security
- [JWT.io](https://jwt.io/) - JWT debugger and info
- [RFC 7519 - JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [JWT Attack Playbook](https://github.com/ticarpi/jwt_tool/wiki)

### General Web Security
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Google Web Fundamentals - Security](https://developers.google.com/web/fundamentals/security)

---

**Remember:** This is a testing tool. Do not use in production without proper security review and server-side implementation.

**Last Security Audit:** None (this is a demo project)  
**Recommended:** Conduct security audit before production use
