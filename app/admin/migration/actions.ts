'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ShopSiteClient, ShopSiteConfig } from '@/lib/admin/migration/shopsite-client';

const MIGRATION_SETTINGS_KEY = 'shopsite_migration';

interface MigrationCredentials {
    storeUrl: string;
    merchantId: string;
    password: string;
}

/**
 * Get saved ShopSite credentials from site_settings.
 */
export async function getCredentials(): Promise<MigrationCredentials | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', MIGRATION_SETTINGS_KEY)
        .single();

    if (error || !data) {
        return null;
    }

    return data.value as MigrationCredentials;
}

/**
 * Save ShopSite credentials to site_settings.
 */
export async function saveCredentialsAction(formData: FormData): Promise<void> {
    const supabase = await createClient();

    const credentials: MigrationCredentials = {
        storeUrl: formData.get('storeUrl') as string,
        merchantId: formData.get('merchantId') as string,
        password: formData.get('password') as string,
    };

    // Validate inputs
    if (!credentials.storeUrl || !credentials.merchantId || !credentials.password) {
        throw new Error('All fields are required');
    }

    // Upsert the credentials
    const { error } = await supabase
        .from('site_settings')
        .upsert({
            key: MIGRATION_SETTINGS_KEY,
            value: credentials,
        }, {
            onConflict: 'key',
        });

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/migration');
}

/**
 * Test the ShopSite connection with saved credentials.
 */
export async function testConnectionAction() {
    const credentials = await getCredentials();

    if (!credentials) {
        return { success: false, error: 'No credentials configured' };
    }

    const config: ShopSiteConfig = {
        storeUrl: credentials.storeUrl,
        merchantId: credentials.merchantId,
        password: credentials.password,
    };

    const client = new ShopSiteClient(config);
    const result = await client.testConnection();

    return result;
}
