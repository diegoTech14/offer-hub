# API Response Standards

This document defines the standard format for all API responses, both successful and error responses.

## General Structure

All API responses follow a consistent structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
}
```

## Successful Responses

### Simple Response (200 OK)

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "123",
    "name": "John Doe"
  }
}
```

### Creation Response (201 Created)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "123",
    "email": "user@example.com",
    "created_at": "2025-12-16T10:30:00.000Z"
  }
}
```

### List Response

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "123",
      "name": "John Doe"
    },
    {
      "id": "456",
      "name": "Jane Smith"
    }
  ]
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "123",
      "name": "John Doe"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "per_page": 10
  }
}
```

## Error Responses

See complete documentation in [ERROR_HANDLING.md](./ERROR_HANDLING.md)

### Error Structure

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

## Using Helpers

### buildSuccessResponse

For simple successful responses:

```typescript
import { buildSuccessResponse } from '@/utils/responseBuilder';

// In controller
return res.status(200).json(
  buildSuccessResponse(user, 'User retrieved successfully')
);
```

### buildListResponse

For lists of items:

```typescript
import { buildListResponse } from '@/utils/responseBuilder';

return res.status(200).json(
  buildListResponse(users, 'Users retrieved successfully')
);
```

### buildPaginatedResponse

For paginated responses:

```typescript
import { buildPaginatedResponse } from '@/utils/responseBuilder';

return res.status(200).json(
  buildPaginatedResponse(
    users,
    'Users retrieved successfully',
    {
      current_page: 1,
      total_pages: 10,
      total_items: 100,
      per_page: 10
    }
  )
);
```

## HTTP Status Codes

### Success

| Code | Usage | Example |
|------|-------|---------|
| 200 | OK - Successful operation | Successful GET, PUT, PATCH |
| 201 | Created - Resource created | Successful POST |
| 204 | No Content - No content | Successful DELETE |

### Error

| Code | Usage | Example |
|------|-------|---------|
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | Invalid token |
| 403 | Forbidden | No permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Internal Server Error | Server error |

## Examples by Endpoint

### GET /api/users/:id

**Success (200)**:
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "123",
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2025-12-16T10:30:00.000Z"
  }
}
```

**Error (404)**:
```json
{
  "success": false,
  "error": {
    "type": "USER_NOT_FOUND",
    "message": "User not found",
    "details": { "userId": "123" },
    "code": "USER_NOT_FOUND",
    "timestamp": "2025-12-16T10:30:00.000Z"
  }
}
```

### POST /api/users

**Success (201)**:
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "123",
    "email": "user@example.com",
    "username": "johndoe",
    "created_at": "2025-12-16T10:30:00.000Z"
  }
}
```

**Error (400 - Validation)**:
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Invalid email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ],
    "code": "VALIDATION_ERROR",
    "timestamp": "2025-12-16T10:30:00.000Z"
  }
}
```

**Error (409 - Duplicate)**:
```json
{
  "success": false,
  "error": {
    "type": "DUPLICATE_ENTRY",
    "message": "Email is already registered",
    "details": { "email": "user@example.com" },
    "code": "DUPLICATE_ENTRY",
    "timestamp": "2025-12-16T10:30:00.000Z"
  }
}
```

### GET /api/users (Paginated List)

**Success (200)**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "123",
      "email": "user1@example.com",
      "username": "user1"
    },
    {
      "id": "456",
      "email": "user2@example.com",
      "username": "user2"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50,
    "per_page": 10
  }
}
```

### PUT /api/users/:id

**Success (200)**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "123",
    "email": "updated@example.com",
    "username": "updateduser",
    "updated_at": "2025-12-16T11:00:00.000Z"
  }
}
```

### DELETE /api/users/:id

**Success (200)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

Or with 204 (No Content) status code without body.

## Response Messages

### Message Conventions

- **Clear and specific**: "User created successfully" instead of "OK"
- **In English**: All messages in English
- **Consistent**: Use the same format for similar operations
- **Actionable**: In errors, indicate what can be done

### Message Templates

| Operation | Success Message |
|-----------|----------------|
| Create | "{Resource} created successfully" |
| Get | "{Resource} retrieved successfully" |
| List | "{Resources} retrieved successfully" |
| Update | "{Resource} updated successfully" |
| Delete | "{Resource} deleted successfully" |

## Response Validation

### In Development

In development mode, error responses include additional information:

```json
{
  "success": false,
  "error": {
    "type": "USER_NOT_FOUND",
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "timestamp": "2025-12-16T10:30:00.000Z",
    "stack": "Error: User not found\n    at UserService.getUserById...",
    "url": "/api/users/123",
    "method": "GET"
  }
}
```

### In Production

In production, sensitive information is hidden:

```json
{
  "success": false,
  "error": {
    "type": "USER_NOT_FOUND",
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "timestamp": "2025-12-16T10:30:00.000Z"
  }
}
```

## Best Practices

1. **Always use helpers**: Use `buildSuccessResponse`, `buildListResponse`, etc.
2. **Consistent messages**: Maintain the same format across the project
3. **Correct HTTP codes**: Use the appropriate code for each operation
4. **Consistent structure**: All responses must follow the same format
5. **Don't expose internal details**: In production, don't include stack traces
6. **Pagination when needed**: For large lists, always include pagination
