# Icon System Usage Guide

This document demonstrates how to use the centralized icon system components.

## Components Created

### 1. Icon Component (`src/components/ui/icon.tsx`)
A centralized icon component with size and variant options.

**Usage:**
```tsx
import { Icon } from "@/components/ui/icon";
import { Search, User, Settings } from "lucide-react";

// Basic usage
<Icon icon={Search} />

// With size variants
<Icon icon={User} size="sm" />
<Icon icon={Settings} size="lg" />

// With color variants
<Icon icon={Search} variant="primary" />
<Icon icon={User} variant="muted" />
<Icon icon={Settings} variant="destructive" />
```

### 2. IconButton Component (`src/components/common/icon-button.tsx`)
A button component specifically designed for icons.

**Usage:**
```tsx
import { IconButton } from "@/components/common/icon-button";
import { Trash, Edit, Plus } from "lucide-react";

// Basic icon button
<IconButton
  icon={Plus}
  aria-label="Add item"
/>

// With different variants
<IconButton
  icon={Edit}
  variant="outline"
  aria-label="Edit item"
/>

<IconButton
  icon={Trash}
  variant="destructive"
  iconVariant="destructive"
  aria-label="Delete item"
/>
```

### 3. Updated Sidebar (`src/components/navigation/sidebar.tsx`)
The sidebar has been updated to use the new icon system for consistent styling.

## Size Options
- `xs`: 12px (h-3 w-3)
- `sm`: 16px (h-4 w-4)
- `default`: 20px (h-5 w-5)
- `lg`: 24px (h-6 w-6)
- `xl`: 32px (h-8 w-8)
- `2xl`: 40px (h-10 w-10)

## Variant Options
- `default`: Uses current text color
- `muted`: Muted foreground color
- `primary`: Primary theme color
- `secondary`: Secondary theme color
- `destructive`: Destructive/error color
- `success`: Success/green color
- `warning`: Warning/yellow color
- `accent`: Accent theme color

## Benefits
1. **Consistency**: All icons follow the same sizing and styling patterns
2. **Maintainability**: Easy to update icon styles globally
3. **Type Safety**: Full TypeScript support with proper typing
4. **Accessibility**: Built-in aria support for icon buttons
5. **Flexibility**: Multiple size and color variants available