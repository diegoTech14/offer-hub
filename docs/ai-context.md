# AI Context for OFFER-HUB

This document provides essential context for AI assistants working on the OFFER-HUB project.

## Project Overview

OFFER-HUB is a **self-hosted payments orchestrator** for marketplaces that provides escrow-protected payments and user balances without requiring marketplaces to build payment infrastructure. It's a monorepo containing both backend (NestJS) and frontend (Next.js) applications.

## Critical Design Principles

### 1. Visual Identity: Modern Neumorphic Bento
- **Design System:** Soft depth with 2.5D surfaces shaped by light and shadow
- **Primary Color:** `#149A9B` (teal) - The brand pulse
- **Background:** `#F1F3F7` - Light canvas for neumorphic shadows
- **Shadow Physics:** Light source at 145° (top-left)
- **Border Radius:** 16px for containers, 12px for interactive elements

### 2. Architecture Philosophy
- **Self-hosted only:** No multi-tenant SaaS
- **Non-custodial:** Funds locked in Trustless Work smart contracts on Stellar
- **Provider abstraction:** Strategy pattern for crypto vs Airtm
- **Idempotency-first:** All mutations require `Idempotency-Key`
- **State machines:** Strict transitions for orders, escrows, disputes

### 3. Technology Stack

**Backend:**
- NestJS (TypeScript)
- PostgreSQL (state, audit)
- Redis (BullMQ, idempotency, SSE)
- Stellar blockchain integration
- Trustless Work escrow contracts

**Frontend:**
- Next.js 14+ (App Router)
- Tailwind CSS 4 (with CSS variables)
- TypeScript
- Modern neumorphic design system

## Naming Conventions (STRICT)

### Files & Directories
- **Folders:** `kebab-case` (e.g., `auth-form/`, `user-dashboard/`)
- **React Components:** `PascalCase.tsx` (e.g., `OfferCard.tsx`)
- **Hooks:** `use-kebab-case.ts` (e.g., `use-client-auth.ts`)
- **Utilities:** `kebab-case.ts` (e.g., `sanitize-html.ts`)

### Code
- **Booleans:** `isLoading`, `hasError`, `canPerformAction`
- **Functions:** `camelCase` (`fetchUserDetails`, `handleSubmitForm`)
- **Event Handlers:** `handle[Subject][Action]` (e.g., `handleEmailChange`)
- **Props:** `on[Action]` (e.g., `onClose`, `onSubmit`)
- **Constants:** `UPPER_SNAKE_CASE` (`MAX_UPLOAD_SIZE`)
- **Types:** `PascalCase` (`ApiResponse`, `UserRole`)

## API Contract (MANDATORY)

All API responses MUST follow the `ApiResponse<T>` structure:

```typescript
{
  ok: boolean;           // Quick success check
  code: number;          // 1000: Success, 4001: Validation, 5000: Internal
  type: "success" | "error" | "warning";
  title: string;         // Short headline for UI
  message: string;       // Explicit feedback
  data: T | null;        // Actual payload
  errors: ValidationError[] | null;  // Field-level errors
}
```

## Design System Rules

### Neumorphic Shadows

**Elevated (Raised):**
```css
/* Light theme */
box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;

/* Hover state */
box-shadow: 2px 2px 4px #d1d5db, -2px -2px 4px #ffffff;
```

**Sunken (Inset):**
```css
box-shadow: inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff;
```

### Color Usage
- **Primary (`#149A9B`):** Progress, primary buttons, active states
- **Secondary (`#002333`):** Navbar, sidebar, footer backgrounds
- **Accent (`#15949C`):** Gradients, status highlights
- **Text Primary (`#19213D`):** Headings, body content
- **Text Secondary (`#6D758F`):** Captions, placeholders

### Animation Standards
- **fadeInUp:** 400ms ease-out, translateY(20px → 0)
- **scaleIn:** 300ms ease-out, scale(0.95 → 1)
- **Staggered lists:** 100ms delay per item

## Backend Module Structure

- **Auth:** API keys, scopes (read/write/support)
- **Users:** Create/get/list, wallet auto-creation
- **Balance:** Available + reserved, credit/debit operations
- **Orders:** State machine, reserve funds, escrow coordination
- **Escrow:** Trustless Work integration, fund/release/refund
- **Disputes:** Open/resolve, support scope
- **Events:** Internal bus, SSE streaming
- **Audit:** All mutations logged, secrets redacted

## Payment Flow (Crypto Mode - Default)

1. **Deposit:** User sends USDC → Stellar address → BlockchainMonitor → balance credited
2. **Order:** Create → reserve (available → reserved) → create escrow → fund escrow
3. **Work:** Order IN_PROGRESS
4. **Resolution:**
   - **Release:** 3 Stellar txs → seller balance credited
   - **Refund:** 2 Stellar txs → buyer balance credited
   - **Dispute SPLIT:** Resolve with custom amounts
5. **Withdrawal:** Send USDC to external address

## Security Requirements

- **API Keys:** Bearer token, hashed in DB
- **Secrets:** Never in responses or logs
- **Idempotency:** Prevent duplicate charges
- **Webhooks:** HMAC verification
- **Wallet Keys:** AES-256-GCM encrypted
- **Audit:** All mutations logged with redaction

## UI Standards

### Error Handling
- Component: `ErrorState`
- Colors: `text-error`, `RING_ERROR`
- Must provide `onRetry` button
- Message: Explain what happened and how to fix

### Success Handling
- Component: `Toast` or `StatusBadge`
- Colors: `text-success`, `bg-success/10`
- Icon: Check mark
- Message: Short, affirmative

### Loading States
- Use skeleton components
- Match exact dimensions of final component
- Prevent layout shift (CLS)

### Empty States
- Centered icon
- Encouraging message
- Primary CTA button

## Mock Data Strategy

Location: `src/data/`

Every domain must export:
- `[DOMAIN]_MOCK_SUCCESS`: Full response payload
- `[DOMAIN]_MOCK_EMPTY`: Empty data with `total: 0`
- `[DOMAIN]_MOCK_ERROR`: Error response with `ResponseCode`

Use static IDs (`usr_001`, `off_505`) for determinism.

## Common Patterns

### State Machines
Orders, escrows, disputes, top-ups, and withdrawals all use strict state machines. Only valid transitions are allowed.

### Provider Abstraction
`PaymentProvider` interface allows switching between `crypto` (default) and `airtm` via environment variable.

### Correlation IDs
All requests, orders, escrows, and provider calls are traceable via correlation IDs.

### Event-Driven
Internal event bus with SSE streaming for real-time updates.

## What NOT to Do

❌ Use flat drop shadows (use neumorphic physics)  
❌ Use spaces or PascalCase for directories  
❌ Return raw errors (use `ApiResponse<T>`)  
❌ Skip idempotency keys on mutations  
❌ Log or return secrets  
❌ Use generic colors (red, blue, green)  
❌ Create layout shift with loading states  
❌ Skip error retry buttons  
❌ Use browser default fonts  

## What TO Do

✅ Follow neumorphic shadow physics  
✅ Use strict naming conventions  
✅ Return `ApiResponse<T>` structure  
✅ Require `Idempotency-Key` on mutations  
✅ Redact secrets in logs and responses  
✅ Use curated color palette  
✅ Match skeleton dimensions to final components  
✅ Provide retry mechanisms  
✅ Use modern typography (Inter, Roboto, Outfit)  
✅ Implement state machines for workflows  
✅ Add staggered animations to lists  

## Key Files to Reference

- **Design System:** `docs/design/visual-dna.md`
- **API Contract:** `docs/standards/api-contract.md`
- **Naming:** `docs/standards/naming-conventions.md`
- **Architecture:** `docs/architecture/overview.md`
- **Project Context:** `docs/project-context.md`

## Mental Model

Think of OFFER-HUB as:
- **Backend:** The single API a marketplace talks to for payments and escrow
- **Frontend:** A modern neumorphic dashboard for managing offers and transactions
- **Orchestrator:** Coordinates state machines and provider calls, never holds escrow funds
- **Non-custodial:** Funds are in user wallets or Trustless Work contracts
- **Self-hosted:** Each marketplace runs its own instance

## Quick Reference

**Primary Brand Color:** `#149A9B`  
**Background:** `#F1F3F7`  
**Card Radius:** `16px`  
**Button Radius:** `12px`  
**Shadow Angle:** `145°` (top-left)  
**Animation Duration:** `400ms`  
**Stagger Delay:** `100ms`  
**API Success Code:** `1000`  
**Validation Error Code:** `4001`  
**Internal Error Code:** `5000`  

---

**Remember:** This project values visual excellence, strict conventions, and non-custodial security. Every component should feel premium, every API call should be idempotent, and every state transition should be validated.
