import { createClient } from '@/lib/supabase/server';
import { type Product } from '@/lib/data';

/**
 * Fetches a single product by slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, brand:brands(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

/**
 * Fetches products with optional filtering and pagination.
 */
export async function getFilteredProducts(options?: {
  brandSlug?: string;
  stockStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; count: number }> {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('*, brand:brands(*)', { count: 'exact' });

  if (options?.brandSlug) {
    // Join with brands to filter by slug
    query = query.eq('brand.slug', options.brandSlug);
  }
  if (options?.stockStatus) {
    query = query.eq('stock_status', options.stockStatus);
  }
  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }
  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }

  query = query.order('created_at', { ascending: false });

  const limit = options?.limit || 12;
  const offset = options?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], count: 0 };
  }

  return { products: data || [], count: count || 0 };
}
