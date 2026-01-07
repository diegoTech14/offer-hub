# Project Architecture

This document describes the architecture and structure of the Offer Hub project.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Design](#database-design)
- [API Design](#api-design)

## Overview

Offer Hub is a decentralized freelance platform built with modern web technologies and blockchain integration. The system follows a layered architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                    React + TypeScript + TailwindCSS              │
├─────────────────────────────────────────────────────────────────┤
│                         Backend (Express)                        │
│                       Node.js + TypeScript                       │
├─────────────────────────────────────────────────────────────────┤
│                        Database (Supabase)                       │
│                           PostgreSQL                             │
├─────────────────────────────────────────────────────────────────┤
│                      Blockchain (Stellar)                        │
│                     Soroban Smart Contracts                      │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (Access + Refresh Tokens)
- **Database Client**: Supabase Client

### Database
- **Provider**: Supabase
- **Engine**: PostgreSQL
- **Migrations**: SQL files with Supabase CLI

### Blockchain
- **Network**: Stellar
- **Smart Contracts**: Soroban (Rust)

## Project Structure

```
offer-hub/
├── src/                      # Frontend source code
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API service clients
│   ├── providers/            # React context providers
│   ├── stores/               # State management
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── styles/               # Global styles
│
├── backend/                  # Backend source code
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route handlers
│   │   ├── middlewares/      # Express middlewares
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── lib/              # External library integrations
│   │   └── index.ts          # Application entry point
│   │
│   └── supabase/
│       └── migrations/       # Database migration files
│
├── contracts/                # Stellar smart contracts
│
├── docs/                     # Documentation
│
└── public/                   # Static assets
```

## Backend Architecture

The backend follows a layered architecture pattern:

```
Request → Routes → Middleware → Controller → Service → Database
                                    ↓
                              Response Builder
                                    ↓
                               Response
```

### Routes

Routes define API endpoints and connect them to controllers.

**Location**: `/backend/src/routes/`

**Naming**: `<resource>.routes.ts`

```typescript
// user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', authenticateToken, UserController.getUser);
router.put('/:id', authenticateToken, UserController.updateUser);

export default router;
```

**Responsibilities**:
- Define HTTP methods and paths
- Apply route-specific middleware
- Connect endpoints to controller methods

### Controllers

Controllers handle HTTP requests and responses.

**Location**: `/backend/src/controllers/`

**Naming**: `<resource>.controller.ts`

```typescript
// user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { buildSuccessResponse } from '../utils/responseBuilder';
import { AppError } from '../utils/AppError';

export class UserController {
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Validate input
      if (!id) {
        throw new AppError('User ID is required', 400, 'REQUIRED_FIELD');
      }

      // Call service
      const user = await UserService.getUserById(id);

      // Return response
      return res.status(200).json(
        buildSuccessResponse(user, 'User retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }
}
```

**Responsibilities**:
- Receive and parse HTTP requests
- Validate request parameters
- Call appropriate service methods
- Format and send HTTP responses
- Handle errors with next(error)

**Rules**:
- NO business logic in controllers
- Always use try/catch with next(error)
- Use response builder helpers
- Validate inputs early

### Services

Services contain all business logic.

**Location**: `/backend/src/services/`

**Naming**: `<resource>.service.ts`

```typescript
// user.service.ts
import { supabase } from '../lib/supabase/supabase';
import { NotFoundError, ConflictError } from '../utils/AppError';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/user.types';

export class UserService {
  static async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('User', { userId: id });
    }

    return data;
  }

  static async createUser(dto: CreateUserDTO): Promise<User> {
    // Check for existing user
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert(dto)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create user', 500, 'DATABASE_ERROR');
    }

    return data;
  }
}
```

**Responsibilities**:
- Implement business logic
- Interact with database
- Throw appropriate errors
- Transform data between layers

**Rules**:
- NO HTTP-related logic (no req/res)
- Use static methods for stateless operations
- Always throw AppError subclasses
- Keep methods focused (single responsibility)

### Middlewares

Middlewares process requests before they reach controllers.

**Location**: `/backend/src/middlewares/`

**Naming**: `<purpose>.middleware.ts`

```typescript
// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { AuthenticationError } from '../utils/AppError';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const payload = await verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
```

**Types of Middleware**:

| Middleware | Purpose |
|------------|---------|
| `auth.middleware.ts` | Token validation, user context |
| `errorHandler.middleware.ts` | Global error handling |
| `logger.middleware.ts` | Request/response logging |
| `ratelimit.middleware.ts` | Rate limiting |

### Error Handling Middleware

The error handler middleware catches all errors and formats responses consistently.

```typescript
// errorHandler.middleware.ts
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  // Handle AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        type: error.errorCode,
        message: error.message,
        details: error.details,
        code: error.errorCode,
        timestamp: error.timestamp,
      },
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    success: false,
    error: {
      type: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
    },
  });
};
```

### Logging Standards

All logs should follow this format:

```typescript
import { logger } from '../utils/logger';

// Information logs
logger.info('User registered successfully', { userId: user.id });

// Warning logs
logger.warn('Rate limit approaching', { ip: req.ip, count: requestCount });

// Error logs
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack
});

// Debug logs (development only)
logger.debug('Request payload', { body: req.body });
```

**Log Levels**:
- `error`: Application errors that need attention
- `warn`: Potential issues or unusual behavior
- `info`: Important business events
- `debug`: Detailed information for debugging

## Frontend Architecture

### Component Structure

```
src/components/
├── ui/                    # Reusable UI components (buttons, inputs, etc.)
├── layout/                # Layout components (header, footer, sidebar)
├── forms/                 # Form components
└── features/              # Feature-specific components
    └── auth/              # Authentication components
```

### Custom Hooks

Hooks encapsulate reusable logic.

**Location**: `/src/hooks/`

**Naming**: `use-<purpose>.ts`

```typescript
// use-user-data.ts
export const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await UserService.getUser(userId);
        setUser(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};
```

### Services (Frontend)

Frontend services handle API communication.

**Location**: `/src/services/`

```typescript
// user.service.ts
import { api } from '@/lib/axios';
import { User, UpdateUserDTO } from '@/types/user';

export const UserService = {
  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },
};
```

### Providers

Providers manage global state using React Context.

**Location**: `/src/providers/`

```typescript
// auth-provider.tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ... authentication logic

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Database Design

### Table Naming

- Use `snake_case` for table names
- Use plural form (e.g., `users`, not `user`)
- Use descriptive names

### Column Naming

- Use `snake_case` for column names
- Use `id` for primary keys
- Use `<table>_id` for foreign keys
- Use `created_at` and `updated_at` for timestamps

### Index Naming

Format: `idx_<table>_<columns>`

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contracts_user_id_status ON contracts(user_id, status);
```

### Example Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

## API Design

### URL Structure

```
/api/v1/<resource>
/api/v1/<resource>/:id
/api/v1/<resource>/:id/<sub-resource>
```

### HTTP Methods

| Method | Usage | Example |
|--------|-------|---------|
| GET | Retrieve resource(s) | `GET /api/v1/users` |
| POST | Create resource | `POST /api/v1/users` |
| PUT | Replace resource | `PUT /api/v1/users/:id` |
| PATCH | Partial update | `PATCH /api/v1/users/:id` |
| DELETE | Delete resource | `DELETE /api/v1/users/:id` |

### Response Format

All responses follow the standard format defined in [API_RESPONSES.md](./API_RESPONSES.md).

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "123",
    "email": "user@example.com"
  }
}
```

### Error Responses

All errors follow the format defined in [ERROR_HANDLING.md](./ERROR_HANDLING.md).

```json
{
  "success": false,
  "error": {
    "type": "USER_NOT_FOUND",
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "timestamp": "2025-01-07T10:30:00.000Z"
  }
}
```

## Data Flow Example

Here's how a typical request flows through the system:

```
1. Client sends: GET /api/v1/users/123
                          ↓
2. Router matches route and applies middleware
                          ↓
3. Auth middleware validates token
                          ↓
4. Controller receives request
   - Validates parameters
   - Calls UserService.getUserById('123')
                          ↓
5. Service executes business logic
   - Queries database via Supabase
   - Throws NotFoundError if not found
                          ↓
6. Controller formats response
   - Uses buildSuccessResponse()
                          ↓
7. Client receives:
   {
     "success": true,
     "message": "User retrieved successfully",
     "data": { "id": "123", "email": "user@example.com" }
   }
```

## Best Practices

1. **Keep layers separate** - Don't mix responsibilities between layers
2. **Use TypeScript** - Type everything for better maintainability
3. **Handle errors consistently** - Always use AppError subclasses
4. **Log appropriately** - Use correct log levels
5. **Validate early** - Validate input at controller level
6. **Keep services pure** - Services should not know about HTTP
7. **Use transactions** - For operations that modify multiple tables
8. **Document APIs** - Keep API documentation up to date
