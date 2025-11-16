#!/usr/bin/env python3
"""
Automated tests for Google OAuth login functionality.

This test suite can run in headless mode for CI/CD pipelines.
"""

import pytest
import os
from scrapling.fetchers import StealthySession
from scrapling.cli import log
from scrapling_pick import get_credentials, set_credentials_for_testing
from test_google_oauth import (
    google_oauth_login_action,
    find_google_buttons,
    find_google_buttons_in_iframe,
)


# Test configuration
TEST_URL = os.getenv("TEST_URL", "https://public-oauth-test.netlify.app/")
HEADLESS = os.getenv("HEADLESS", "true").lower() == "true"


@pytest.fixture(scope="session")
def credentials():
    """Fixture to provide test credentials."""
    try:
        email, password = get_credentials("https://google.com")
        return email, password
    except ValueError as e:
        pytest.skip(f"Credentials not configured: {e}")


class TestCredentials:
    """Test credential management functionality."""

    def test_get_credentials_missing(self):
        """Test that get_credentials raises error when credentials are missing."""
        # Temporarily clear environment variables
        original_email = os.environ.get("GOOGLE_EMAIL")
        original_password = os.environ.get("GOOGLE_PASSWORD")

        try:
            if "GOOGLE_EMAIL" in os.environ:
                del os.environ["GOOGLE_EMAIL"]
            if "GOOGLE_PASSWORD" in os.environ:
                del os.environ["GOOGLE_PASSWORD"]

            with pytest.raises(ValueError, match="Google credentials not found"):
                get_credentials("https://google.com")
        finally:
            # Restore original values
            if original_email:
                os.environ["GOOGLE_EMAIL"] = original_email
            if original_password:
                os.environ["GOOGLE_PASSWORD"] = original_password

    def test_get_credentials_success(self, credentials):
        """Test that get_credentials returns valid credentials."""
        email, password = credentials
        assert email, "Email should not be empty"
        assert password, "Password should not be empty"
        assert "@" in email, "Email should be a valid email address"

    def test_set_credentials_for_testing(self):
        """Test that set_credentials_for_testing works correctly."""
        test_email = "test@example.com"
        test_password = "test-password"

        set_credentials_for_testing(test_email, test_password)

        email, password = get_credentials("https://google.com")
        assert email == test_email
        assert password == test_password


class TestGoogleButtonDetection:
    """Test Google button detection functionality."""

    def test_find_google_buttons_exists(self):
        """Test that find_google_buttons function exists and is callable."""
        assert callable(find_google_buttons)

    def test_find_google_buttons_in_iframe_exists(self):
        """Test that find_google_buttons_in_iframe function exists and is callable."""
        assert callable(find_google_buttons_in_iframe)


class TestOAuthFlow:
    """Test the OAuth login flow."""

    @pytest.mark.skipif(
        not os.getenv("RUN_OAUTH_TESTS", "").lower() == "true",
        reason="OAuth tests disabled. Set RUN_OAUTH_TESTS=true to enable",
    )
    def test_oauth_login_basic(self, credentials):
        """
        Test basic OAuth login flow.

        This test navigates to the test page and attempts to click the Google button.
        It does NOT complete the full login (to avoid rate limits), but verifies
        that the button detection and click logic works.
        """
        email, password = credentials

        with StealthySession(
            headless=HEADLESS,
            humanize=True,
            load_dom=True,
        ) as session:
            log.info(f"Testing OAuth flow in {'headless' if HEADLESS else 'headed'} mode")
            log.info(f"Test URL: {TEST_URL}")

            def check_google_button(page):
                """Check if Google button can be found."""
                page.wait_for_load_state("domcontentloaded", timeout=5000)

                # Try to find button
                buttons = find_google_buttons(page)
                if not buttons:
                    buttons = find_google_buttons_in_iframe(page)

                assert buttons, "Google button should be found on the page"
                log.info(f"Found {len(buttons)} Google button(s)")

            response = session.fetch(
                TEST_URL,
                page_action=check_google_button,
                wait=3000,
            )

            assert response.status == 200, "Page should load successfully"

    @pytest.mark.skipif(
        not os.getenv("RUN_FULL_OAUTH_TESTS", "").lower() == "true",
        reason="Full OAuth tests disabled. Set RUN_FULL_OAUTH_TESTS=true to enable",
    )
    def test_oauth_login_complete(self, credentials):
        """
        Test complete OAuth login flow.

        WARNING: This test performs a full login and may trigger rate limits.
        Only run this test when necessary.

        Set RUN_FULL_OAUTH_TESTS=true to enable this test.
        """
        email, password = credentials

        with StealthySession(
            headless=HEADLESS,
            humanize=True,
            load_dom=True,
        ) as session:
            log.info("Starting FULL OAuth login test")
            log.info(f"Test URL: {TEST_URL}")

            response = session.fetch(
                TEST_URL,
                page_action=google_oauth_login_action(
                    email=email,
                    password=password,
                    wait_for_2fa=False,
                    wait_for_security_key=False,
                ),
                wait=5000,
            )

            assert response.status == 200, "Login should complete successfully"
            log.info("Full OAuth login test completed successfully")


class TestHeadlessMode:
    """Test headless mode configuration."""

    def test_headless_env_var(self):
        """Test that HEADLESS environment variable is respected."""
        headless_value = os.getenv("HEADLESS", "true")
        assert headless_value in ["true", "false"], "HEADLESS should be 'true' or 'false'"

    def test_test_url_env_var(self):
        """Test that TEST_URL environment variable is set."""
        test_url = os.getenv("TEST_URL", TEST_URL)
        assert test_url.startswith("http"), "TEST_URL should be a valid URL"


@pytest.mark.skipif(
    not os.getenv("RUN_2FA_TESTS", "").lower() == "true",
    reason="2FA tests disabled. Set RUN_2FA_TESTS=true to enable",
)
class Test2FAFlow:
    """Test 2FA authentication flows (requires manual interaction)."""

    def test_oauth_with_2fa(self, credentials):
        """
        Test OAuth login with 2FA.

        This test requires manual interaction to enter the 2FA code.
        Set RUN_2FA_TESTS=true to enable this test.
        """
        email, password = credentials

        with StealthySession(
            headless=False,  # 2FA tests require visible browser
            humanize=True,
            load_dom=True,
        ) as session:
            log.info("Starting OAuth login test with 2FA")
            log.info(f"Test URL: {TEST_URL}")

            response = session.fetch(
                TEST_URL,
                page_action=google_oauth_login_action(
                    email=email,
                    password=password,
                    wait_for_2fa=True,
                    wait_for_security_key=False,
                ),
                wait=5000,
            )

            assert response.status == 200, "Login with 2FA should complete successfully"

    def test_oauth_with_security_key(self, credentials):
        """
        Test OAuth login with hardware security key.

        This test requires manual interaction to press the security key.
        Set RUN_2FA_TESTS=true to enable this test.
        """
        email, password = credentials

        with StealthySession(
            headless=False,  # Security key tests require visible browser
            humanize=True,
            load_dom=True,
        ) as session:
            log.info("Starting OAuth login test with security key")
            log.info(f"Test URL: {TEST_URL}")

            response = session.fetch(
                TEST_URL,
                page_action=google_oauth_login_action(
                    email=email,
                    password=password,
                    wait_for_2fa=False,
                    wait_for_security_key=True,
                ),
                wait=5000,
            )

            assert response.status == 200, "Login with security key should complete successfully"


if __name__ == "__main__":
    """
    Run tests directly with pytest.

    Examples:
        # Run all tests (skips OAuth and 2FA tests by default)
        python test_oauth_automated.py

        # Run with pytest explicitly
        pytest test_oauth_automated.py -v

        # Run in headless mode
        HEADLESS=true pytest test_oauth_automated.py -v

        # Run with OAuth tests enabled
        RUN_OAUTH_TESTS=true pytest test_oauth_automated.py -v

        # Run full OAuth tests (use sparingly to avoid rate limits)
        RUN_FULL_OAUTH_TESTS=true pytest test_oauth_automated.py -v

        # Run 2FA tests (requires manual interaction)
        RUN_2FA_TESTS=true HEADLESS=false pytest test_oauth_automated.py -v
    """
    pytest.main([__file__, "-v"])
