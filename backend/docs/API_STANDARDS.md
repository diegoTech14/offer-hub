# API Standards - Complete Standards Guide

## 📋 Executive Summary

This document establishes **ALL mandatory standards** for API development in the Offer-Hub backend. **NO exceptions**. All endpoints, controllers, services, and responses must strictly follow these standards.

## 🎯 Objective

Ensure:
- **Total consistency** across all responses
- **Uniform format** for errors and successes
- **Ease of maintenance** of code
- **Better experience** for API consumers
- **Best practices** in development

## 📚 Related Documents

1. **[API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md)** - Success and error response formats
2. **[ERROR_HANDLING_AND_VALIDATION.md](./ERROR_HANDLING_AND_VALIDATION.md)** - Error handling and validation system
3. This document - Executive summary and checklist

## ✅ Compliance Checklist

Before committing any endpoint, verify:

### Success Responses
- [ ] Uses `buildSuccessResponse()` or `buildSuccessResponseWithoutData()`
- [ ] Includes `success: true`
- [ ] Includes descriptive `message`
- [ ] Correct HTTP code (200 for GET/PUT/DELETE, 201 for POST)
- [ ] Structure: `{ success, message, data?, metadata? }`

### Error Responses
- [ ] Throws exception (DO NOT return error manually)
- [ ] Uses appropriate error class (AuthenticationError, ValidationError, etc.)
- [ ] Error includes `statusCode` in body
- [ ] Structure: `{ success: false, error: { type, message, code, statusCode, timestamp, details? } }`
- [ ] HTTP code matches `error.statusCode`

### Controller Code
- [ ] Uses `try/catch` with `next(error)`
- [ ] DOES NOT format errors manually
- [ ] DOES NOT return errors with `res.status().json()`
- [ ] Uses `responseBuilder` for success responses
- [ ] Validates inputs before calling service

### Validation
- [ ] Uses project validation functions (`validateEmail`, `validateUUID`, etc.)
- [ ] Throws `ValidationError` with details if validation fails
- [ ] Does not validate manually with `if` statements when validators are available

## 🔴 Common Mistakes to Avoid

### ❌ Incorrect Error Format
```typescript
// BAD - Don't do this
res.status(401).json({ error: "Invalid credentials" });
res.status(404).json({ message: "Not found" });
res.status(400).json({ success: false, message: "Error" });
```

### ✅ Correct Format
```typescript
// GOOD - Do this
throw new AuthenticationError("Invalid email or password");
throw new NotFoundError("User not found");
throw new ValidationError("Validation failed", errors);
```

### ❌ Manual Success Response
```typescript
// BAD - Don't do this
res.status(200).json({ status: "success", user });
res.status(201).json({ user, message: "Created" });
```

### ✅ Correct Response
```typescript
// GOOD - Do this
res.status(200).json(buildSuccessResponse(user, "User retrieved"));
res.status(201).json(buildSuccessResponse(user, "User created"));
```

## 📖 Quick References

### Available Error Classes

```typescript
import {
  AuthenticationError,    // 401 - Invalid credentials
  AuthorizationError,     // 403 - Insufficient permissions
  ValidationError,        // 422 - Validation failed
  NotFoundError,          // 404 - Resource not found
  BadRequestError,        // 400 - Malformed request
  ConflictError,          // 409 - Conflict (duplicate)
  DatabaseError,          // 500 - Database error
  InternalServerError     // 500 - Internal error
} from '@/utils/AppError';
```

### Response Functions

```typescript
import {
  buildSuccessResponse,              // With data
  buildSuccessResponseWithoutData,    // Without data
  buildPaginatedResponse             // With pagination
} from '@/utils/responseBuilder';
```

### Standard HTTP Codes

- **200**: Success (GET, PUT, PATCH, DELETE)
- **201**: Created (POST)
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Unprocessable Entity (Validation)
- **500**: Internal Server Error

## 🔍 Automatic Verification

### Before Commit

1. Review that all endpoints follow the standard format
2. Verify that errors include `statusCode`
3. Confirm that success responses use `buildSuccessResponse`
4. Test endpoints in Postman/Thunder Client
5. Verify that HTTP codes are correct

### Test Example

```bash
# Successful login test
POST /api/auth/login
Body: { "email": "test@example.com", "password": "password123" }
Expected: 200, { success: true, message: "...", data: {...} }

# Authentication error test
POST /api/auth/login
Body: { "email": "wrong@example.com", "password": "wrong" }
Expected: 401, { success: false, error: { type: "AUTHENTICATION_ERROR", statusCode: 401, ...} }
```

## 📝 Controller Template

Copy this template for new endpoints:

```typescript
import { Request, Response, NextFunction } from "express";
import { buildSuccessResponse } from '@/utils/responseBuilder';
import { ValidationError, NotFoundError } from '@/utils/AppError';
import * as myService from '@/services/my.service';

export async function myHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Validation
    if (!req.body.requiredField) {
      throw new ValidationError("Required field is missing");
    }

    // 2. Service call
    const result = await myService.doSomething(req.body);

    // 3. Success response
    res.status(200).json(
      buildSuccessResponse(result, "Operation successful")
    );
  } catch (error) {
    // 4. Pass error to middleware
    next(error);
  }
}
```

## 🚨 Golden Rules

1. **NEVER** format errors manually in controllers
2. **ALWAYS** use `buildSuccessResponse` for success responses
3. **ALWAYS** throw exceptions, don't return errors
4. **ALWAYS** include `statusCode` in errors (automatic with classes)
5. **ALWAYS** use `next(error)` to pass errors to middleware
6. **NEVER** mix different formats

## 📞 Support

If you have questions about the correct format:
1. Review examples in `API_RESPONSE_FORMAT.md`
2. Consult `ERROR_HANDLING_AND_VALIDATION.md` for errors
3. Review existing controllers that follow the standard
4. Ask the team before implementing custom formats

---

**Last updated**: 2025-12-23
**Version**: 1.0.0
