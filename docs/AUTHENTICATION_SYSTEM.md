# Authentication System

This document describes the architecture, flows, and technical specifications of the Offer Hub authentication system.

## Table of Contents

- [System Architecture](#system-architecture)
- [Authentication Flows](#authentication-flows)
- [Token Management](#token-management)
- [Data Model](#data-model)
- [Security Measures](#security-measures)
- [Implementation Details](#implementation-details)

## System Architecture

The system uses a hybrid architecture that combines traditional authentication (Email/Password), OAuth (Social Login), and Web3 technologies (Stellar Wallets).

### Main Components

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │  AuthProvider   │  │ WalletProvider  │  │  OAuth Buttons  │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Backend (Express)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   AuthService   │  │  WalletService  │  │   OAuthService  │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│  ┌─────────────────┐  ┌─────────────────┐                           │
│  │  TokenService   │  │  EmailService   │                           │
│  └─────────────────┘  └─────────────────┘                           │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Database (Supabase)                           │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │  users   │  │ wallets  │  │ refresh_tokens │  │ oauth_provs  │   │
│  └──────────┘  └──────────┘  └────────────────┘  └──────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Backend Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| AuthService | `/backend/src/services/auth.service.ts` | Main authentication logic |
| WalletService | `/backend/src/services/wallet.service.ts` | Stellar wallet management |
| OAuthService | `/backend/src/services/oauth/` | OAuth provider integration |
| EmailService | `/backend/src/services/email.service.ts` | Email notifications |

### Frontend Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| AuthProvider | `/src/providers/` | Global authentication context |
| WalletProvider | `/src/providers/` | Wallet connection context |
| Auth Hooks | `/src/hooks/` | Authentication-related hooks |

## Authentication Flows

### Registration (Email/Password)

```
┌──────┐     ┌──────────┐     ┌─────┐     ┌────┐     ┌─────────┐
│ User │     │ Frontend │     │ API │     │ DB │     │ Stellar │
└──┬───┘     └────┬─────┘     └──┬──┘     └─┬──┘     └────┬────┘
   │              │              │          │             │
   │  Fill form   │              │          │             │
   │─────────────>│              │          │             │
   │              │              │          │             │
   │              │ POST /auth/register     │             │
   │              │─────────────>│          │             │
   │              │              │          │             │
   │              │              │ Check email unique     │
   │              │              │─────────>│             │
   │              │              │          │             │
   │              │              │ Generate Keypair       │
   │              │              │────────────────────────>
   │              │              │          │             │
   │              │              │ Create user + wallet   │
   │              │              │─────────>│             │
   │              │              │          │             │
   │              │              │ Send verification email│
   │              │              │──────────────────────> │
   │              │              │          │             │
   │              │ 201 Created  │          │             │
   │              │<─────────────│          │             │
   │              │              │          │             │
   │  Success     │              │          │             │
   │<─────────────│              │          │             │
```

**Request**:
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "username": "johndoe"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "email_verified": false
  }
}
```

### Login (Email/Password)

```
┌──────┐     ┌──────────┐     ┌─────┐     ┌────┐
│ User │     │ Frontend │     │ API │     │ DB │
└──┬───┘     └────┬─────┘     └──┬──┘     └─┬──┘
   │              │              │          │
   │ Enter creds  │              │          │
   │─────────────>│              │          │
   │              │              │          │
   │              │ POST /auth/login        │
   │              │─────────────>│          │
   │              │              │          │
   │              │              │ Find user by email
   │              │              │─────────>│
   │              │              │          │
   │              │              │ Verify password (bcrypt)
   │              │              │          │
   │              │              │ Check email verified
   │              │              │          │
   │              │              │ Generate tokens
   │              │              │          │
   │              │              │ Store refresh token
   │              │              │─────────>│
   │              │              │          │
   │              │ 200 OK + tokens         │
   │              │<─────────────│          │
   │              │              │          │
   │ Store tokens │              │          │
   │<─────────────│              │          │
```

**Request**:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
  }
}
```

### OAuth Login (Google/GitHub/etc.)

```
┌──────┐     ┌──────────┐     ┌─────┐     ┌──────────┐     ┌────┐
│ User │     │ Frontend │     │ API │     │ Provider │     │ DB │
└──┬───┘     └────┬─────┘     └──┬──┘     └────┬─────┘     └─┬──┘
   │              │              │             │             │
   │ Click OAuth  │              │             │             │
   │─────────────>│              │             │             │
   │              │              │             │             │
   │              │ GET /auth/google          │             │
   │              │─────────────>│             │             │
   │              │              │             │             │
   │              │ Redirect URL │             │             │
   │              │<─────────────│             │             │
   │              │              │             │             │
   │ Redirect to Google          │             │             │
   │<─────────────│              │             │             │
   │              │              │             │             │
   │ Authorize    │              │             │             │
   │──────────────────────────────────────────>│             │
   │              │              │             │             │
   │ Callback with code          │             │             │
   │<─────────────────────────────────────────│             │
   │              │              │             │             │
   │              │ GET /auth/google/callback?code=...      │
   │              │─────────────>│             │             │
   │              │              │             │             │
   │              │              │ Exchange code for profile │
   │              │              │────────────>│             │
   │              │              │             │             │
   │              │              │ Find or create user       │
   │              │              │────────────────────────────>
   │              │              │             │             │
   │              │ Redirect with tokens       │             │
   │              │<─────────────│             │             │
```

**Supported Providers**:
- Google
- GitHub
- Apple
- Microsoft

### Password Recovery

**Step 1: Request Reset**

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

**Step 2: Reset Password**

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ss123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Token Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "current-refresh-token"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

## Token Management

### Access Token

| Property | Value |
|----------|-------|
| Format | JWT (HS256) |
| Lifetime | 15 minutes |
| Storage | Memory (Frontend) |
| Transport | `Authorization: Bearer <token>` |

**Payload**:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["user"],
  "iat": 1704614400,
  "exp": 1704615300
}
```

### Refresh Token

| Property | Value |
|----------|-------|
| Format | Opaque string or JWT |
| Lifetime | 7 days |
| Storage | HttpOnly Secure Cookie (recommended) |
| Rotation | Each use invalidates previous token |

### Token Rotation

For enhanced security, refresh tokens are rotated on each use:

1. Client sends refresh token
2. Server validates and invalidates the old token
3. Server generates new access and refresh tokens
4. Server stores new refresh token hash
5. Client receives new tokens

This prevents token reuse attacks.

## Data Model

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),              -- NULL for OAuth-only users
    username VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',     -- active, suspended, locked
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Wallets Table

```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    public_key VARCHAR(56) NOT NULL,         -- Stellar public key
    type VARCHAR(50) NOT NULL,               -- 'invisible' or 'external'
    enc_private_key TEXT,                    -- Encrypted private key (invisible only)
    provider VARCHAR(50) DEFAULT 'internal', -- 'internal', 'freighter', etc.
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### OAuth Providers Table

```sql
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,           -- 'google', 'github', etc.
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);
```

## Security Measures

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 15 minutes |
| `/auth/register` | 3 attempts | 1 hour |
| `/auth/forgot-password` | 3 attempts | 1 hour |
| `/auth/refresh` | 10 attempts | 1 minute |

### Account Lockout

- Account locked after 5 failed login attempts
- Lockout duration: 30 minutes
- Lockout cleared on successful password reset

### CSRF Protection

- CSRF tokens required for state-changing operations
- Token validated on server-side
- Double-submit cookie pattern

### Secure Headers

```typescript
// Applied via helmet middleware
{
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}
```

## Implementation Details

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### JWT Generation

```typescript
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
};
```

### Wallet Encryption

Private keys for invisible wallets are encrypted using AES-256-GCM:

```typescript
import crypto from 'crypto';

export const encryptPrivateKey = (
  privateKey: string,
  encryptionKey: string
): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  );

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `EMAIL_NOT_VERIFIED` | 401 | Email verification required |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked |
| `TOKEN_EXPIRED` | 401 | Access or refresh token expired |
| `TOKEN_INVALID` | 401 | Token malformed or tampered |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `OAUTH_FAILED` | 400 | OAuth authentication failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

## Best Practices

1. **Never log sensitive data** - Passwords, tokens, private keys
2. **Use HTTPS only** - All authentication endpoints
3. **Validate all inputs** - Email format, password strength
4. **Sanitize user data** - Prevent XSS and injection attacks
5. **Use secure cookies** - HttpOnly, Secure, SameSite flags
6. **Implement logout properly** - Revoke all tokens
7. **Monitor failed attempts** - Log and alert on suspicious activity
8. **Keep dependencies updated** - Security patches
