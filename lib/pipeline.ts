import { createClient } from '@/lib/supabase/server';

/**
 * Pipeline status types matching the database constraint.
 */
export type PipelineStatus = 'staging' | 'scraped' | 'consolidated' | 'approved' | 'published';

/**
 * Represents a product in the ingestion pipeline.
 */
export interface PipelineProduct {
    sku: string;
    input: {
        name?: string;
        price?: number;
    };
    sources: Record<string, unknown>;
    consolidated: {
        name?: string;
        description?: string;
        price?: number;
        images?: string[];
        brand_id?: string;
        stock_status?: string;
        is_featured?: boolean;
    };
    pipeline_status: PipelineStatus;
    created_at: string;
    updated_at: string;
}

/**
 * Status count for pipeline dashboard.
 */
export interface StatusCount {
    status: PipelineStatus;
    count: number;
}

/**
 * Fetches products filtered by pipeline status.
 */
export async function getProductsByStatus(
    status: PipelineStatus,
    options?: {
        limit?: number;
        offset?: number;
        search?: string;
    }
): Promise<{ products: PipelineProduct[]; count: number }> {
    const supabase = await createClient();

    let query = supabase
        .from('products_ingestion')
        .select('*', { count: 'exact' })
        .eq('pipeline_status', status)
        .order('updated_at', { ascending: false });

    if (options?.search) {
        query = query.or(`sku.ilike.%${options.search}%,input->>name.ilike.%${options.search}%`);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching products by status:', error);
        return { products: [], count: 0 };
    }

    return { products: (data as PipelineProduct[]) || [], count: count || 0 };
}

/**
 * Fetches count of products for each pipeline status.
 */
export async function getStatusCounts(): Promise<StatusCount[]> {
    const supabase = await createClient();

    const statuses: PipelineStatus[] = ['staging', 'scraped', 'consolidated', 'approved', 'published'];
    const counts: StatusCount[] = [];

    for (const status of statuses) {
        const { count, error } = await supabase
            .from('products_ingestion')
            .select('*', { count: 'exact', head: true })
            .eq('pipeline_status', status);

        if (error) {
            console.error(`Error counting ${status} products:`, error);
            counts.push({ status, count: 0 });
        } else {
            counts.push({ status, count: count || 0 });
        }
    }

    return counts;
}

/**
 * Updates the status of a single product.
 */
export async function updateProductStatus(
    sku: string,
    newStatus: PipelineStatus
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('products_ingestion')
        .update({ pipeline_status: newStatus, updated_at: new Date().toISOString() })
        .eq('sku', sku);

    if (error) {
        console.error('Error updating product status:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Updates the status of multiple products.
 */
export async function bulkUpdateStatus(
    skus: string[],
    newStatus: PipelineStatus
): Promise<{ success: boolean; error?: string; updatedCount: number }> {
    const supabase = await createClient();

    const { error, count } = await supabase
        .from('products_ingestion')
        .update({ pipeline_status: newStatus, updated_at: new Date().toISOString() })
        .in('sku', skus);

    if (error) {
        console.error('Error bulk updating product status:', error);
        return { success: false, error: error.message, updatedCount: 0 };
    }

    return { success: true, updatedCount: count || skus.length };
}

/**
 * Fetches a single product by SKU.
 */
export async function getProductBySku(sku: string): Promise<PipelineProduct | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products_ingestion')
        .select('*')
        .eq('sku', sku)
        .single();

    if (error || !data) {
        console.error('Error fetching product by SKU:', error);
        return null;
    }

    return data as PipelineProduct;
}

/**
 * Updates the consolidated data for a product.
 */
export async function updateConsolidatedData(
    sku: string,
    consolidated: PipelineProduct['consolidated']
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('products_ingestion')
        .update({ consolidated, updated_at: new Date().toISOString() })
        .eq('sku', sku);

    if (error) {
        console.error('Error updating consolidated data:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
