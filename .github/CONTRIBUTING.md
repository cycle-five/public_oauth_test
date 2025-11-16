# Contributing to OAuth Test Page

Thank you for considering contributing to this project! This guide will help you get started.

## Quick Start for Contributors

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/public_oauth_test.git
cd public_oauth_test
```

### 2. Set Up Development Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Configure credentials (for local testing)
cp .env.example .env
# Edit .env and add your test Google credentials
```

### 3. Make Your Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests locally
./run_tests.sh unit
./run_tests.sh headless
```

### 4. Submit Pull Request

```bash
# Commit your changes
git add .
git commit -m "Description of your changes"

# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Development Workflow

### Running Tests Locally

Before submitting a PR, run these tests:

```bash
# Required: Unit tests must pass
./run_tests.sh unit

# Recommended: Run in headless mode
./run_tests.sh headless

# Optional: Check code style
flake8 . --max-line-length=120
black --check .
isort --check .
```

### Code Quality Standards

This project follows these standards:

1. **Code Style**
   - PEP 8 compliance (with max line length 120)
   - Use `black` for formatting (run `black .` to auto-format)
   - Use `isort` for import sorting

2. **Testing**
   - All new features must have tests
   - Unit tests for core functionality
   - Integration tests for OAuth flows (optional)
   - Maintain or improve code coverage

3. **Documentation**
   - Add docstrings to new functions
   - Update relevant .md files
   - Include inline comments for complex logic

4. **Security**
   - Never commit credentials
   - Use environment variables for sensitive data
   - Follow secure coding practices

### CI/CD Checks

When you submit a PR, GitHub Actions will automatically run:

✅ **Required Checks** (must pass):
- Unit tests
- Syntax validation
- Import checks
- Code coverage collection

⚠️ **Optional Checks** (informational):
- Code linting (flake8, black, isort)
- OAuth integration tests (if secrets configured)

**Note:** OAuth tests may be skipped if repository secrets are not configured. This is fine for most contributions!

## Types of Contributions

### Bug Fixes

1. Create an issue describing the bug
2. Reference the issue in your PR
3. Include a test that reproduces the bug
4. Ensure all tests pass

### New Features

1. Discuss the feature in an issue first
2. Ensure backward compatibility
3. Add comprehensive tests
4. Update documentation
5. Add examples if applicable

### Documentation

1. Fix typos, improve clarity
2. Add examples and use cases
3. Update outdated information
4. No tests required for docs-only changes

### Test Improvements

1. Increase test coverage
2. Add edge case tests
3. Improve test reliability
4. Update test documentation

## Pull Request Guidelines

### PR Title Format

Use clear, descriptive titles:
- ✅ `Add support for Facebook OAuth`
- ✅ `Fix button detection in iframes`
- ✅ `Update dependencies to latest versions`
- ❌ `Update`
- ❌ `Fix bug`

### PR Description

Include:
- **What**: What changes are you making?
- **Why**: Why are these changes needed?
- **How**: How did you implement the changes?
- **Testing**: What tests did you add/update?
- **Screenshots**: If UI changes, add before/after screenshots

Example:
```markdown
## What
Add support for detecting OAuth buttons in shadow DOM

## Why
Some modern web apps use shadow DOM for OAuth buttons, which our current selectors can't detect.

## How
- Added shadow DOM traversal in `find_google_buttons()`
- Updated selectors to pierce shadow DOM
- Added fallback for browsers without shadow DOM support

## Testing
- Added unit tests for shadow DOM detection
- Tested manually on [example site]
- All existing tests still pass

## Breaking Changes
None - backward compatible
```

### Review Process

1. **Automated Checks**: CI/CD runs automatically
2. **Code Review**: Maintainer reviews your code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves changes
5. **Merge**: Your PR is merged!

## Common Scenarios

### Adding a New Test

```python
# In test_oauth_automated.py

class TestNewFeature:
    """Test new feature functionality."""

    def test_new_feature(self):
        """Test that new feature works correctly."""
        # Your test code here
        assert expected == actual
```

Run locally:
```bash
pytest test_oauth_automated.py::TestNewFeature -v
```

### Updating Dependencies

```bash
# Update requirements.txt
pip install --upgrade package-name
pip freeze > requirements.txt

# Test that everything still works
./run_tests.sh unit
```

### Fixing a Bug

1. Add a test that reproduces the bug
2. Verify test fails
3. Fix the bug
4. Verify test passes
5. Ensure all other tests still pass

## Environment Variables for Testing

For local development, you may need these:

```bash
# Required for OAuth tests
export GOOGLE_EMAIL="test@example.com"
export GOOGLE_PASSWORD="test-password"

# Optional
export HEADLESS=true
export TEST_URL="https://public-oauth-test.netlify.app/"
export DEBUG=true
```

## Debugging Failed CI/CD Runs

If CI/CD fails on your PR:

1. **Check the Logs**
   - Click on the failed check
   - Read the error message
   - Look for the specific test that failed

2. **Reproduce Locally**
   ```bash
   # Run the same test that failed
   pytest test_oauth_automated.py::TestName::test_method -v
   ```

3. **Common Issues**
   - **Import errors**: Check dependencies in requirements.txt
   - **Syntax errors**: Run `python -m py_compile your_file.py`
   - **Test failures**: Check test assertions and logic
   - **Linting warnings**: Run `flake8` and `black --check`

4. **Fix and Push**
   ```bash
   # Fix the issue
   git add .
   git commit -m "Fix CI/CD issue"
   git push origin your-branch-name
   ```

CI/CD will automatically re-run on new pushes.

## Security Considerations

### Never Commit:
- ❌ `.env` files
- ❌ Actual credentials
- ❌ API keys or tokens
- ❌ Personal information

### Always:
- ✅ Use environment variables
- ✅ Add sensitive files to `.gitignore`
- ✅ Use dedicated test accounts
- ✅ Review your changes before committing

### Check Before Committing:
```bash
# See what you're committing
git diff

# Make sure .env is not staged
git status | grep .env
# Should show nothing or "Untracked"
```

## Getting Help

- **Questions**: Open a GitHub issue
- **Bugs**: Open a GitHub issue with reproduction steps
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check TESTING.md, README.md, and workflow README

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- No harassment or discrimination

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes (for significant contributions)
- README (for major features)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

## Checklist for Contributors

Before submitting your PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New code has tests
- [ ] Documentation updated (if needed)
- [ ] No credentials in commits
- [ ] PR description is clear and complete
- [ ] Branch is up to date with main
- [ ] Commit messages are descriptive

Thank you for contributing! 🎉
