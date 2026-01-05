'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/components/storefront/search-provider';
import { useCartStore } from '@/lib/cart-store';
import { CartDrawer } from '@/components/storefront/cart-drawer';

import { User } from '@supabase/supabase-js';
import { UserMenu } from '@/components/auth/user-menu';

/**
 * StorefrontHeader - Main navigation header for the customer-facing storefront.
 * Features mobile-first design with 44px+ touch targets.
 */
export function StorefrontHeader({ user, userRole }: { user: User | null, userRole: string | null }) {
  const { openSearch } = useSearch();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header className="max-md:hidden sticky top-0 z-50 w-full border-b border-white/10 bg-primary text-white backdrop-blur supports-[backdrop-filter]:bg-primary/95 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="h-14 w-14 relative">
              <Image
                src="/logo.png"
                alt="Bay State Pet & Garden Supply Logo"
                fill
                sizes="56px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight text-white">
                Bay State
              </span>
              <span className="hidden text-xs text-white/90 sm:inline leading-none">
                Pet & Garden Supply
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/products"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Products
            </Link>
            <Link
              href="/brands"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Brands
            </Link>
            <Link
              href="/services"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Services
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              About
            </Link>
            {(userRole === 'admin' || userRole === 'staff') && (
              <Link
                href="/admin"
                className="text-sm font-medium text-red-200 transition-colors hover:text-white"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Action Buttons - 44px+ touch targets */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-white hover:bg-white/20 hover:text-white"
              aria-label="Search"
              onClick={openSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 text-white hover:bg-white/20 hover:text-white"
              aria-label="Shopping cart"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white ring-2 ring-white">
                {itemCount}
              </span>
            </Button>

            {/* User Menu */}
            <UserMenu user={user} />

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-white hover:bg-white/20 hover:text-white md:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
