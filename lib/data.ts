import { createClient } from '@/lib/supabase/server';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
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
 * Fetches featured products for the homepage.
 * Queries the products_published view which projects data from the ingestion pipeline.
 */
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = await createClient();

  // Query from the published products view
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

  // Transform the data to match the Product interface
  const products: Product[] = (data || []).map((row) => ({
    id: row.id,
    brand_id: row.brand_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    stock_status: row.stock_status as Product['stock_status'],
    images: Array.isArray(row.images) ? row.images : [],
    is_featured: row.is_featured,
    created_at: row.created_at,
  }));

  // If brand_id exists, fetch the brand details
  const brandIds = products
    .map((p) => p.brand_id)
    .filter((id): id is string => id !== null);

  if (brandIds.length > 0) {
    const { data: brands } = await supabase
      .from('brands')
      .select('*')
      .in('id', brandIds);

    if (brands) {
      const brandMap = new Map(brands.map((b) => [b.id, b]));
      products.forEach((p) => {
        if (p.brand_id && brandMap.has(p.brand_id)) {
          p.brand = brandMap.get(p.brand_id);
        }
      });
    }
  }

  return products;
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
 * Queries the products_published view which projects data from the ingestion pipeline.
 */
export async function getProducts(options?: {
  brandId?: string;
  stockStatus?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; count: number }> {
  const supabase = await createClient();

  // Start with products_published view
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

  // Transform data to Product interface
  const products: Product[] = (data || []).map((row) => ({
    id: row.id,
    brand_id: row.brand_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    stock_status: row.stock_status as Product['stock_status'],
    images: Array.isArray(row.images) ? row.images : [],
    is_featured: row.is_featured,
    created_at: row.created_at,
  }));

  // Fetch brand details for products that have brand_id
  const brandIds = products
    .map((p) => p.brand_id)
    .filter((id): id is string => id !== null);

  if (brandIds.length > 0) {
    const { data: brands } = await supabase
      .from('brands')
      .select('*')
      .in('id', brandIds);

    if (brands) {
      const brandMap = new Map(brands.map((b) => [b.id, b]));
      products.forEach((p) => {
        if (p.brand_id && brandMap.has(p.brand_id)) {
          p.brand = brandMap.get(p.brand_id);
        }
      });
    }
  }

  return { products, count: count || 0 };
}

/**
 * Fetches a single product by slug.
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

  const product: Product = {
    id: data.id,
    brand_id: data.brand_id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: Number(data.price),
    stock_status: data.stock_status as Product['stock_status'],
    images: Array.isArray(data.images) ? data.images : [],
    is_featured: data.is_featured,
    created_at: data.created_at,
  };

  // Fetch brand if exists
  if (product.brand_id) {
    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('id', product.brand_id)
      .single();

    if (brand) {
      product.brand = brand;
    }
  }

  return product;
}
