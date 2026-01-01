# AGENTS.md - AI Coding Agent Instructions

Bay State Pet & Garden Supply: A mobile-first PWA e-commerce platform for a local pet/garden store with 300+ brands. Built with Next.js 16 (App Router), Supabase, Tailwind CSS v4, and shadcn/ui.

## Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

# Testing
npm test                                    # Jest watch mode
CI=true npm test                            # Run all tests once
npm test -- --testPathPattern="products"    # Tests matching pattern
npm test -- __tests__/lib/products.test.ts  # Specific test file
npm test -- --coverage                      # With coverage report
```

**Test Location:** Tests live in `__tests__/` mirroring source structure.

## Code Style (Google TypeScript Style)

### Core Rules
- `const` by default, `let` only when needed. **`var` is forbidden**
- Named exports only. **No default exports**
- Avoid `any` - prefer `unknown` or specific types
- Always use `===` and `!==`
- Semicolons required
- Single quotes, template literals for interpolation
- No `_` prefix/suffix for private properties
- ES6 modules only. **No `namespace`**

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Classes, Interfaces, Types, Enums | `UpperCamelCase` | `ProductCard`, `OrderStatus` |
| Functions, Methods, Variables | `lowerCamelCase` | `getProducts()`, `cartTotal` |
| Global Constants | `CONSTANT_CASE` | `MAX_CART_ITEMS` |
| CSS Classes | `kebab-case` | `.product-grid` |

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal modules (`@/lib/...`, `@/components/...`)
4. Types (`import type` where applicable)

Use path alias `@/*` (maps to project root), not relative paths.

## Component Guidelines

- Default to Server Components; add `'use client'` only when needed
- shadcn/ui style: `new-york`, icons: Lucide React
- Mobile-first: 44x44px touch targets, critical data above fold

## Testing Patterns

### Component Tests
```tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/storefront/product-card';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### Server-Side Tests
```ts
/**
 * @jest-environment node
 */
import { getProducts } from '@/lib/products';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
```

### Mocking Supabase
```ts
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
mockCreateClient.mockResolvedValue({
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
} as never);
```

## Error Handling

- Use try/catch for async operations
- Return `null` or empty arrays on errors (don't throw in data fetching)
- Log errors with context; show user-friendly messages

## Data Fetching (Supabase)

```ts
import { createClient } from '@/lib/supabase/server';

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*)');
  
  if (error) return [];
  return data;
}
```

## State & Forms

- **Zustand** for global client state (cart, UI)
- **React Hook Form + Zod v4** for form validation
- **Server Actions** for form submissions
- **URL state** for filters/search (searchParams)

## Commit Format

```
<type>(<scope>): <description>
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Quality Gates

- [ ] All tests pass (`CI=true npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] Code coverage >80% for new code
- [ ] No `any` types
- [ ] Mobile-responsive (44px touch targets)

## Key Directories

```
app/                    # Next.js App Router pages
  (auth)/              # Auth routes
  (storefront)/        # Public storefront
  admin/               # Admin dashboard
components/
  ui/                  # shadcn/ui components
  storefront/          # Storefront components
  admin/               # Admin components
lib/                   # Utilities, data fetching, stores
  supabase/            # Supabase client config
supabase/migrations/   # Database migrations
conductor/             # Project documentation
  code_styleguides/    # Detailed style guides
```

## Resources

- Product vision: `conductor/product.md`
- Design guidelines: `conductor/product-guidelines.md`
- Tech stack: `conductor/tech-stack.md`
- Code styles: `conductor/code_styleguides/`
