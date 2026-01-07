# Error Handling Standards

This document defines how to handle errors consistently across the Offer Hub project.

## Error Structure

### Base Class: AppError

All errors must extend from `AppError`:

```typescript
import { AppError } from '@/utils/AppError';

// Usage example
throw new AppError(
  'User not found',
  404,
  'USER_NOT_FOUND',
  { userId: '123' }
);
```

### AppError Properties

- `message`: Human-readable message for the user
- `statusCode`: HTTP status code (400, 404, 500, etc.)
- `errorCode`: Unique error code (string in UPPER_SNAKE_CASE)
- `details`: Optional object with additional information
- `timestamp`: Automatic timestamp in ISO 8601 format

## Error Types

### ValidationError

For data validation errors:

```typescript
import { ValidationError } from '@/utils/AppError';

throw new ValidationError(
  'The provided data is invalid',
  [
    { field: 'email', message: 'Invalid email' },
    { field: 'password', message: 'Password too short' }
  ]
);
```

### AuthenticationError

For authentication errors:

```typescript
import { AuthenticationError } from '@/utils/AppError';

throw new AuthenticationError('Invalid or expired token');
```

### AuthorizationError

For authorization errors:

```typescript
import { AuthorizationError } from '@/utils/AppError';

throw new AuthorizationError('You do not have permission for this action');
```

### NotFoundError

For resources not found:

```typescript
import { NotFoundError } from '@/utils/AppError';

throw new NotFoundError('User', { userId: '123' });
```

### ConflictError

For conflicts (duplicates, invalid states):

```typescript
import { ConflictError } from '@/utils/AppError';

throw new ConflictError('Email is already registered');
```

## Error Codes

Use the codes defined in `backend/src/types/errors.types.ts`:

### Validation
- `VALIDATION_ERROR`
- `REQUIRED_FIELD`
- `INVALID_EMAIL`
- `INVALID_UUID`

### Database
- `DATABASE_ERROR`
- `DUPLICATE_ENTRY`
- `REFERENCE_NOT_FOUND`

### Business Logic
- `USER_NOT_FOUND`
- `CONTRACT_NOT_FOUND`
- `INSUFFICIENT_FUNDS`
- `INVALID_STATUS_TRANSITION`

### Authentication/Authorization
- `AUTHENTICATION_ERROR`
- `TOKEN_EXPIRED`
- `TOKEN_INVALID`
- `AUTHORIZATION_ERROR`
- `INSUFFICIENT_PERMISSIONS`

## Error Handling in Controllers

### Recommended Pattern

```typescript
import { Request, Response } from 'express';
import { AppError } from '@/utils/AppError';
import { UserService } from '@/services/user.service';

export class UserController {
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new AppError('User ID is required', 400, 'REQUIRED_FIELD');
      }

      const user = await UserService.getUserById(id);
      
      if (!user) {
        throw new NotFoundError('User', { userId: id });
      }

      return res.status(200).json({
        success: true,
        message: 'User found',
        data: user
      });
    } catch (error) {
      // Error middleware handles the rest
      throw error;
    }
  }
}
```

## Error Handling in Services

### Input Validation

```typescript
export class UserService {
  static async createUser(data: CreateUserDTO) {
    // Validate required data
    if (!data.email) {
      throw new AppError('Email is required', 400, 'REQUIRED_FIELD');
    }

    if (!isValidEmail(data.email)) {
      throw new AppError('Invalid email', 400, 'INVALID_EMAIL');
    }

    // Business logic
    try {
      const user = await supabase.from('users').insert(data).select().single();
      return user;
    } catch (error) {
      if (error.code === '23505') { // Duplicate key
        throw new ConflictError('Email is already registered');
      }
      throw new AppError('Error creating user', 500, 'DATABASE_ERROR');
    }
  }
}
```

## Error Middleware

The `ErrorHandlerMiddleware` captures all errors and formats them consistently:

```typescript
// backend/src/middlewares/errorHandler.middleware.ts
// Already implemented - no additional action needed
```

## Standard Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "type": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {
      "userId": "123"
    },
    "code": "USER_NOT_FOUND",
    "timestamp": "2025-12-16T10:30:00.000Z"
  }
}
```

### In Development

In development mode, additional information is included:

```json
{
  "success": false,
  "error": {
    "type": "USER_NOT_FOUND",
    "message": "User not found",
    "details": { "userId": "123" },
    "code": "USER_NOT_FOUND",
    "timestamp": "2025-12-16T10:30:00.000Z",
    "stack": "Error: User not found\n    at ...",
    "url": "/api/users/123",
    "method": "GET"
  }
}
```

## HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| 400 | Bad Request - Invalid data | `VALIDATION_ERROR` |
| 401 | Unauthorized - Not authenticated | `TOKEN_EXPIRED` |
| 403 | Forbidden - No permissions | `INSUFFICIENT_PERMISSIONS` |
| 404 | Not Found - Resource doesn't exist | `USER_NOT_FOUND` |
| 409 | Conflict - Duplicate or conflict | `DUPLICATE_ENTRY` |
| 422 | Unprocessable Entity - Validation failed | `VALIDATION_ERROR` |
| 500 | Internal Server Error - Server error | `DATABASE_ERROR` |

## Best Practices

1. **Always use AppError**: Don't throw generic JavaScript errors
2. **Clear messages**: Messages should be understandable for end users
3. **Unique codes**: Use consistent and documented error codes
4. **Don't expose sensitive details**: In production, don't include stack traces or internal information
5. **Logging**: Errors are automatically logged in development
6. **Async error handling**: Use try/catch in async/await functions

## Logging Standards

### Log Levels

Use appropriate log levels for different situations:

| Level | Usage | Example |
|-------|-------|---------|
| `error` | Application errors that need immediate attention | Database connection failed, unhandled exceptions |
| `warn` | Potential issues or unusual behavior | Rate limit approaching, deprecated API usage |
| `info` | Important business events | User registered, payment processed |
| `debug` | Detailed information for debugging (dev only) | Request payload, function entry/exit |

### Logging in Controllers

```typescript
import { logger } from '@/utils/logger';

export class UserController {
  async createUser(req: Request, res: Response) {
    logger.info('Creating new user', { email: req.body.email });

    try {
      const user = await UserService.createUser(req.body);
      logger.info('User created successfully', { userId: user.id });
      return res.status(201).json(buildSuccessResponse(user, 'User created'));
    } catch (error) {
      logger.error('Failed to create user', {
        email: req.body.email,
        error: error.message
      });
      throw error;
    }
  }
}
```

### Logging in Services

```typescript
import { logger } from '@/utils/logger';

export class UserService {
  static async getUserById(id: string) {
    logger.debug('Fetching user by ID', { userId: id });

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Database error fetching user', {
        userId: id,
        errorCode: error.code,
        errorMessage: error.message
      });
      throw new NotFoundError('User', { userId: id });
    }

    logger.debug('User fetched successfully', { userId: id });
    return data;
  }
}
```

### What to Log

**DO log**:
- User actions (login, logout, registration)
- Business events (payment, order creation)
- Error details (message, stack in dev)
- Request metadata (method, path, duration)
- System events (startup, shutdown)

**DO NOT log**:
- Passwords or secrets
- Full credit card numbers
- Personal identifiable information (PII) in production
- Access tokens or refresh tokens
- Private keys

### Log Format

All logs should include contextual information:

```typescript
// Good: Includes context
logger.info('User login successful', {
  userId: user.id,
  method: 'email',
  ip: req.ip
});

// Bad: No context
logger.info('Login successful');
```

## Error Handling in Middleware

### Request Validation Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/utils/AppError';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));

      throw new ValidationError('Invalid request data', details);
    }

    next();
  };
};
```

### Authentication Middleware Errors

```typescript
import { AuthenticationError, AuthorizationError } from '@/utils/AppError';

export const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('Access token required');
  }

  try {
    const payload = await verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired', 'TOKEN_EXPIRED');
    }
    throw new AuthenticationError('Invalid token', 'TOKEN_INVALID');
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }
    next();
  };
};
```

## Warnings and Non-Critical Errors

For issues that don't require stopping execution:

```typescript
import { logger } from '@/utils/logger';

export class PaymentService {
  static async processPayment(data: PaymentData) {
    // Log warning for unusual but valid scenarios
    if (data.amount > 10000) {
      logger.warn('Large payment detected', {
        userId: data.userId,
        amount: data.amount
      });
    }

    // Continue processing...
  }
}
```

### Warning Scenarios

- Approaching rate limits
- Deprecated feature usage
- Unusual but valid user behavior
- Performance degradation
- Configuration issues that don't prevent operation

## Error Recovery Patterns

### Retry with Backoff

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn(`Operation failed, attempt ${attempt}/${maxRetries}`, {
        error: error.message
      });

      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError!;
}
```

### Graceful Degradation

```typescript
async function getUser(id: string): Promise<User | null> {
  try {
    // Try primary database
    return await UserService.getUserById(id);
  } catch (error) {
    logger.error('Primary DB failed, trying cache', { error: error.message });

    try {
      // Fallback to cache
      return await CacheService.getUser(id);
    } catch (cacheError) {
      logger.error('Cache also failed', { error: cacheError.message });
      return null;
    }
  }
}

## Complete Examples

### Create User with Validation

```typescript
export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, username } = req.body;

      // Validations
      if (!email) {
        throw new AppError('Email is required', 400, 'REQUIRED_FIELD');
      }

      if (!isValidEmail(email)) {
        throw new AppError('Invalid email', 400, 'INVALID_EMAIL');
      }

      if (!password || password.length < 8) {
        throw new AppError(
          'Password must be at least 8 characters',
          400,
          'VALIDATION_ERROR'
        );
      }

      // Create user
      const user = await UserService.createUser({ email, password, username });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      throw error; // Middleware handles it
    }
  }
}
```

### Database Error Handling

```typescript
export class UserService {
  static async getUserById(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          throw new NotFoundError('User', { userId: id });
        }
        throw new AppError('Error searching for user', 500, 'DATABASE_ERROR');
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Unexpected error', 500, 'INTERNAL_SERVER_ERROR');
    }
  }
}
```
