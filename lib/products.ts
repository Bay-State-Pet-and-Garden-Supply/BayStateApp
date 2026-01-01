import { createClient } from '@/lib/supabase/server';
import { type Product, type Brand } from '@/lib/types';

/**
 * Transforms a row from products_published view to Product interface.
 * The view includes brand data directly, eliminating N+1 queries.
 */
function transformProductRow(row: Record<string, unknown>): Product {
  const product: Product = {
    id: row.id as string,
    brand_id: row.brand_id as string | null,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | null,
    price: Number(row.price),
    stock_status: (row.stock_status as Product['stock_status']) || 'in_stock',
    images: parseImages(row.images),
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at as string,
  };

  // Brand data is included directly in the view
  if (row.brand_id && row.brand_name) {
    product.brand = {
      id: row.brand_id as string,
      name: row.brand_name as string,
      slug: row.brand_slug as string,
      logo_url: row.brand_logo_url as string | null,
    };
  }

  return product;
}

/**
 * Parse images from various formats (JSONB array, string array, etc.)
 */
function parseImages(images: unknown): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.filter((img): img is string => typeof img === 'string');
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.filter((img): img is string => typeof img === 'string');
      }
    } catch {
      // Not valid JSON, treat as single image URL
      return images.trim() ? [images] : [];
    }
  }
  return [];
}

/**
 * Fetches a single product by slug.
 * Uses products_published view which includes brand data.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products_published')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Error fetching product by slug:', error);
    return null;
  }

  return transformProductRow(data);
}

/**
 * Fetches a single product by SKU/ID.
 * Uses products_published view.
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products_published')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching product by id:', error);
    return null;
  }

  return transformProductRow(data);
}

/**
 * Fetches products with optional filtering and pagination.
 * Uses products_published view which includes brand data.
 */
export async function getFilteredProducts(options?: {
  brandSlug?: string;
  brandId?: string;
  categoryId?: string;
  stockStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; count: number }> {
  const supabase = await createClient();
  let query = supabase
    .from('products_published')
    .select('*', { count: 'exact' });

  // Filter by brand slug (uses the brand_slug column from the view)
  if (options?.brandSlug) {
    query = query.eq('brand_slug', options.brandSlug);
  }
  // Filter by brand ID
  if (options?.brandId) {
    query = query.eq('brand_id', options.brandId);
  }
  // Filter by category
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  // Filter by stock status
  if (options?.stockStatus) {
    query = query.eq('stock_status', options.stockStatus);
  }
  // Filter by price range
  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }
  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }
  // Search by name
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }
  // Filter featured only
  if (options?.featured) {
    query = query.eq('is_featured', true);
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

  return {
    products: (data || []).map(transformProductRow),
    count: count || 0,
  };
}

/**
 * Fetches featured products for the homepage.
 * Uses products_published view.
 */
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { products } = await getFilteredProducts({
    featured: true,
    stockStatus: 'in_stock',
    limit,
  });
  return products;
}

/**
 * Fetches all products (for sitemaps, etc.)
 * Uses products_published view.
 */
export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products_published')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching all products:', error);
    return [];
  }

  return (data || []).map(transformProductRow);
}

/**
 * Fetches products by brand.
 */
export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  const { products } = await getFilteredProducts({ brandSlug });
  return products;
}

/**
 * Search products by name.
 */
export async function searchProducts(
  query: string,
  limit = 10
): Promise<Product[]> {
  const { products } = await getFilteredProducts({ search: query, limit });
  return products;
}
