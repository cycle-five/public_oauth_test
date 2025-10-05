#!/usr/bin/env python3
"""
Google OAuth login automation for scrapling.

This module provides functions to automate logging in via Google OAuth.

There's some stuff broken.
"""

from playwright.sync_api import Page, Locator
from scrapling.fetchers import StealthySession
from scrapling.cli import log
from argparse import ArgumentParser
import time

from scrapling_pick import get_credentials

google_button_selectors = [
    "#g_id_signin_container",
    "#g_id_onload",
    "#google-signin-btn",
    "button:has-text('Google')",
    "div[data-test='Login with Google']",
]


def is_iframe(loc: Locator) -> bool:
    """Check if the URL is an iframe URL."""
    return loc.get_attribute("src").startswith("https://accounts.google.com")


def find_google_buttons_in_iframe(page: Page) -> list[Locator]:
    """Check if a Google button is inside an iframe."""
    google_buttons = []
    iframes = page.frames
    for frame in iframes:
        try:
            for locator in google_button_selectors:
                button = frame.locator(locator)
                if button.count() > 0:
                    log.info("Found Google button inside iframe: %s", frame.url)
                    google_buttons.append(button)
        except Exception:
            continue
    return google_buttons


def find_google_buttons(page: Page) -> list[Locator]:
    """Find Google OAuth buttons on the page."""
    google_buttons = []
    for selector in google_button_selectors:
        try:
            google_btn = page.locator(selector)
            if google_btn.count() > 1:
                button = google_btn.first
            else:
                button = google_btn
            if button.is_visible(timeout=1000):
                log.info("Found Google button with selector: %s", selector)
                google_buttons.append(button)
            else:
                log.debug("Selector '%s' found but not visible", selector)
                continue
        except Exception as e:
            log.debug("Selector '%s' did not work: %s", selector, e)
            continue
    return google_buttons


def handle_security_key(page: Page):
    """
    Handle hardware security key (YubiKey, etc.) authentication.
    Prompts user to insert and press their physical security key.

    Args:
        page: Playwright Page object (could be main page or popup)
    """
    try:
        log.info("=" * 60)
        log.info("🔑 HARDWARE SECURITY KEY REQUIRED")
        log.info("=" * 60)
        log.info("Please INSERT your hardware security key (YubiKey, etc.)")
        log.info("and PRESS THE BUTTON on the device.")
        log.info("The script will automatically continue after authentication...")
        log.info("=" * 60)

        # Common security key page indicators
        security_key_indicators = [
            "text=Complete sign-in using your passkey",
            "text=Verifying it's you",
            'div:has-text("Complete sign-in using your passkey")',
            'div:has-text("passkey")',
            "[data-authuser]",  # Google auth page
        ]

        # Check if we're on a security key page
        on_security_key_page = False
        for selector in security_key_indicators:
            try:
                if page.locator(selector).is_visible(timeout=2000):
                    on_security_key_page = True
                    log.info(format("Detected security key prompt: %s", selector))
                    break
            except Exception as _:
                continue

        if not on_security_key_page:
            log.warning("No security key page detected, but wait_for_security_key was True")
            log.info("Waiting 5 seconds in case security key page is loading...")
            page.wait_for_timeout(5000)
            log.info("Continuing...")

        # Wait for navigation after user presses the security key
        try:
            log.info("Waiting for you to press your security key...")

            # Get current URL to detect change
            current_url = page.url

            # Wait for either navigation or URL change (max 120 seconds)
            timeout = 120000  # 2 minutes
            start_time = time.time()

            while (time.time() - start_time) * 1000 < timeout:
                page.wait_for_timeout(500)  # Check every 500ms

                # Check if URL changed (navigation happened)
                if page.url != current_url:
                    log.info("✓ Page navigation detected - security key accepted!")
                    break

                # Check if we're no longer on a security key page
                still_on_key_page = False
                for selector in security_key_indicators:
                    try:
                        if page.locator(selector).is_visible(timeout=500):
                            still_on_key_page = True
                            break
                    except Exception as _:
                        continue

                if not still_on_key_page and on_security_key_page:
                    log.info("✓ Security key page cleared - authentication successful!")
                    break

            # Final wait for network to settle
            page.wait_for_load_state("networkidle", timeout=10000)
            log.info("✓ Security key authentication completed successfully!")

        except Exception as e:
            log.error(format("Error waiting for security key: %s", str(e)))
            # Continue anyway, user might have completed it

    except Exception as e:
        log.error(format("Error in security key handling: %s", str(e)))
        import traceback

        traceback.print_exc()


def handle_2fa_auth_key(page: Page):
    """
    Handle 2FA/Auth Key input by waiting for user to manually enter code.

    Args:
        page: Playwright Page object (could be main page or popup)
    """
    try:
        log.info("=" * 60)
        log.info("🔐 2FA/AUTH KEY REQUIRED")
        log.info("=" * 60)
        log.info("Please enter your authentication code in the browser window")
        log.info("and click the Submit/Next button.")
        log.info("The script will automatically continue after you submit...")
        log.info("=" * 60)

        # Common 2FA page indicators
        auth_indicators = [
            'input[name="totpPin"]',  # Google Authenticator
            'input[type="tel"]',  # Phone code
            'input[aria-label*="code"]',
            'input[placeholder*="code"]',
            'input[placeholder*="Code"]',
            "#totpPin",
            'input[name="pin"]',
        ]

        # Check if we're on a 2FA page
        on_2fa_page = False
        for selector in auth_indicators:
            try:
                if page.locator(selector).is_visible(timeout=2000):
                    on_2fa_page = True
                    log.info(f"Detected 2FA input field: {selector}")
                    break
            except Exception as _:
                continue

        if not on_2fa_page:
            log.warning("No 2FA page detected, but wait_for_2fa was True")
            log.info("Waiting 5 seconds in case 2FA page is loading...")
            page.wait_for_timeout(5000)

        # Wait for navigation after user submits the code
        # This will wait until the page URL changes or navigates
        try:
            log.info("Waiting for you to submit the auth code...")

            # Get current URL to detect change
            current_url = page.url

            # Wait for either navigation or URL change (max 120 seconds)
            timeout = 120000  # 2 minutes
            start_time = time.time()

            while (time.time() - start_time) * 1000 < timeout:
                page.wait_for_timeout(500)  # Check every 500ms

                # Check if URL changed (navigation happened)
                if page.url != current_url:
                    log.info("✓ Page navigation detected - auth code submitted!")
                    break

                # Check if we're no longer on a 2FA page
                still_on_2fa = False
                for selector in auth_indicators:
                    try:
                        if page.locator(selector).is_visible(timeout=500):
                            still_on_2fa = True
                            break
                    except:
                        continue

                if not still_on_2fa and on_2fa_page:
                    log.info("✓ 2FA page cleared - authentication successful!")
                    break

            # Final wait for network to settle
            page.wait_for_load_state("networkidle", timeout=10000)
            log.info("✓ Authentication completed successfully!")

        except Exception as e:
            log.error(format("Error waiting for 2FA submission: %s", e))
            # Continue anyway, user might have completed it

    except Exception as e:
        log.error("Error in 2FA handling: %s", str(e))
        import traceback

        traceback.print_exc()


def handle_google_login(
    page: Page, email: str, password: str, wait_for_2fa: bool = False, wait_for_security_key: bool = False
):
    """
    Handle the Google login flow after clicking the OAuth button.

    Args:
        page: Playwright Page object
        email: Google account email
        password: Google account password
        wait_for_2fa: If True, wait for manual 2FA completion
        wait_for_security_key: If True, wait for manual security key completion
    """
    try:
        # Wait for Google login page to load
        log.info("Waiting for Google login page...")
        page.wait_for_load_state("domcontentloaded", timeout=10000)

        # Handle potential popup - get the popup page if it opens
        context = page.context
        popup_page = None

        # Check if login opened in popup
        if len(context.pages) > 1:
            popup_page = context.pages[-1]
            log.info("Google login opened in popup window")
            login_page = popup_page
        else:
            login_page = page
            log.info("Google login in same window")

        # Enter email
        log.info("Entering email...")
        email_selectors = [
            'input[type="email"]',
            'input[name="identifier"]',
            "#identifierId",
        ]

        email_input = None
        for selector in email_selectors:
            try:
                email_input = login_page.locator(selector)
                if email_input.is_visible(timeout=2000):
                    break
            except:
                continue

        if email_input and email_input.is_visible():
            email_input.fill(email)
            log.info("Email entered successfully")
        else:
            log.error("Could not find email input field")
            return

        # Click Next button
        log.info("Clicking Next after email...")
        next_button_selectors = [
            'button:has-text("Next")',
            "#identifierNext",
            'button[type="button"]',
        ]

        for selector in next_button_selectors:
            try:
                next_btn = login_page.locator(selector)
                if next_btn.is_visible(timeout=2000):
                    next_btn.click()
                    log.info("Clicked Next button")
                    break
            except:
                continue

        # Wait for password page
        login_page.wait_for_load_state("domcontentloaded", timeout=10000)
        time.sleep(1)  # Small delay for page transition

        # Enter password
        log.info("Entering password...")
        password_selectors = [
            'input[type="password"]',
            'input[name="password"]',
            "#password input",
        ]

        if not wait_for_2fa and not wait_for_security_key:
            # If not waiting for 2FA or security key, ensure password field is present
            password_input = None
            for selector in password_selectors:
                try:
                    password_input = login_page.locator(selector)
                    if password_input.is_visible(timeout=2000):
                        break
                except:
                    continue

            if password_input and password_input.is_visible():
                password_input.fill(password)
                log.info("Password entered successfully")
            else:
                log.error("Could not find password input field")
                return

            # Click Next/Sign in button
            log.info("Clicking Next after password...")
            for selector in next_button_selectors:
                try:
                    next_btn = login_page.locator(selector)
                    if next_btn.is_visible(timeout=2000):
                        next_btn.click()
                        log.info("Clicked sign-in button")
                        break
                except:
                    continue

        # Handle 2FA/Auth Key or Security Key if needed
        if wait_for_security_key:
            handle_security_key(login_page)
        elif wait_for_2fa:
            handle_2fa_auth_key(login_page)
        else:
            # Wait for redirect
            log.info("Waiting for authentication to complete...")
            login_page.wait_for_load_state("networkidle", timeout=15000)

        # If popup was used, wait for it to close
        if popup_page:
            try:
                popup_page.wait_for_event("close", timeout=10000)
                log.info("Popup closed, returning to main page")
            except Exception as _:
                log.warning("Popup did not close automatically")

        log.info("Google OAuth login completed successfully!")

    except Exception as e:
        log.error("Error during Google login: %s", e)
        import traceback

        traceback.print_exc()
        raise


def google_oauth_login_action(
    email: str, password: str, wait_for_2fa: bool = False, wait_for_security_key: bool = False
) -> callable:
    """
    Create a page action that handles complete Google OAuth login.

    Args:
        email: Google account email
        password: Google account password
        wait_for_2fa: If True, prompts user to manually enter 2FA/auth code and
                      waits for page transition after submission (up to 2 minutes)
        wait_for_security_key: If True, prompts user to insert and press hardware
                               security key (YubiKey, etc.) and waits for page transition

    Returns:
        Callable[[Page], None]: Function that performs Google OAuth login.
    """

    def login_with_google(page: Page):
        log.info("Starting Google OAuth login automation...")

        # Wait for page to load
        page.wait_for_load_state("domcontentloaded", timeout=5000)

        # Find and click Google button
        buttons = find_google_buttons(page)

        if not buttons:
            # Try checking iframes
            buttons = find_google_buttons_in_iframe(page)

        if not buttons:
            log.error("Could not find Google sign-in button")
            return

        # Click the first visible button
        for button in buttons:
            try:
                log.info("Clicking Google OAuth button...")

                # Listen for popup
                with page.context.expect_page() as _:
                    button.click(timeout=5000)

                # Small delay to let popup/redirect happen
                page.wait_for_timeout(2000)

                # Handle the login flow
                handle_google_login(page, email, password, wait_for_2fa, wait_for_security_key)
                break

            except Exception as e:
                log.error(format("Failed to complete login flow: %s", e))
                continue

        # Wait a bit to ensure login is complete
        page.wait_for_timeout(3000)

    return login_with_google


def main(url: str, use_2fa: bool = False, use_security_key: bool = False):
    """Run the test."""
    log.info("Starting Google OAuth login test...")

    # Replace with your actual credentials
    GOOGLE_EMAIL, GOOGLE_PASSWORD = get_credentials("https://google.com")

    test_url = url

    with StealthySession(
        headless=False,  # Keep visible so you can see what happens
        humanize=True,
        load_dom=True,
    ) as session:
        try:
            log.info("Navigating to test page: %s", test_url)
            response = session.fetch(
                test_url,
                page_action=google_oauth_login_action(
                    email=GOOGLE_EMAIL,
                    password=GOOGLE_PASSWORD,
                    wait_for_2fa=use_2fa,  # For TOTP/SMS codes
                    wait_for_security_key=use_security_key,  # For YubiKey/hardware keys
                ),
                wait=5000,
            )

            log.info("Login test completed!")
            log.info("Response status: %s", response.status)

        except Exception as e:
            log.error("Test failed: %s", e)
            import traceback

            traceback.print_exc()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--url", help="url to test", default="https://public-oauth-test.loth.one/")
    group = parser.add_mutually_exclusive_group(
        required=False,
    )
    group.add_argument(
        "--use-2fa",
        action="store_true",
        help="wait for manual 2FA/auth key input after password (up to 2 minutes)",
    )
    group.add_argument(
        "--use-security-key",
        action="store_true",
        help="wait for manual hardware security key (YubiKey, etc.) input after password (up to 2 minutes)",
    )

    args = parser.parse_args()
    main(args.url, args.use_2fa, args.use_security_key)
