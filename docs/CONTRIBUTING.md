# Contributing Guide

Welcome to Offer Hub! This guide will help you set up the project and understand our contribution workflow.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Repository Setup](#repository-setup)
- [Environment Configuration](#environment-configuration)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Standards](#commit-standards)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Review Process](#code-review-process)
- [Important Rules](#important-rules)

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v23.3.0 or higher
- **npm**: v10 or higher
- **Git**: Latest version
- **Supabase CLI**: For local database development

```bash
# Verify installations
node --version   # Should be v23.3.0+
npm --version    # Should be v10+
git --version
```

## Repository Setup

### 1. Fork the Repository

1. Go to [OFFER-HUB/offer-hub](https://github.com/OFFER-HUB/offer-hub)
2. Click the "Fork" button in the top right corner
3. This creates your own copy of the repository

### 2. Clone Your Fork

```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/offer-hub.git

# Navigate to the project directory
cd offer-hub

# Add the upstream remote (original repository)
git remote add upstream https://github.com/OFFER-HUB/offer-hub.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/offer-hub.git (fetch)
# origin    https://github.com/YOUR_USERNAME/offer-hub.git (push)
# upstream  https://github.com/OFFER-HUB/offer-hub.git (fetch)
# upstream  https://github.com/OFFER-HUB/offer-hub.git (push)
```

### 3. Install Dependencies

```bash
# Install frontend dependencies (root directory)
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 4. Keep Your Fork Updated

```bash
# Fetch updates from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push updates to your fork
git push origin main
```

## Environment Configuration

### Frontend Environment

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend Environment

Create a `.env` file in the `/backend` directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# OAuth (optional for local development)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Local Supabase Setup

For local development with Supabase:

```bash
# Navigate to backend directory
cd backend

# Start Supabase locally
npx supabase start

# Run migrations
npx supabase db reset

# Get local credentials
npx supabase status
```

### Running the Project

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend (from root)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Branch Naming Convention

All branches must follow this naming convention:

```
<type>/<descriptive-name>
```

### Branch Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat/user-profile-page` |
| `fix` | Bug fix | `fix/login-validation-error` |
| `docs` | Documentation changes | `docs/api-documentation` |
| `refactor` | Code refactoring | `refactor/auth-service` |
| `test` | Adding or updating tests | `test/user-service-unit-tests` |
| `chore` | Maintenance tasks | `chore/update-dependencies` |

### Branch Naming Rules

- Use **lowercase** letters only
- Use **hyphens** (`-`) to separate words
- Be **descriptive** but concise
- Include **issue number** if applicable

```bash
# Good examples
feat/password-recovery
fix/oauth-callback-redirect
docs/contributing-guide
feat/issue-123-user-dashboard

# Bad examples
Feature/UserProfile       # Wrong: uppercase, no hyphen
fix_login                 # Wrong: underscore instead of hyphen
newfeature                # Wrong: missing type prefix
feat/a                    # Wrong: not descriptive
```

### Creating a New Branch

```bash
# Always start from an updated main branch
git checkout main
git pull upstream main

# Create and switch to new branch
git checkout -b feat/your-feature-name
```

## Commit Standards

### Atomic Commits

Each commit should represent **one logical change**. This makes it easier to:
- Review changes
- Revert specific changes if needed
- Understand project history

```bash
# Good: Atomic commits
git commit -m "Add login form validation"
git commit -m "Add password strength indicator"
git commit -m "Add form error messages"

# Bad: Multiple unrelated changes in one commit
git commit -m "Add login validation, update styles, fix typo in readme"
```

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

### Commit Message Rules

1. **Use English** for all commit messages
2. **Use imperative mood** ("Add feature" not "Added feature")
3. **Keep subject line under 72 characters**
4. **Do not end subject with a period**
5. **Capitalize the first letter** of the description

```bash
# Good examples
git commit -m "feat(auth): add password recovery flow"
git commit -m "fix(api): resolve null pointer in user service"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(auth): add unit tests for login service"

# Bad examples
git commit -m "fixed stuff"                    # Not descriptive
git commit -m "feat(auth): Added new feature." # Past tense, ends with period
git commit -m "WIP"                            # Not descriptive
```

### Commit Frequently

Make small, frequent commits rather than large commits with many changes:

```bash
# Working on a feature
git commit -m "feat(profile): add profile page skeleton"
git commit -m "feat(profile): implement user data fetching"
git commit -m "feat(profile): add profile edit form"
git commit -m "test(profile): add profile page tests"
```

## Pull Request Guidelines

### Before Creating a PR

1. **Ensure your branch is up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

3. **Review your changes**:
   ```bash
   git diff upstream/main
   ```

### Creating a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

2. Go to GitHub and click "Compare & pull request"

3. Fill in the PR template:

```markdown
## Summary
Brief description of what this PR does.

## Changes
- List of specific changes made
- Another change
- Another change

## Testing
How was this tested?
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] All existing tests pass

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
```

### PR Title Format

Follow the same format as commit messages:

```
feat(auth): add password recovery flow
fix(api): resolve user service null pointer
docs(contributing): add branch naming conventions
```

## Code Review Process

### For Authors

1. **Respond to all comments** - Address or discuss every review comment
2. **Keep PRs focused** - One feature/fix per PR
3. **Update your PR** - Push additional commits to address feedback
4. **Be patient** - Reviews take time

### For Reviewers

1. **Be constructive** - Suggest improvements, don't just criticize
2. **Be specific** - Point to exact lines/files
3. **Approve when ready** - Don't block PRs unnecessarily

## Important Rules

### What You MUST Do

- Write all code, comments, and documentation in **English**
- Follow the [naming conventions](./NAMING_CONVENTIONS.md)
- Follow the [code style guide](./CODE_STYLE.md)
- Follow the [error handling standards](./ERROR_HANDLING.md)
- Make **atomic commits** (one logical change per commit)
- Keep your branch **up to date** with main
- **Test your changes** before creating a PR
- Write **descriptive** commit messages and PR descriptions

### What You MUST NOT Do

- **DO NOT** modify files that are not related to your issue/task
- **DO NOT** add unnecessary refactoring or "improvements"
- **DO NOT** change code formatting (quotes, spacing, indentation) in files you didn't modify
- **DO NOT** remove or add blank lines in unrelated code
- **DO NOT** make changes that don't affect functionality unless explicitly requested
- **DO NOT** commit `.env` files or any secrets
- **DO NOT** commit `node_modules` or build artifacts
- **DO NOT** force push to shared branches

### Code Quality Standards

Your PR will be rejected if it contains:

1. **Unrelated changes** - Changes to files not related to your task
2. **Formatting-only changes** - Changing `"` to `'` or vice versa, adding/removing spaces
3. **Unnecessary refactoring** - Renaming variables, extracting functions without reason
4. **Dead code** - Commented-out code, unused imports, unused variables
5. **Console logs** - Debug statements left in production code

### Example of Clean Changes

```diff
# Good: Only changes what's needed
+ export const validateEmail = (email: string): boolean => {
+   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+   return emailRegex.test(email);
+ };
```

```diff
# Bad: Includes unrelated formatting changes
- import { UserService } from "@/services/user.service";
+ import { UserService } from '@/services/user.service';  // Changed quotes - NOT ALLOWED

  export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
-
  // Removed blank line - NOT ALLOWED
```

## Getting Help

If you have questions:

1. Check existing documentation in `/docs`
2. Search existing issues and PRs
3. Ask in the project's communication channels
4. Create an issue with the `question` label

Thank you for contributing to Offer Hub!
