'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type Brand } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductFiltersProps {
  brands: Brand[];
}

/**
 * ProductFilters - Sidebar filters for product listing.
 */
export function ProductFilters({ brands }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentBrand = searchParams.get('brand') || '';
  const currentStock = searchParams.get('stock') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter change
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const hasFilters = currentBrand || currentStock || currentMinPrice || currentMaxPrice;

  return (
    <div className="space-y-6 rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <Label className="text-sm font-medium">Brand</Label>
        <select
          value={currentBrand}
          onChange={(e) => updateFilter('brand', e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Status Filter */}
      <div>
        <Label className="text-sm font-medium">Availability</Label>
        <select
          value={currentStock}
          onChange={(e) => updateFilter('stock', e.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Items</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="pre_order">Pre-Order</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="mt-2 flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
