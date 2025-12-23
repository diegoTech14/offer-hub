# API Response Format Standardization

## Overview

**ALL backend endpoints MUST follow this standard format without exceptions.** This document defines the exact format that all responses (success and error) must use to ensure consistency across the entire project.

## Success Response Format

### Base Structure

```typescript
{
  success: true,
  message: string,
  data?: any,
  metadata?: {
    timestamp: string,
    requestId?: string
  }
}
```

### Examples by Operation Type

#### GET - Retrieve Resource (200)
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  },
  "metadata": {
    "timestamp": "2025-12-23T02:48:57.126Z",
    "requestId": "a80f9a7d-6f0f-4d4f-86ec-198022d4ab7b"
  }
}
```

#### POST - Create Resource (201)
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "metadata": {
    "timestamp": "2025-12-23T02:48:57.126Z",
    "requestId": "a80f9a7d-6f0f-4d4f-86ec-198022d4ab7b"
  }
}
```

#### PUT/PATCH - Update Resource (200)
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "updated@example.com"
  },
  "metadata": {
    "timestamp": "2025-12-23T02:48:57.126Z"
  }
}
```

#### DELETE - Delete Resource (200)
```json
{
  "success": true,
  "message": "User deleted successfully",
  "metadata": {
    "timestamp": "2025-12-23T02:48:57.126Z"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    { "id": "uuid1", "email": "user1@example.com" },
    { "id": "uuid2", "email": "user2@example.com" }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 100,
    "per_page": 20
  },
  "metadata": {
    "timestamp": "2025-12-23T02:48:57.126Z"
  }
}
```

## Error Response Format

### Base Structure (MANDATORY)

```typescript
{
  success: false,
  error: {
    type: string,           // Readable error code (AUTHENTICATION_ERROR, VALIDATION_ERROR, etc.)
    message: string,         // Descriptive error message
    code: string,            // Error code (same as type)
    statusCode: number,      // HTTP status code (401, 404, 500, etc.) - MANDATORY
    details?: any,          // Additional details (optional)
    timestamp: string       // ISO 8601 timestamp
  }
}
```

### Examples by Error Type

#### Authentication Error (401)
```json
{
  "success": false,
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "message": "Invalid email or password",
    "code": "AUTHENTICATION_ERROR",
    "statusCode": 401,
    "timestamp": "2025-12-23T02:55:12.192Z"
  }
}
```

#### Validation Error (422)
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 422,
    "details": [
      {
        "field": "email",
        "value": "invalid-email",
        "reason": "Invalid email format",
        "code": "INVALID_EMAIL"
      }
    ],
    "timestamp": "2025-12-23T02:55:12.192Z"
  }
}
```

#### Resource Not Found Error (404)
```json
{
  "success": false,
  "error": {
    "type": "RESOURCE_NOT_FOUND",
    "message": "User not found",
    "code": "RESOURCE_NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2025-12-23T02:55:12.192Z"
  }
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "error": {
    "type": "AUTHORIZATION_ERROR",
    "message": "Account is inactive. Please contact support.",
    "code": "AUTHORIZATION_ERROR",
    "statusCode": 403,
    "timestamp": "2025-12-23T02:55:12.192Z"
  }
}
```

#### Server Error (500)
```json
{
  "success": false,
  "error": {
    "type": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "code": "INTERNAL_SERVER_ERROR",
    "statusCode": 500,
    "timestamp": "2025-12-23T02:55:12.192Z"
  }
}
```

## Standard HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| **200** | Success (GET, PUT, PATCH, DELETE) | Operation completed successfully |
| **201** | Created (POST) | Resource created successfully |
| **400** | Bad Request | Malformed request or business logic violation |
| **401** | Unauthorized | Authentication required or invalid credentials |
| **403** | Forbidden | Insufficient authorization or inactive account |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Conflict (e.g., duplicate email) |
| **422** | Unprocessable Entity | Validation error |
| **500** | Internal Server Error | Server error |

## Response Builder Utility

### Mandatory Usage

**ALL controllers MUST use `responseBuilder` functions for success responses:**

```typescript
import { 
  buildSuccessResponse, 
  buildSuccessResponseWithoutData,
  buildPaginatedResponse 
} from '@/utils/responseBuilder';
```

### Available Functions

#### 1. `buildSuccessResponse<T>(data: T, message: string)`
```typescript
// For GET, POST, PUT that return data
res.status(200).json(
  buildSuccessResponse(user, "User retrieved successfully")
);
```

#### 2. `buildSuccessResponseWithoutData(message: string)`
```typescript
// For DELETE or operations without data
res.status(200).json(
  buildSuccessResponseWithoutData("User deleted successfully")
);
```

#### 3. `buildPaginatedResponse<T>(data: T[], message: string, pagination: object)`
```typescript
res.status(200).json(
  buildPaginatedResponse(
    users,
    "Users retrieved successfully",
    {
      current_page: 1,
      total_pages: 5,
      total_items: 100,
      per_page: 20
    }
  )
);
```

## Error Handling

### Mandatory Use of Error Classes

**NEVER return errors directly. ALWAYS throw exceptions using error classes:**

```typescript
import { 
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  BadRequestError,
  ConflictError
} from '@/utils/AppError';
```

### Usage Examples

```typescript
// ❌ INCORRECT - Don't do this
res.status(401).json({ error: "Invalid credentials" });

// ✅ CORRECT - Do this
throw new AuthenticationError("Invalid email or password");
```

```typescript
// ❌ INCORRECT
res.status(404).json({ message: "User not found" });

// ✅ CORRECT
throw new NotFoundError("User not found");
```

```typescript
// ❌ INCORRECT
res.status(400).json({ success: false, message: "Validation failed" });

// ✅ CORRECT
throw new ValidationError("Validation failed", validationErrors);
```

### Error Middleware Handles Formatting

The `errorHandler.middleware.ts` middleware automatically formats all errors to the standard format. Just throw the correct exception and the middleware will handle the rest.

## Controller Structure

### Standard Template

```typescript
import { Request, Response, NextFunction } from "express";
import { buildSuccessResponse } from '@/utils/responseBuilder';
import { AuthenticationError, ValidationError } from '@/utils/AppError';

export async function myHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Validation (if needed)
    if (!req.body.email) {
      throw new ValidationError("Email is required");
    }

    // 2. Service call
    const result = await myService.doSomething(req.body);

    // 3. Success response using responseBuilder
    res.status(200).json(
      buildSuccessResponse(result, "Operation successful")
    );
  } catch (error) {
    // 4. Pass error to middleware (DO NOT format manually)
    next(error);
  }
}
```

## Implementation Rules

### ✅ MUST Do

1. **Use `buildSuccessResponse`** for all success responses
2. **Throw exceptions** using appropriate error classes
3. **Include `statusCode`** in all errors (automatic with classes)
4. **Use `next(error)`** to pass errors to middleware
5. **Maintain consistency** across all endpoints

### ❌ MUST NOT Do

1. **DO NOT** format errors manually in controllers
2. **DO NOT** use different response formats
3. **DO NOT** omit the `statusCode` field in errors
4. **DO NOT** return errors directly with `res.status().json()`
5. **DO NOT** mix formats (e.g., `status: "success"` vs `success: true`)

## Compliance Verification

Before committing, verify:

- [ ] All success responses use `buildSuccessResponse`
- [ ] All errors are thrown as exceptions (not returned)
- [ ] Error format includes `statusCode`
- [ ] HTTP codes are appropriate (200, 201, 400, 401, 403, 404, 422, 500)
- [ ] No custom or inconsistent formats

## Complete Examples

### Complete Controller

```typescript
import { Request, Response, NextFunction } from "express";
import { buildSuccessResponse } from '@/utils/responseBuilder';
import { AuthenticationError, NotFoundError } from '@/utils/AppError';
import * as userService from '@/services/user.service';

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    
    const user = await userService.getUserById(id);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json(
      buildSuccessResponse(user, "User retrieved successfully")
    );
  } catch (error) {
    next(error);
  }
}
```

## Migrating Existing Code

If you find code that doesn't follow this standard:

1. Replace manual responses with `buildSuccessResponse`
2. Replace `res.status().json({ error: ... })` with `throw new ErrorClass(...)`
3. Ensure all errors pass through `next(error)`
4. Verify error format includes `statusCode`

## References

- `backend/src/utils/responseBuilder.ts` - Functions for success responses
- `backend/src/utils/AppError.ts` - Available error classes
- `backend/src/middlewares/errorHandler.middleware.ts` - Automatic error formatting
