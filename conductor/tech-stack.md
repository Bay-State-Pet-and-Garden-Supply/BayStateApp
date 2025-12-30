# Tech Stack: Bay State Pet & Garden Supply

## Core Framework & Language
- **Language:** **TypeScript** (Strict Mode) - Mandatory for the "Legacy Architecture" pillar to prevent silent failures.
- **Framework:** **Next.js (App Router)** - Chosen for high-performance rendering, SEO-friendly storefront, and PWA capabilities.

## Backend & Data
- **Provider:** **Supabase**
    - **Database:** PostgreSQL for robust relational data handling of 300+ brands and products.
    - **Authentication:** Supabase Auth for secure Manager Portal access.
    - **Storage:** Supabase Storage for high-quality product and campaign imagery.

## UI & Styling
- **Styling:** **Tailwind CSS** - For a utility-first, highly maintainable design system.
- **Components:** **shadcn/ui** - To provide accessible, "safety-railed" UI components for both the storefront and admin forms.
- **Icons:** **Lucide React** - For modern, consistent iconography.

## State & Form Management
- **Global State:** **Zustand** - A lightweight solution for managing the "Sticky Cart" and ephemeral UI states.
- **Forms & Validation:** **React Hook Form + Zod** - To ensure type-safe, validated inputs in the Manager Portal, preventing owner errors from breaking the database.

## Deployment & Hosting
- **Platform:** **Vercel** (Recommended) - Seamless integration with Next.js and high-performance edge delivery for the PWA.