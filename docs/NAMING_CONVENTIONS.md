# Naming Conventions

This document defines naming conventions to maintain consistency across the Offer Hub project.

## Files and Folders

### Files
- **Format**: `kebab-case` (lowercase with hyphens)
- **Examples**:
  - ✅ `user-service.ts`
  - ✅ `auth-controller.ts`
  - ✅ `error-handler.middleware.ts`
  - ❌ `UserService.ts`
  - ❌ `authController.ts`
  - ❌ `error_handler.middleware.ts`

### Folders
- **Format**: `kebab-case` (lowercase with hyphens)
- **Examples**:
  - ✅ `src/components/user-profile/`
  - ✅ `backend/src/middlewares/`
  - ✅ `src/hooks/use-auth/`
  - ❌ `src/components/UserProfile/`
  - ❌ `backend/src/Middlewares/`

### Exceptions
- **React Components**: Use `PascalCase` for component files
  - ✅ `UserProfile.tsx`
  - ✅ `LoginForm.tsx`
  - ❌ `user-profile.tsx`

## Code

### Variables and Functions
- **Format**: `camelCase`
- **Examples**:
  ```typescript
  const userName = 'john_doe';
  const getUserData = () => {};
  const isAuthenticated = true;
  ```

### Constants
- **Format**: `UPPER_SNAKE_CASE`
- **Examples**:
  ```typescript
  const MAX_RETRY_ATTEMPTS = 3;
  const API_BASE_URL = 'https://api.offer-hub.org';
  const DEFAULT_TIMEOUT = 5000;
  ```

### Classes and Interfaces
- **Format**: `PascalCase`
- **Examples**:
  ```typescript
  class UserService {}
  interface ApiResponse {}
  type UserRole = 'freelancer' | 'client';
  ```

### Types and Enums
- **Format**: `PascalCase`
- **Examples**:
  ```typescript
  enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
  }
  
  type UserId = string;
  ```

### React Components
- **Format**: `PascalCase`
- **Examples**:
  ```typescript
  export const UserProfile = () => {};
  export default function LoginForm() {};
  ```

### Custom Hooks
- **Format**: `camelCase` with `use-` prefix
- **File**: `kebab-case` with `use-` prefix
- **Examples**:
  - File: `use-user-data.ts`
  - Hook: `useUserData()`
  - File: `use-auth-state.ts`
  - Hook: `useAuthState()`

## Backend Specific

### Controllers
- **File**: `kebab-case` with `.controller.ts` suffix
- **Class**: `PascalCase` with `Controller` suffix
- **Examples**:
  - File: `user.controller.ts`
  - Class: `UserController`

### Services
- **File**: `kebab-case` with `.service.ts` suffix
- **Class**: `PascalCase` with `Service` suffix
- **Examples**:
  - File: `auth.service.ts`
  - Class: `AuthService`

### Middlewares
- **File**: `kebab-case` with `.middleware.ts` suffix
- **Function/Class**: `camelCase` or `PascalCase` as appropriate
- **Examples**:
  - File: `auth.middleware.ts`
  - Function: `authenticateToken`

### Routes
- **File**: `kebab-case` with `.routes.ts` suffix
- **Variable**: `camelCase` with `Routes` suffix
- **Examples**:
  - File: `user.routes.ts`
  - Variable: `userRoutes`

### Types
- **File**: `kebab-case` with `.types.ts` suffix
- **Interfaces/Types**: `PascalCase`
- **Examples**:
  - File: `user.types.ts`
  - Interface: `UserData`, `CreateUserRequest`

## Frontend Specific

### Components
- **File**: `PascalCase.tsx` for main components
- **Folder**: `kebab-case` for components with multiple files
- **Examples**:
  - `UserProfile.tsx` (simple component)
  - `user-profile/` (folder with multiple files)
    - `user-profile.tsx`
    - `user-profile.styles.ts`
    - `user-profile.test.tsx`

### Pages (Next.js App Router)
- **File**: `kebab-case` with `page.tsx` or `layout.tsx`
- **Examples**:
  - `src/app/login/page.tsx`
  - `src/app/user-profile/page.tsx`

### Hooks
- **File**: `kebab-case` with `use-` prefix and `.ts` suffix
- **Examples**:
  - `use-user-data.ts`
  - `use-auth-state.ts`

## Database

### Tables
- **Format**: `snake_case` (plural)
- **Examples**:
  - ✅ `users`
  - ✅ `refresh_tokens`
  - ✅ `service_requests`
  - ❌ `Users`
  - ❌ `refreshTokens`

### Columns
- **Format**: `snake_case`
- **Examples**:
  - ✅ `user_id`
  - ✅ `created_at`
  - ✅ `email_verified`
  - ❌ `userId`
  - ❌ `createdAt`

### Indexes
- **Format**: `idx_<table>_<columns>`
- **Examples**:
  - `idx_users_email`
  - `idx_contracts_user_id`

## Environment Variables

- **Format**: `UPPER_SNAKE_CASE`
- **Examples**:
  - `SUPABASE_URL`
  - `JWT_SECRET`
  - `NEXT_PUBLIC_API_URL`

## Comments and Documentation

- **Code comments**: English
- **Commit messages**: English (unless otherwise specified)
- **Documentation**: English
