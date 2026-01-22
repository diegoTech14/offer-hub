# Code Style Standards

This document defines code style standards and best practices for the Offer Hub project.

## General

### Comments

- **Language**: All code comments must be in **English**
- **Purpose**: Explain the "why", not the "what" (code already does that)
- **Format**: Use `//` for line comments and `/* */` for blocks

```typescript
// Validate user authentication before processing
if (!user.isAuthenticated) {
  throw new AuthenticationError('User not authenticated');
}

// Calculate total with discount applied
const total = subtotal * (1 - discount);
```

### Imports

- **Order**: External libraries → Internal → Relative
- **Grouping**: Separate with blank line between groups
- **Absolute paths**: Prefer `@/` over relative paths when possible

```typescript
// External libraries
import express from 'express';
import { Request, Response } from 'express';

// Internal modules
import { UserService } from '@/services/user.service';
import { AppError } from '@/utils/AppError';

// Relative imports
import { localHelper } from './helpers';
```

## TypeScript

### Types and Interfaces

- **Interfaces**: For objects that can be extended
- **Types**: For unions, intersections, and more complex types
- **Names**: PascalCase

```typescript
// Interface for objects
interface User {
  id: string;
  email: string;
  name: string;
}

// Type for unions
type UserRole = 'freelancer' | 'client' | 'admin';

// Type for functions
type EventHandler = (event: Event) => void;
```

### Functions

- **Arrow functions**: For short functions and callbacks
- **Function declarations**: For main and exported functions
- **Async/await**: Prefer over Promises with `.then()`

```typescript
// Arrow function for callback
const handleClick = (event: MouseEvent) => {
  console.log('Clicked');
};

// Function declaration for main function
export async function getUserById(id: string): Promise<User> {
  const user = await UserService.findById(id);
  return user;
}
```

### Variables

- **const**: By default, use `const`
- **let**: Only when variable needs reassignment
- **Avoid var**: Never use `var`

```typescript
const userName = 'john_doe';
let counter = 0;
counter++; // OK, using let
```

## React/Next.js

### Components

- **Functional Components**: Always use functional components
- **Hooks**: Use custom hooks for reusable logic
- **Props**: Define types/interfaces for props

```typescript
interface UserProfileProps {
  userId: string;
  showEmail?: boolean;
}

export const UserProfile = ({ userId, showEmail = false }: UserProfileProps) => {
  const { user, loading } = useUserData(userId);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>{user.name}</h1>
      {showEmail && <p>{user.email}</p>}
    </div>
  );
};
```

### Custom Hooks

- **Prefix**: Always start with `use`
- **Single purpose**: Each hook should have a clear responsibility
- **Consistent return**: Return object with named properties

```typescript
// use-user-data.ts
export const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch user data
  }, [userId]);

  return { user, loading, error };
};
```

## Backend

### Controllers

- **Single responsibility**: Each method should do one thing
- **Early validation**: Validate inputs at the start
- **Delegate logic**: Business logic goes in services

```typescript
export class UserController {
  async getUser(req: Request, res: Response) {
    const { id } = req.params;

    // Validate early
    if (!id) {
      throw new AppError('ID is required', 400, 'REQUIRED_FIELD');
    }

    // Delegate to service
    const user = await UserService.getUserById(id);

    // Return response
    return res.status(200).json(
      buildSuccessResponse(user, 'User retrieved successfully')
    );
  }
}
```

### Services

- **Static methods**: For stateless services
- **Classes**: For services with state or dependency injection
- **Pure functions**: When possible, use pure functions

```typescript
export class UserService {
  static async getUserById(id: string): Promise<User> {
    // Business logic here
    const user = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (!user.data) {
      throw new NotFoundError('User', { userId: id });
    }

    return user.data;
  }
}
```

## File Structure

### Organization

```
src/
├── components/          # React components
│   └── user-profile/    # Component with multiple files
│       ├── user-profile.tsx
│       └── user-profile.styles.ts
├── hooks/               # Custom hooks
│   └── use-user-data.ts
├── pages/               # Pages (orchestration only)
│   └── user-page.tsx
└── types/               # TypeScript types
    └── user-types.ts
```

### Separation of Concerns

- **Logic**: In hooks (`/src/hooks`)
- **UI**: In components (`/src/components`)
- **Types**: In types (`/src/types`)
- **Pages**: Orchestration only (`/src/pages`)

## Error Handling

See complete documentation in [ERROR_HANDLING.md](./ERROR_HANDLING.md)

- **Always use AppError**: Don't throw generic errors
- **Try/catch**: In async/await functions
- **Clear messages**: Errors should be understandable

```typescript
try {
  const user = await UserService.getUserById(id);
  return res.json(buildSuccessResponse(user, 'User found'));
} catch (error) {
  // Re-throw for middleware to handle
  throw error;
}
```

## Testing

### Test Names

- **Format**: `describe` for groups, `it` or `test` for cases
- **Clear description**: Should explain what is being tested

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when id exists', async () => {
      // Test implementation
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Test implementation
    });
  });
});
```

## Linting and Formatting

- **ESLint**: Configured in the project
- **Prettier**: For consistent formatting (if configured)
- **Pre-commit hooks**: Run lint before commit

## Best Practices

1. **DRY (Don't Repeat Yourself)**: Avoid duplicate code
2. **KISS (Keep It Simple, Stupid)**: Keep code simple
3. **Single Responsibility**: Each function/class should do one thing
4. **Descriptive names**: Variables and functions with clear names
5. **Useful comments**: Only when code is not self-explanatory
6. **Consistency**: Follow project standards
