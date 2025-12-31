# Track Specification: User Authentication & RBAC

## Overview
Implement comprehensive user authentication for customers and administrators using Supabase Auth. This track introduces Role-Based Access Control (RBAC) to secure the admin panel and creates a feature-rich customer dashboard to enhance the shopping experience, focusing on convenience for recurring buyers.

## Functional Requirements

### 1. Authentication System (Supabase Auth)
- **Providers:** Email/Password, Google OAuth, Apple OAuth, Facebook OAuth
- **Sign Up/Login Flows:**
  - Dedicated `/login` and `/signup` pages for customers
  - Separate `/admin/login` page for staff access
- **Session Management:** Secure session handling via middleware
- **Password Reset:** Forgot password flow with email verification

### 2. Role-Based Access Control (RBAC)
- **Roles:**
  - `admin`: Full system access (products, orders, users, settings, pipeline)
  - `staff`: Operational access (products, orders, pipeline) - No access to settings or user management
- **Implementation:** Custom claims or `profiles` table role column
- **Middleware:** Protect `/admin` routes based on role

### 3. Customer Dashboard
- **Route:** `/account`
- **Modules:**
  - **Profile:** Edit name, email, change password
  - **Orders:** List view of history + detail view of specific orders
  - **Addresses:** CRUD operations for saved shipping addresses
  - **Wishlist:** View and manage saved items
  - **Quick Buy (Recurring):** "Buy Again" section showing frequently purchased items for 1-click add to cart

### 4. Admin User Management
- **Route:** `/admin/users`
- List all users
- Set roles (promote/demote admin/staff)
- View user order history

## Technical Architecture
- **Auth:** Supabase Auth + SSR Middleware
- **Database:**
  - `profiles` table (links to `auth.users`) for role/address data
  - `addresses` table (1:many relation with profiles)
  - `wishlists` table (1:many relation with profiles)
- **State:** Zustand store for user session

## Out of Scope
- Loyalty points system (future track)
- Subscription/Autoship management (future track)
