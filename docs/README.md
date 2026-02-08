# Offer Hub

> A modern full-stack platform for managing job offers, salary negotiations, and career opportunities.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend Development
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

API runs on [http://localhost:4000](http://localhost:4000)

## 📖 What is Offer Hub?

Offer Hub is a comprehensive platform designed to help professionals manage their job offers, track salary negotiations, and make informed career decisions. Whether you're a job seeker comparing multiple offers or a professional planning your next career move, Offer Hub provides the tools and insights you need.

### Key Problems We Solve
- **Offer Comparison**: Difficulty comparing multiple job offers with different compensation structures
- **Salary Tracking**: No centralized place to track offer history and negotiations
- **Decision Making**: Lack of data-driven insights when choosing between opportunities
- **Career Planning**: Limited visibility into career progression and compensation trends

## ✨ Key Features

- **Offer Management**: Create, edit, and organize job offers in one place
- **Comparison Tools**: Side-by-side comparison of offers with customizable criteria
- **Negotiation Tracking**: Track negotiation history and outcomes
- **Analytics Dashboard**: Visualize your offers and compensation trends
- **Secure & Private**: Your data is encrypted and private

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router with React Server Components)
- **Language**: TypeScript 5.7+
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4+
- **Linting**: ESLint 9

### Backend
- **Runtime**: Node.js 22+
- **Framework**: Express 5
- **Language**: TypeScript 5.7+
- **CORS**: Configured for cross-origin requests
- **Development**: tsx (TypeScript execution)

### Infrastructure
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Development**: Local development with hot reload

## 📁 Project Structure

```
offer-hub-monorepo/
├── src/                    # Frontend source code
│   └── app/                # Next.js App Router pages
│       ├── layout.tsx      # Root layout
│       └── page.tsx        # Home page
├── backend/                # Backend source code
│   └── src/
│       └── index.ts        # Express server entry point
├── docs/                   # Project documentation
│   ├── architecture/       # Technical architecture docs
│   ├── context/            # Business context and domain
│   ├── standards/          # Coding standards and best practices
│   ├── backend/            # Backend-specific documentation
│   └── frontend/           # Frontend-specific documentation
├── public/                 # Static assets
├── DESIGN_SYSTEM_PROMPT.md # Design system guidelines
├── package.json            # Frontend dependencies
└── README.md               # This file
```

See [folder-structure.md](./architecture/folder-structure.md) for detailed breakdown.

## 🧭 Documentation

### Getting Started
- **[Project Overview](./context/project-overview.md)** - Learn about the project vision and goals
- **[Problem Statement](./context/problem-statement.md)** - Understand the problem we're solving
- **[User Personas](./context/user-personas.md)** - Who are our users?

### Architecture
- **[Architecture Overview](./architecture/overview.md)** - High-level technical architecture
- **[Folder Structure](./architecture/folder-structure.md)** - Codebase organization
- **[Data Flow](./architecture/data-flow.md)** - How data moves through the system
- **[Tech Stack](./architecture/tech-stack.md)** - Technology choices and justifications

### Development
- **[Coding Standards](./standards/code-style.md)** - Code formatting and naming conventions
- **[Best Practices](./standards/best-practices.md)** - Language/framework-specific patterns
- **[Testing](./standards/testing.md)** - Testing strategy and patterns
- **[Contributing](../CONTRIBUTING.md)** - How to contribute to the project

### API Documentation
- **[API Design](./backend/api-design.md)** - API design principles and patterns
- **[Authentication](./backend/authentication.md)** - Auth/authorization implementation
- **[Error Handling](./backend/error-handling.md)** - Error handling strategy

### Frontend Documentation
- **[Component Patterns](./frontend/component-patterns.md)** - React component best practices
- **[State Management](./frontend/state-management.md)** - State management approach
- **[Routing](./frontend/routing.md)** - Next.js App Router patterns

### AI Assistant Context
- **[AI.md](../AI.md)** - Quick context for AI assistants working on this project

## 🤝 Contributing

We welcome contributions from the community! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines on:

- Setting up your development environment
- Coding standards and best practices
- Submitting pull requests
- Reporting bugs and requesting features

### Quick Contribution Guide

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/offer-hub-monorepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/offer-hub-monorepo/discussions)

## 👥 Maintainers

- [@Josue19-08](https://github.com/Josue19-08) - Project Lead
- [@KevinMB0220](https://github.com/KevinMB0220) - Core Contributor

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Backend powered by [Express](https://expressjs.com/)

---

**Status**: Active Development
**Version**: 0.1.0 (MVP Phase)
**Last Updated**: February 2026
