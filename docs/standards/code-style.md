# Coding Standards & Style Guide

## 🎯 General Principles

1. **Clarity over cleverness**: Write code that's easy to understand
2. **Consistency is king**: Follow established patterns
3. **Performance matters**: Optimize for speed and user experience
4. **Security first**: Always consider security implications
5. **Test your code**: No untested code in production
6. **Document decisions**: Explain the "why", not just the "what"

## 📝 TypeScript Standards

### Type Safety

**Always use strict mode:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Explicit return types:**

```typescript
// ✅ Good - Explicit return type
function calculateTotal(items: OfferItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad - Implicit return type
function calculateTotal(items: OfferItem[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

**Avoid `any` type:**

```typescript
// ✅ Good - Proper typing
interface ApiResponse<T> {
  data: T;
  status: number;
}

function fetchData<T>(): Promise<ApiResponse<T>> {
  // Implementation
}

// ❌ Bad - Using any
function fetchData(): Promise<any> {
  // Implementation
}
```

**Use discriminated unions:**

```typescript
// ✅ Good - Type-safe state
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function handleState<T>(state: RequestState<T>) {
  if (state.status === "success") {
    console.log(state.data); // TypeScript knows data exists
  }
}

// ❌ Bad - Unclear state
interface RequestState<T> {
  status: string;
  data?: T;
  error?: string;
}
```

### Naming Conventions

**Variables and Functions:**
```typescript
// ✅ Good - camelCase
const userOffer = getUserOffer();
const offerCount = offers.length;
function calculateTotalCompensation() {}

// ❌ Bad
const UserOffer = getUserOffer();
const offer_count = offers.length;
function CalculateTotalCompensation() {}
```

**Constants:**
```typescript
// ✅ Good - UPPER_SNAKE_CASE for true constants
const MAX_OFFERS_PER_USER = 100;
const API_BASE_URL = "https://api.example.com";
const DEFAULT_TIMEOUT = 5000;

// ❌ Bad
const maxOffersPerUser = 100;
const ApiBaseUrl = "https://api.example.com";
```

**Classes and Types:**
```typescript
// ✅ Good - PascalCase
class OfferManager {}
interface OfferData {}
type ApiResponse<T> = { data: T };

// ❌ Bad
class offerManager {}
interface offer_data {}
type apiResponse<T> = { data: T };
```

**Files:**
```typescript
// ✅ Good
// Components: PascalCase.tsx
OfferCard.tsx
ComparisonTable.tsx

// Utilities: kebab-case.ts
format-currency.ts
calculate-equity.ts

// Types: kebab-case.types.ts
offer.types.ts
user.types.ts

// ❌ Bad
offercard.tsx
offer_card.tsx
FormatCurrency.ts
```

### File Structure

**Consistent component structure:**

```typescript
"use client"; // Only if client component

// 1. Imports (grouped)
import { useState } from "react";              // External deps
import { type NextPage } from "next";

import { Button } from "@/components/ui";      // Internal imports
import { useOffers } from "@/hooks/use-offers";
import { formatCurrency } from "@/lib/utils";

import type { Offer } from "@/types/offer";    // Type imports

import "./styles.css";                          // Styles (if any)

// 2. Types/Interfaces
interface OfferCardProps {
  offer: Offer;
  onEdit?: (offer: Offer) => void;
  onDelete?: (id: string) => void;
}

// 3. Constants (component-level)
const CURRENCY_FORMAT = "USD";
const MAX_TITLE_LENGTH = 50;

// 4. Component
export function OfferCard({ offer, onEdit, onDelete }: OfferCardProps) {
  // 4a. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 4b. Derived state / computations
  const totalComp = calculateTotal(offer);

  // 4c. Event handlers
  const handleEdit = () => {
    onEdit?.(offer);
  };

  // 4d. Effects
  useEffect(() => {
    // Effects here
  }, []);

  // 4e. Early returns
  if (!offer) return null;

  // 4f. Render
  return (
    <div className="offer-card">
      {/* JSX */}
    </div>
  );
}
```

## ⚛️ React/Next.js Patterns

### Server vs Client Components

```typescript
// ✅ Good - Server Component (default)
// No "use client" needed
export default function OffersPage() {
  // Can fetch data directly
  const offers = await getOffers();
  return <OffersList offers={offers} />;
}

// ✅ Good - Client Component (when needed)
"use client";

import { useState } from "react";

export function OfferForm() {
  const [formData, setFormData] = useState({});
  // Uses state, events, browser APIs
  return <form onSubmit={handleSubmit}>...</form>;
}

// ❌ Bad - Unnecessary "use client"
"use client";

export function StaticComponent() {
  // No state, no effects, no browser APIs
  return <div>Static content</div>;
}
```

### Props Typing

```typescript
// ✅ Good - Explicit props interface
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = "primary", size = "md", children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Bad - Inline props
export function Button(props: { variant?: string; size?: string; children: any; onClick?: any }) {
  // ...
}
```

### Hooks Rules

```typescript
// ✅ Good - Hooks at top level
function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  return { offers, loading };
}

// ❌ Bad - Conditional hooks
function useOffers(shouldFetch: boolean) {
  if (shouldFetch) {
    const [offers, setOffers] = useState([]); // ❌ Conditional hook
  }
}
```

## 🎨 Styling Standards

### Tailwind CSS

**Mobile-first approach:**

```tsx
// ✅ Good - Mobile first
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// ❌ Bad - Desktop first
<div className="text-lg md:text-base sm:text-sm">
  Not mobile first
</div>
```

**Logical grouping:**

```tsx
// ✅ Good - Grouped by category
<div className="
  flex flex-col items-center justify-center gap-4
  p-6 rounded-xl
  bg-white shadow-lg
  hover:shadow-xl transition-shadow
">
  Content
</div>

// ❌ Bad - Random order
<div className="gap-4 bg-white flex p-6 shadow-lg hover:shadow-xl rounded-xl flex-col transition-shadow justify-center items-center">
  Content
</div>
```

**Use `cn()` utility:**

```typescript
import { cn } from "@/lib/cn";

// ✅ Good - Proper merging
<button className={cn(
  "base-class",
  variant === "primary" && "bg-blue-500",
  className
)}>
  Button
</button>

// ❌ Bad - Template literals
<button className={`base-class ${variant === "primary" ? "bg-blue-500" : ""} ${className}`}>
  Button
</button>
```

## 🔍 Import Organization

```typescript
// 1. External dependencies (alphabetical)
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";

// 2. Internal imports (alphabetical)
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

// 3. Type imports (alphabetical)
import type { Offer } from "@/types/offer";
import type { User } from "@/types/user";

// 4. Styles (if separate)
import "./component.css";
```

## 📚 Documentation Standards

### Function Documentation

```typescript
/**
 * Calculates the total compensation including base salary, bonus, and equity value.
 *
 * @param offer - The offer object containing compensation details
 * @param equityMultiplier - Multiplier to convert equity to cash equivalent (default: 1)
 * @returns Total compensation value in USD
 *
 * @example
 * const total = calculateTotalCompensation(offer, 0.8);
 * console.log(total); // 175000
 */
export function calculateTotalCompensation(
  offer: Offer,
  equityMultiplier: number = 1
): number {
  const base = offer.baseSalary;
  const bonus = offer.bonus || 0;
  const equity = (offer.equityValue || 0) * equityMultiplier;

  return base + bonus + equity;
}
```

### Inline Comments

```typescript
// ✅ Good - Explains why
// Using binary search here because the offers array is always sorted by date
// and can contain up to 10k items. Linear search would be O(n).
const index = binarySearch(sortedOffers, targetDate);

// ❌ Bad - States the obvious
// Loop through offers
for (const offer of offers) {
  // Add offer to total
  total += offer.salary;
}
```

### Component Documentation

```typescript
/**
 * OfferCard - Displays a single job offer with key details
 *
 * Features:
 * - Expandable details view
 * - Edit/delete actions
 * - Responsive design
 *
 * @component
 * @example
 * <OfferCard
 *   offer={offerData}
 *   onEdit={(offer) => console.log(offer)}
 *   onDelete={(id) => console.log(id)}
 * />
 */
export function OfferCard({ offer, onEdit, onDelete }: OfferCardProps) {
  // Implementation
}
```

## 🧪 Testing Standards

### Test Structure

```typescript
describe("calculateTotalCompensation", () => {
  describe("with valid offer data", () => {
    it("calculates total with base salary only", () => {
      const offer = { baseSalary: 100000 };
      expect(calculateTotalCompensation(offer)).toBe(100000);
    });

    it("includes bonus in calculation", () => {
      const offer = { baseSalary: 100000, bonus: 10000 };
      expect(calculateTotalCompensation(offer)).toBe(110000);
    });

    it("applies equity multiplier correctly", () => {
      const offer = { baseSalary: 100000, equityValue: 50000 };
      expect(calculateTotalCompensation(offer, 0.8)).toBe(140000);
    });
  });

  describe("with edge cases", () => {
    it("handles missing optional fields", () => {
      const offer = { baseSalary: 100000 };
      expect(calculateTotalCompensation(offer)).toBe(100000);
    });

    it("handles zero values", () => {
      const offer = { baseSalary: 0, bonus: 0, equityValue: 0 };
      expect(calculateTotalCompensation(offer)).toBe(0);
    });
  });
});
```

## 🔐 Security Standards

### Input Validation

```typescript
// ✅ Good - Validate all inputs
import { z } from "zod";

const offerSchema = z.object({
  title: z.string().min(1).max(100),
  baseSalary: z.number().positive(),
  company: z.string().min(1).max(100),
  email: z.string().email(),
});

function createOffer(data: unknown) {
  const validated = offerSchema.parse(data); // Throws if invalid
  // Proceed with validated data
}

// ❌ Bad - No validation
function createOffer(data: any) {
  // Direct use without validation
  saveOffer(data);
}
```

### Secure Secrets

```typescript
// ✅ Good - Use environment variables
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY environment variable is required");
}

// ❌ Bad - Hardcoded secrets
const apiKey = "sk-1234567890abcdef"; // ❌ Never do this
```

## 📊 Performance Standards

### Avoid Premature Optimization

```typescript
// ✅ Good - Clear, readable code
function findOffer(offers: Offer[], id: string): Offer | undefined {
  return offers.find((offer) => offer.id === id);
}

// ❌ Bad - Premature optimization (for small arrays)
function findOffer(offers: Offer[], id: string): Offer | undefined {
  // Complex binary search for unsorted array of 10 items
  // ...100 lines of code...
}
```

### Memoization

```typescript
// ✅ Good - Memoize expensive calculations
import { useMemo } from "react";

function OfferAnalytics({ offers }: Props) {
  const statistics = useMemo(() => {
    return calculateComplexStatistics(offers);
  }, [offers]);

  return <div>{statistics}</div>;
}

// ❌ Bad - Recalculate on every render
function OfferAnalytics({ offers }: Props) {
  const statistics = calculateComplexStatistics(offers); // Runs every render
  return <div>{statistics}</div>;
}
```

## ✅ Code Review Checklist

Before submitting a PR, ensure:

- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] Follows naming conventions
- [ ] Includes proper error handling
- [ ] Has appropriate comments
- [ ] Types are explicit (no `any`)
- [ ] Mobile-responsive (if UI)
- [ ] Accessible (if UI)
- [ ] Secure (validated inputs, no secrets)
- [ ] Performant (no obvious bottlenecks)
- [ ] Tested (unit/integration tests)
- [ ] Documentation updated

## 📚 Related Documentation

- [Best Practices](./best-practices.md) - Framework-specific patterns
- [Testing](./testing.md) - Testing strategy and patterns
- [Security](./security.md) - Security guidelines

---

**Last Updated**: February 2026
**Version**: 1.0
