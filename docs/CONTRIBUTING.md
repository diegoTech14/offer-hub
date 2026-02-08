# Contributing to Offer Hub

Thank you for your interest in contributing to Offer Hub! We welcome contributions from the community and are excited to have you on board.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Questions](#questions)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual orientation.

### Expected Behavior

- Be respectful and considerate
- Use welcoming and inclusive language
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A code editor (we recommend [VS Code](https://code.visualstudio.com/))

### Setting Up Your Development Environment

1. **Fork the repository**

   Click the "Fork" button at the top right of the [repository page](https://github.com/your-username/offer-hub-monorepo).

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/offer-hub-monorepo.git
   cd offer-hub-monorepo
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/original-owner/offer-hub-monorepo.git
   ```

4. **Install frontend dependencies**

   ```bash
   npm install
   ```

5. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

6. **Set up environment variables**

   ```bash
   cp .env.example .env
   cd backend
   cp .env.example .env
   cd ..
   ```

7. **Start the development servers**

   Terminal 1 (Frontend):
   ```bash
   npm run dev
   ```

   Terminal 2 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

8. **Verify everything works**

   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

## 🔄 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/feature-name` - For new features
- `fix/bug-description` - For bug fixes
- `chore/task-description` - For maintenance tasks
- `docs/documentation-update` - For documentation changes

### 2. Make Your Changes

- Write clean, readable code
- Follow our [coding standards](./docs/standards/code-style.md)
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Frontend
npm run lint          # Check for linting errors
npm run build         # Ensure build works

# Backend
cd backend
npm run lint          # Check for linting errors (when set up)
npm run build         # Ensure build works
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines) for commit messages.

```bash
git add .
git commit -m "feat: add offer comparison feature"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Submit the pull request

## 💻 Coding Standards

### TypeScript

- **Strict mode**: Always use TypeScript strict mode
- **No `any`**: Avoid using `any` type; use proper types or `unknown`
- **Explicit types**: Define explicit return types for functions
- **Interfaces**: Use interfaces for object shapes

```typescript
// ✅ Good
interface UserOffer {
  id: string;
  title: string;
  salary: number;
}

function getOffer(id: string): Promise<UserOffer> {
  // Implementation
}

// ❌ Bad
function getOffer(id) {
  // Implementation
}
```

### React/Next.js

- **Server Components by default**: Use Server Components unless you need interactivity
- **"use client" directive**: Only add when needed (state, effects, browser APIs)
- **TypeScript props**: Always type component props
- **Semantic HTML**: Use semantic HTML elements

```typescript
// ✅ Good - Server Component
export default function OfferList() {
  return <div>...</div>;
}

// ✅ Good - Client Component (when needed)
"use client";

import { useState } from "react";

export default function InteractiveOffer() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Naming Conventions

- **Files (Components)**: `PascalCase.tsx` (e.g., `OfferCard.tsx`)
- **Files (Utilities)**: `kebab-case.ts` (e.g., `format-currency.ts`)
- **Variables/Functions**: `camelCase` (e.g., `getUserOffer`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_OFFERS`)
- **Types/Interfaces**: `PascalCase` (e.g., `OfferData`)

### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import { useState } from "react";              // External
import { Button } from "@/components/ui";      // Internal
import type { Offer } from "@/types/offer";    // Types

// 2. Types/Interfaces
interface Props {
  offerId: string;
}

// 3. Constants
const MAX_OFFERS = 100;

// 4. Component/Function
export function OfferComponent({ offerId }: Props) {
  // Implementation
}
```

### Styling

- **Tailwind CSS**: Use Tailwind utility classes
- **Mobile-first**: Design for mobile, enhance for desktop
- **Responsive**: Use responsive breakpoints (`sm:`, `md:`, `lg:`)

```tsx
// ✅ Good - Mobile-first responsive
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// ❌ Bad
<div className="text-lg md:text-base sm:text-sm">
  Not mobile-first
</div>
```

For complete coding standards, see [docs/standards/code-style.md](./docs/standards/code-style.md).

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no functional change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config)

### Examples

```bash
# Simple feature
git commit -m "feat: add offer comparison table"

# Bug fix with description
git commit -m "fix: resolve currency formatting issue

The currency formatter was not handling EUR correctly.
Updated the formatter to support multiple currencies."

# Breaking change
git commit -m "feat!: change API response format

BREAKING CHANGE: The API now returns offers in a nested structure.
Clients will need to update their response handling."
```

### Best Practices

- **Present tense**: Use "add" not "added"
- **Imperative mood**: Use "change" not "changes"
- **Lowercase subject**: Start with lowercase letter
- **No period**: Don't end subject with a period
- **Descriptive**: Be specific about what changed
- **Reference issues**: Include issue numbers when applicable

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows our coding standards
- [ ] TypeScript compiles with no errors
- [ ] Linter passes with no warnings
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions

### PR Template

When you create a PR, please fill out this template:

```markdown
## Description
[Describe what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Closes #[issue-number]

## Testing
[Describe how you tested this]

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated checks**: CI will run automated tests and linting
2. **Code review**: Maintainers will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, maintainers will merge

### After Your PR is Merged

1. **Delete your branch**:
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update your main branch**:
   ```bash
   git checkout main
   git pull upstream main
   ```

## 🐛 Reporting Bugs

### Before Reporting

- Search [existing issues](https://github.com/your-username/offer-hub-monorepo/issues) to see if the bug is already reported
- Try to reproduce the bug with the latest version
- Collect relevant information (browser, OS, error messages)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g., macOS, Windows, Linux]
 - Browser: [e.g., Chrome, Firefox]
 - Version: [e.g., 0.1.0]

**Additional context**
Any other relevant information.
```

## ✨ Requesting Features

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other context, mockups, or examples.
```

## ❓ Questions

If you have questions about contributing:

1. **Check the documentation**: [docs/](./docs/)
2. **Search existing issues**: Maybe someone already asked
3. **Create a discussion**: Use [GitHub Discussions](https://github.com/your-username/offer-hub-monorepo/discussions)
4. **Contact maintainers**: Reach out to [@Josue19-08](https://github.com/Josue19-08) or [@KevinMB0220](https://github.com/KevinMB0220)

## 🎉 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributors page (when created)

Thank you for contributing to Offer Hub! 🚀

---

**Last Updated**: February 2026
**Maintained By**: [@Josue19-08](https://github.com/Josue19-08), [@KevinMB0220](https://github.com/KevinMB0220)
