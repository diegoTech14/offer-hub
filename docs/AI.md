# AI Context - Offer Hub

> **Quick reference for AI assistants working on this project**

## 🎯 Project Summary

**What it does**: A full-stack platform for managing job offers, salary negotiations, and career decisions
**Tech stack**: Next.js 15 + React 19 + Express 5 + TypeScript + Tailwind CSS
**Current phase**: MVP Development (v0.1.0)

## 🏗️ Architecture at a Glance

```
┌─────────────────┐
│  Next.js 15     │ Frontend (Port 3000)
│  React 19       │ - App Router
│  Tailwind CSS   │ - Server Components
└────────┬────────┘ - TypeScript
         │
         │ HTTP/REST
         │
┌────────┴────────┐
│  Express 5      │ Backend (Port 4000)
│  TypeScript     │ - REST API
│  CORS enabled   │ - Type-safe
└─────────────────┘
```

## 🛠️ Common Tasks

### Running the project

```bash
# Frontend development
npm install
npm run dev             # Starts Next.js on port 3000

# Backend development
cd backend
npm install
npm run dev             # Starts Express on port 4000

# Production build (frontend)
npm run build
npm start

# Backend production
cd backend
npm run build
npm start
```

### Creating a new feature

1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement frontend in `src/app/[feature]/`
3. Implement backend API in `backend/src/routes/[feature].ts`
4. Add tests (when testing is set up)
5. Update documentation in `docs/features/[feature-name].md`
6. Submit PR

### File organization

**Frontend**:
- **Pages**: `src/app/[route]/page.tsx` (Next.js App Router)
- **Layouts**: `src/app/[route]/layout.tsx`
- **Components**: `src/components/[category]/[ComponentName].tsx` (when created)
- **Utilities**: `src/lib/[utility-name].ts` (when created)
- **Types**: `src/types/[domain].types.ts` (when created)

**Backend**:
- **Entry**: `backend/src/index.ts`
- **Routes**: `backend/src/routes/[resource].ts` (to be created)
- **Controllers**: `backend/src/controllers/[resource].controller.ts` (to be created)
- **Models**: `backend/src/models/[resource].model.ts` (to be created)
- **Middleware**: `backend/src/middleware/[middleware-name].ts` (to be created)
- **Types**: `backend/src/types/[domain].types.ts` (to be created)

## 📐 Code Standards

### Language & Tools
- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (to be configured)
- **Linting**: ESLint (Next.js config)
- **Testing**: To be set up (Jest/Vitest recommended)

### Naming Conventions
- **Variables/Functions**: `camelCase` (e.g., `getUserOffers`, `offerCount`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_OFFERS`, `API_URL`)
- **Components**: `PascalCase` (e.g., `OfferCard`, `ComparisonTable`)
- **Files (Components)**: `PascalCase.tsx` (e.g., `OfferCard.tsx`)
- **Files (Utilities)**: `kebab-case.ts` (e.g., `format-currency.ts`)
- **Types/Interfaces**: `PascalCase` (e.g., `OfferData`, `ApiResponse`)

### Import Organization
```typescript
// 1. External dependencies
import { useState } from "react";
import { type NextPage } from "next";

// 2. Internal imports (alphabetical)
import { Button } from "@/components/ui/Button";
import { useOffers } from "@/hooks/use-offers";

// 3. Type imports
import type { Offer } from "@/types/offer";

// 4. Styles (if separate)
import "./styles.css";
```

## 🎨 Design Principles

### Frontend
- **Mobile-first responsive design**: Design for mobile, enhance for desktop
- **Accessibility-first development**: WCAG AA compliance minimum
- **Performance over features**: Fast, lightweight, optimized
- **Server Components by default**: Use Client Components only when needed
- **TypeScript strict mode**: No `any`, proper type safety

### Backend
- **RESTful API design**: Follow REST conventions
- **Type safety**: Use TypeScript interfaces and types
- **Error handling**: Consistent error responses with proper status codes
- **CORS configured**: Secure cross-origin requests
- **Validation**: Validate all inputs server-side

## 🚨 Important Conventions

### Frontend
- **Server vs Client Components**:
  - Default: Server Components (no "use client")
  - Use "use client" only for: state, effects, browser APIs, event handlers
- **Path Aliases**: Use `@/` for imports from `src/`
  - Example: `import { Button } from "@/components/ui/Button"`
- **Styling**: Tailwind CSS utility classes
- **TypeScript**: Explicit types, no implicit `any`

### Backend
- **Entry Point**: `backend/src/index.ts` (Express server)
- **Port**: 4000 (development), configurable via environment
- **CORS**: Enabled for frontend communication
- **TypeScript**: Strict mode, explicit types

### Git Workflow
- **Branch naming**:
  - `feature/feature-name` for new features
  - `fix/bug-description` for bug fixes
  - `chore/task-description` for maintenance
- **Commit messages**: Follow conventional commits
  - `feat: add offer comparison feature`
  - `fix: resolve date formatting issue`
  - `chore: update dependencies`

## 📚 Key Documentation

### Must-Read Docs
- [Project Overview](./docs/context/project-overview.md) - Vision and goals
- [Architecture Overview](./docs/architecture/overview.md) - Technical architecture
- [Coding Standards](./docs/standards/code-style.md) - Code style guide
- [Design System](./DESIGN_SYSTEM_PROMPT.md) - Complete design system

### Reference Docs
- [Folder Structure](./docs/architecture/folder-structure.md) - Code organization
- [API Design](./docs/backend/api-design.md) - Backend API patterns
- [Component Patterns](./docs/frontend/component-patterns.md) - React patterns

## 🔗 External Resources

- **Repository**: [GitHub](https://github.com/your-username/offer-hub-monorepo)
- **Design System**: See [DESIGN_SYSTEM_PROMPT.md](./DESIGN_SYSTEM_PROMPT.md)
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Express Docs**: https://expressjs.com

## 🎯 Current Focus

### MVP Features (v0.1.0)
- [ ] Offer creation and management
- [ ] Offer comparison tool
- [ ] Basic dashboard
- [ ] User authentication
- [ ] Data persistence

### Immediate Priorities
1. Set up backend database integration
2. Implement offer CRUD operations
3. Create offer comparison UI
4. Add user authentication
5. Deploy MVP

## 💡 Quick Tips for AI Assistants

### When adding a new page
1. Create `src/app/[route]/page.tsx` (Server Component by default)
2. Add layout if needed: `src/app/[route]/layout.tsx`
3. Use TypeScript with explicit types
4. Follow mobile-first responsive design
5. Ensure accessibility (semantic HTML, ARIA labels)

### When adding an API endpoint
1. Add route in `backend/src/index.ts` or create `backend/src/routes/[resource].ts`
2. Define TypeScript interfaces for request/response
3. Add proper error handling with status codes
4. Validate inputs
5. Document in `docs/backend/api-design.md`

### When creating a component
1. Use Server Component unless interactivity is needed
2. Add "use client" directive if using state/effects
3. Use TypeScript with proper prop types
4. Apply Tailwind CSS for styling
5. Ensure keyboard navigation and ARIA labels

### Code Quality Checklist
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] Follows naming conventions
- [ ] Includes proper error handling
- [ ] Mobile-responsive (if UI)
- [ ] Accessible (if UI)
- [ ] Documentation updated

---

**Last Updated**: February 2026
**Maintained By**: [@Josue19-08](https://github.com/Josue19-08), [@KevinMB0220](https://github.com/KevinMB0220)
