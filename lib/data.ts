import { createClient } from '@/lib/supabase/server';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at?: string;
}

export interface Product {
  id: string;
  brand_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  images: string[];
  is_featured: boolean;
  created_at: string;
  brand?: Brand;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  unit: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Transforms a row from products_published view to Product interface.
 * The view now includes brand data directly, eliminating N+1 queries.
 */
function transformProductRow(row: Record<string, unknown>): Product {
  const product: Product = {
    id: row.id as string,
    brand_id: row.brand_id as string | null,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | null,
    price: Number(row.price),
    stock_status: row.stock_status as Product['stock_status'],
    images: Array.isArray(row.images) ? row.images : [],
    is_featured: row.is_featured as boolean,
    created_at: row.created_at as string,
  };

  // Brand data is now included directly in the view
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
 * Fetches featured products for the homepage.
 * Queries the products_published view which includes brand data.
 */
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products_published')
    .select('*')
    .eq('is_featured', true)
    .eq('stock_status', 'in_stock')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return (data || []).map(transformProductRow);
}

/**
 * Fetches all active services.
 */
export async function getActiveServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetches all brands.
 */
export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetches products by category/filter.
 * Queries the products_published view which includes brand data.
 */
export async function getProducts(options?: {
  brandId?: string;
  stockStatus?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('products_published')
    .select('*', { count: 'exact' });

  if (options?.brandId) {
    query = query.eq('brand_id', options.brandId);
  }
  if (options?.stockStatus) {
    query = query.eq('stock_status', options.stockStatus);
  }

  query = query.order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

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
 * Fetches a single product by slug.
 * Queries the products_published view which includes brand data.
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
