# Google OAuth Setup Guide

This guide walks you through setting up real Google OAuth authentication for the test page.

## Why Use Real OAuth?

Testing with real Google OAuth gives you:
- ✅ **Authentic experience** - Exactly matches production OAuth flows
- ✅ **Real redirects** - Test actual Google login screens
- ✅ **Token handling** - Work with real JWT tokens
- ✅ **Better testing** - Catch issues that mock flows might miss

## Quick Start (5 minutes)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown (top left, next to "Google Cloud")
3. Click "**NEW PROJECT**"
4. Enter project details:
   - **Project name**: `OAuth Test Page` (or any name)
   - **Organization**: Leave default
5. Click "**CREATE**"
6. Wait for the project to be created (~30 seconds)

### Step 2: Enable Required APIs

1. Make sure your new project is selected (check the dropdown at top)
2. In the left sidebar, click "**APIs & Services**" → "**Library**"
3. Search for "**Google+ API**" (optional but recommended)
4. Click it and press "**ENABLE**"

> **Note**: For basic OAuth, this step is optional, but it's good practice.

### Step 3: Configure OAuth Consent Screen

This is the screen users see when logging in.

1. In the left sidebar, click "**APIs & Services**" → "**OAuth consent screen**"
2. Choose user type:
   - **Internal**: Only for Google Workspace users (if you have a workspace)
   - **External**: For any Google account (recommended for testing) ✅
3. Click "**CREATE**"

4. Fill in the **App information**:
   - **App name**: `OAuth Test Page` (or any name)
   - **User support email**: Your email
   - **App logo**: (optional, skip for now)

5. Fill in **Developer contact information**:
   - **Email addresses**: Your email

6. Click "**SAVE AND CONTINUE**"

7. **Scopes** page:
   - Click "**ADD OR REMOVE SCOPES**"
   - Find and check these scopes:
     - `openid`
     - `email`
     - `profile`
   - Click "**UPDATE**"
   - Click "**SAVE AND CONTINUE**"

8. **Test users** page (for External apps):
   - Click "**+ ADD USERS**"
   - Enter the Gmail address you'll use for testing
   - Click "**ADD**"
   - Click "**SAVE AND CONTINUE**"

9. **Summary** page:
   - Review everything
   - Click "**BACK TO DASHBOARD**"

### Step 4: Create OAuth Client ID

1. In the left sidebar, click "**APIs & Services**" → "**Credentials**"
2. Click "**+ CREATE CREDENTIALS**" (top of page)
3. Select "**OAuth client ID**"

4. Configure the client:
   - **Application type**: `Web application` ✅
   - **Name**: `OAuth Test Page Web Client` (or any name)

5. Add **Authorized JavaScript origins**:
   - Click "**+ ADD URI**"
   - For local testing, add:
     ```
     http://localhost:8000
     ```
   - If deploying publicly, add your domain:
     ```
     https://yourdomain.com
     ```
   - You can add multiple URIs

6. **Authorized redirect URIs**:
   - Leave empty (not needed for this implementation)

7. Click "**CREATE**"

8. **Copy your Client ID**:
   - A dialog appears with your credentials
   - Copy the **Client ID** (looks like: `123456789-abc...xyz.apps.googleusercontent.com`)
   - Click "**OK**"

### Step 5: Configure the Test Page

1. Open `config.js` in a text editor
2. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID:

```javascript
const GOOGLE_CLIENT_ID = '123456789-abcdefghijk.apps.googleusercontent.com';
```

3. Save the file

### Step 6: Test It!

**Local testing:**
```bash
cd public_oauth_test
python -m http.server 8000
```

Visit: `http://localhost:8000`

**What to expect:**
- You'll see both a Google button and a manual test button
- Click the Google button
- A Google sign-in popup appears
- Sign in with your Google account (must be a test user if app is in testing mode)
- After successful login, the page shows your name and email

## Common Issues & Solutions

### Issue: "Access blocked: This app's request is invalid"

**Solution**: Make sure you added `http://localhost:8000` to **Authorized JavaScript origins**, not redirect URIs.

### Issue: "This app isn't verified"

**Solution**:
- This is normal for apps in "Testing" mode
- Click "**Advanced**" → "**Go to [App Name] (unsafe)**"
- Or publish your app (see Publishing section below)

### Issue: "You don't have access to this app"

**Solution**:
- If your app is in "Testing" mode, you must add your email as a test user
- Go to OAuth consent screen → Test users → Add your email

### Issue: Google button doesn't appear

**Solution**:
- Check browser console for errors
- Verify `config.js` has the correct Client ID format
- Make sure you're serving over HTTP (not opening the file directly)

### Issue: "redirect_uri_mismatch"

**Solution**: The origin in your browser must exactly match what's in Google Cloud Console.
- `http://localhost:8000` ✅
- `http://localhost:8000/` ❌ (trailing slash matters sometimes)
- Check for `http` vs `https`

## Publishing Your App (Optional)

By default, your app is in "Testing" mode, which limits it to 100 test users.

### To publish for anyone to use:

1. Go to **OAuth consent screen**
2. Click "**PUBLISH APP**"
3. Confirm by clicking "**CONFIRM**"

**Note**: If you added sensitive scopes, you'll need to go through Google's verification process. For basic `openid`, `email`, and `profile` scopes, no verification is needed.

## Production Deployment

### When deploying to a public URL:

1. **Add production domain** to Authorized JavaScript origins:
   ```
   https://yourdomain.com
   ```

2. **Update config.js** or use environment variables (recommended for security):
   - Don't commit real Client ID to public repos
   - Use build-time replacement or server-side injection

3. **Consider security**:
   - Client ID can be public (it's meant to be)
   - Never expose Client Secret (not used in this implementation)
   - Use HTTPS in production

## Advanced Configuration

### Multiple Domains

You can add multiple authorized origins:
```
http://localhost:8000
http://localhost:3000
https://staging.yourdomain.com
https://yourdomain.com
```

### Custom Button Styling

The Google button styling can be customized via data attributes:

```html
<div class="g_id_signin"
     data-type="standard"          <!-- or "icon" -->
     data-shape="rectangular"       <!-- or "pill", "circle", "square" -->
     data-theme="outline"           <!-- or "filled_blue", "filled_black" -->
     data-text="signin_with"        <!-- or "signup_with", "continue_with", "signin" -->
     data-size="large"              <!-- or "medium", "small" -->
     data-logo_alignment="left">    <!-- or "center" -->
</div>
```

### Popup vs Redirect Mode

Current implementation uses **popup mode** (`data-ux_mode="popup"`).

For redirect mode:
```html
data-ux_mode="redirect"
data-login_uri="https://yourdomain.com/login"
```

## Security Best Practices

1. **Never commit secrets**: Client ID is okay, Client Secret is not
2. **Use HTTPS in production**: Required for production OAuth
3. **Validate tokens server-side**: For production apps, verify JWT on your backend
4. **Limit scopes**: Only request what you need
5. **Regular rotation**: Rotate credentials periodically

## Testing Different Accounts

To test with multiple Google accounts:
1. Add them all as test users in OAuth consent screen
2. Use Chrome incognito or different browsers
3. Or clear browser cookies between tests

## Cost

**Completely free!**
- Google Cloud Platform has a free tier
- OAuth authentication has no costs
- No credit card required for testing

## Support & Resources

- [Google Identity Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth Consent Screen Help](https://support.google.com/cloud/answer/6158849)

## Quick Reference

### Essential URLs
- **Console**: https://console.cloud.google.com/
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent

### File Locations
- `config.js` - Your Client ID configuration
- `index.html` - Main test page
- `SETUP_GUIDE.md` - This guide

### Common Client ID Format
```
[PROJECT_NUMBER]-[RANDOM_STRING].apps.googleusercontent.com
```

Example (fake):
```
123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com
```

---

**Questions?** Open an issue or check the Google Identity documentation linked above.

**Working?** You now have a fully functional OAuth test page! 🎉
