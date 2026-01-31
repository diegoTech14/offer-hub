Title: Add GET /api/v1/wallets - List User Wallets

Summary
-------
Implements an authenticated endpoint to list all wallets for the signed-in user. Returns system-generated (invisible) and external wallets, ordered with the primary wallet first and newest wallets next. Never exposes encrypted private keys.

Changes
-------
- Controller: `backend/src/controllers/wallet.controller.ts`
  - Added `getWalletsHandler` to format and return safe wallet objects.
- Route: `backend/src/routes/wallet.routes.ts`
  - Added `GET /api/v1/wallets` route (protected by `verifyToken`).
- Tests: `backend/src/__tests__/controllers/wallet.controller.test.ts`
  - Added unit tests validating ordering, formatting, and auth behaviour.

Acceptance Criteria
-------------------
- Requires valid JWT (401 when missing)
- Returns all wallets for authenticated user
- Includes fields: `id`, `public_key`, `type`, `provider`, `is_primary`, `created_at`
- NEVER includes `enc_private_key` or any private key material
- Ordered by `is_primary` DESC, then `created_at` DESC
- Returns empty array when user has no wallets

How to test locally
-------------------
1. Run backend tests:

```bash
cd backend
npm test -- src/__tests__/controllers/wallet.controller.test.ts --runInBand
```

2. Start server and call endpoint (with JWT):

```bash
npm run dev
# then GET /api/v1/wallets with Authorization: Bearer <token>
```

Notes
-----
- This PR contains only server-side changes (controller, route, tests). If you prefer a different branch name or PR title, tell me and I will update it.
