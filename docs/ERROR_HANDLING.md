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
