#!/usr/bin/env python3
"""
Credential management for OAuth testing.

This module provides secure credential retrieval from environment variables
or a .env file.
"""

import os
from typing import Tuple
from pathlib import Path


def get_credentials(service_url: str) -> Tuple[str, str]:
    """
    Retrieve credentials for a given service URL.

    For security, credentials are loaded from environment variables:
    - GOOGLE_EMAIL: Your Google account email
    - GOOGLE_PASSWORD: Your Google account password

    Alternatively, credentials can be loaded from a .env file in the project root.

    Args:
        service_url: The service URL (e.g., "https://google.com")
                    This parameter allows for future expansion to support
                    multiple services.

    Returns:
        Tuple[str, str]: A tuple of (email, password)

    Raises:
        ValueError: If credentials are not found in environment variables or .env file

    Example:
        >>> email, password = get_credentials("https://google.com")
    """
    # Try to load from .env file if it exists
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
        except ImportError:
            # python-dotenv not installed, continue with environment variables only
            pass

    # Get credentials from environment variables
    email = os.getenv("GOOGLE_EMAIL")
    password = os.getenv("GOOGLE_PASSWORD")

    # Validate that credentials exist
    if not email or not password:
        raise ValueError(
            "Google credentials not found!\n"
            "Please set the following environment variables:\n"
            "  - GOOGLE_EMAIL: Your Google account email\n"
            "  - GOOGLE_PASSWORD: Your Google account password\n\n"
            "You can set them in your shell:\n"
            "  export GOOGLE_EMAIL='your-email@gmail.com'\n"
            "  export GOOGLE_PASSWORD='your-password'\n\n"
            "Or create a .env file in the project root:\n"
            "  GOOGLE_EMAIL=your-email@gmail.com\n"
            "  GOOGLE_PASSWORD=your-password\n"
        )

    return email, password


def set_credentials_for_testing(email: str, password: str) -> None:
    """
    Set credentials for testing purposes.

    This function sets environment variables for the current process.
    Useful for testing or when you want to set credentials programmatically.

    Args:
        email: Google account email
        password: Google account password

    Example:
        >>> set_credentials_for_testing("test@gmail.com", "test-password")
    """
    os.environ["GOOGLE_EMAIL"] = email
    os.environ["GOOGLE_PASSWORD"] = password
