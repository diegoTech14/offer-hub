# Frontend Component Patterns

## 🎯 Component Design Principles

1. **Single Responsibility**: Each component should do one thing well
2. **Composition over Inheritance**: Combine simple components
3. **Reusability**: Design for reuse across the application
4. **Accessibility**: WCAG AA compliance minimum
5. **Performance**: Optimize for fast rendering
6. **Type Safety**: Full TypeScript coverage

## 🏗️ Component Architecture

### Component Hierarchy

```
App
├── Layout Components (shared structure)
│   ├── RootLayout
│   ├── Header
│   ├── Sidebar
│   └── Footer
│
├── Page Components (routes)
│   ├── HomePage
│   ├── OffersPage
│   ├── ComparisonPage
│   └── SettingsPage
│
├── Feature Components (domain logic)
│   ├── OffersList
│   ├── OfferForm
│   ├── ComparisonTable
│   └── UserProfile
│
└── UI Components (reusable)
    ├── Button
    ├── Card
    ├── Input
    ├── Modal
    └── Tooltip
```

## 📁 Server vs Client Components

### Server Components (Default)

**When to use:**
- Static content
- Data fetching
- SEO-critical pages
- Large dependencies that don't need to be on client

```typescript
// ✅ Server Component (default - no directive needed)
import { getOffers } from "@/lib/api";

export default async function OffersPage() {
  // Can fetch data directly in component
  const offers = await getOffers();

  return (
    <div>
      <h1>My Offers</h1>
      <OffersList offers={offers} />
    </div>
  );
}
```

### Client Components

**When to use:**
- State management (`useState`, `useReducer`)
- Effects (`useEffect`)
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- Custom hooks with client-only logic

```typescript
// ✅ Client Component (add "use client" directive)
"use client";

import { useState } from "react";

export function OfferForm() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    baseSalary: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Hybrid Pattern

```typescript
// Server Component (data fetching)
export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <div>
      <h1>My Offers</h1>
      {/* Pass data to Client Component */}
      <InteractiveOffersList initialOffers={offers} />
    </div>
  );
}

// Client Component (interactivity)
"use client";

export function InteractiveOffersList({ initialOffers }: Props) {
  const [offers, setOffers] = useState(initialOffers);
  // Interactive features
  return <div>{/* Interactive UI */}</div>;
}
```

## 🧩 Component Patterns

### 1. Container/Presentational Pattern

**Container (Smart Component):**

```typescript
"use client";

import { useOffers } from "@/hooks/use-offers";
import { OffersList } from "./OffersList";

// Handles data fetching and state
export function OffersContainer() {
  const { offers, loading, error, deleteOffer } = useOffers();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <OffersList
      offers={offers}
      onDelete={deleteOffer}
    />
  );
}
```

**Presentational (Dumb Component):**

```typescript
interface OffersListProps {
  offers: Offer[];
  onDelete: (id: string) => void;
}

// Only handles presentation
export function OffersList({ offers, onDelete }: OffersListProps) {
  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onDelete={() => onDelete(offer.id)}
        />
      ))}
    </div>
  );
}
```

### 2. Compound Component Pattern

```typescript
// Parent component with context
export function Card({ children }: CardProps) {
  return (
    <div className="rounded-lg shadow-md">
      {children}
    </div>
  );
}

// Child components
Card.Header = function CardHeader({ children }: Props) {
  return <div className="border-b p-4">{children}</div>;
};

Card.Body = function CardBody({ children }: Props) {
  return <div className="p-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: Props) {
  return <div className="border-t p-4">{children}</div>;
};

// Usage
<Card>
  <Card.Header>
    <h2>Offer Details</h2>
  </Card.Header>
  <Card.Body>
    <p>Details here...</p>
  </Card.Body>
  <Card.Footer>
    <Button>Edit</Button>
  </Card.Footer>
</Card>
```

### 3. Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<Offer[]> url="/api/offers">
  {(offers, loading, error) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    return <OffersList offers={offers || []} />;
  }}
</DataFetcher>
```

### 4. Custom Hooks Pattern

```typescript
// Custom hook for offer management
export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await getOffers();
      setOffers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addOffer = async (offer: CreateOfferInput) => {
    const newOffer = await createOffer(offer);
    setOffers([...offers, newOffer]);
  };

  const deleteOffer = async (id: string) => {
    await removeOffer(id);
    setOffers(offers.filter(o => o.id !== id));
  };

  return {
    offers,
    loading,
    error,
    addOffer,
    deleteOffer,
    refetch: fetchOffers,
  };
}

// Usage
function OffersPage() {
  const { offers, loading, addOffer } = useOffers();
  // Use the hook data
}
```

## 🎨 Styling Patterns

### Tailwind with cn() Utility

```typescript
import { cn } from "@/lib/cn";

interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Button({ variant = "primary", size = "md", className, children }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "rounded-lg font-medium transition-colors",
        // Variant styles
        variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300",
        // Size styles
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-base",
        size === "lg" && "px-6 py-3 text-lg",
        // Custom className
        className
      )}
    >
      {children}
    </button>
  );
}
```

### Responsive Design

```typescript
export function OfferCard({ offer }: Props) {
  return (
    <div className="
      flex flex-col gap-4 p-4
      md:flex-row md:gap-6 md:p-6
      lg:gap-8 lg:p-8
    ">
      {/* Content */}
    </div>
  );
}
```

## ♿ Accessibility Patterns

### Semantic HTML

```typescript
// ✅ Good - Semantic HTML
export function OfferCard({ offer }: Props) {
  return (
    <article className="offer-card">
      <header>
        <h2>{offer.title}</h2>
      </header>
      <section>
        <p>{offer.company}</p>
      </section>
      <footer>
        <button>Edit</button>
      </footer>
    </article>
  );
}

// ❌ Bad - Generic divs
export function OfferCard({ offer }: Props) {
  return (
    <div className="offer-card">
      <div>
        <div>{offer.title}</div>
      </div>
      <div>
        <div>{offer.company}</div>
      </div>
    </div>
  );
}
```

### ARIA Labels

```typescript
export function DeleteButton({ onDelete }: Props) {
  return (
    <button
      onClick={onDelete}
      aria-label="Delete offer"
      className="text-red-500"
    >
      <TrashIcon aria-hidden="true" />
    </button>
  );
}
```

### Keyboard Navigation

```typescript
export function Modal({ isOpen, onClose, children }: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Trap focus in modal
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      // Focus first element
      (focusableElements?.[0] as HTMLElement)?.focus();
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

## 🚀 Performance Patterns

### Memoization

```typescript
import { memo, useMemo, useCallback } from "react";

// Memo component to prevent unnecessary re-renders
export const OfferCard = memo(function OfferCard({ offer, onEdit }: Props) {
  // Memoize expensive calculations
  const totalCompensation = useMemo(() => {
    return calculateTotal(offer);
  }, [offer]);

  // Memoize callbacks
  const handleEdit = useCallback(() => {
    onEdit(offer);
  }, [offer, onEdit]);

  return (
    <div>
      <p>Total: {totalCompensation}</p>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
});
```

### Lazy Loading

```typescript
import dynamic from "next/dynamic";

// Lazy load heavy component
const ComparisonChart = dynamic(
  () => import("@/components/ComparisonChart"),
  { loading: () => <ChartSkeleton /> }
);

export function ComparisonPage() {
  return (
    <div>
      <h1>Offer Comparison</h1>
      <ComparisonChart />
    </div>
  );
}
```

## 📚 Common UI Components

### Button Component

See [DESIGN_SYSTEM_PROMPT.md](../../DESIGN_SYSTEM_PROMPT.md#button-component) for complete button implementation.

### Input Component

See [DESIGN_SYSTEM_PROMPT.md](../../DESIGN_SYSTEM_PROMPT.md#input-component) for complete input implementation.

### Card Component

See [DESIGN_SYSTEM_PROMPT.md](../../DESIGN_SYSTEM_PROMPT.md#card-component) for complete card implementation.

## 📚 Related Documentation

- [Design System](../../DESIGN_SYSTEM_PROMPT.md) - Complete design system
- [State Management](./state-management.md) - State management patterns
- [Routing](./routing.md) - Next.js routing patterns

---

**Last Updated**: February 2026
**Version**: 1.0
