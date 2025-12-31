/**
 * ShopSite Migration Types
 * 
 * Type definitions for handling ShopSite data import into Supabase.
 */

import { z } from 'zod';

// ============================================================================
// ShopSite API Configuration
// ============================================================================

export const ShopSiteConfigSchema = z.object({
    storeUrl: z.string().url().min(1, 'Store URL is required'),
    merchantId: z.string().min(1, 'Merchant ID is required'),
    password: z.string().min(1, 'Password is required'),
});

export type ShopSiteConfig = z.infer<typeof ShopSiteConfigSchema>;

// ============================================================================
// ShopSite Data Types (parsed from XML)
// ============================================================================

export interface ShopSiteProduct {
    sku: string;
    name: string;
    price: number;
    description: string;
    quantityOnHand: number;
    imageUrl: string;
}

export interface ShopSiteOrderItem {
    sku: string;
    quantity: number;
    price: number;
}

export interface ShopSiteOrder {
    orderNumber: string;
    orderDate: string;
    grandTotal: number;
    tax: number;
    shippingTotal: number;
    customerEmail: string;
    items: ShopSiteOrderItem[];
}

export interface ShopSiteCustomer {
    email: string;
    firstName: string;
    lastName: string;
    billingAddress: string;
    billingCity: string;
    billingState: string;
    billingZip: string;
}

// ============================================================================
// Migration Log Types
// ============================================================================

export type SyncType = 'products' | 'customers' | 'orders';

export interface MigrationLog {
    id: string;
    syncType: SyncType;
    startedAt: string;
    completedAt: string | null;
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    errorDetails: MigrationError[] | null;
    triggeredBy: string | null;
}

export interface MigrationError {
    record: string;
    error: string;
    timestamp: string;
}

// ============================================================================
// Sync Result Types
// ============================================================================

export interface SyncResult {
    success: boolean;
    processed: number;
    created: number;
    updated: number;
    failed: number;
    errors: MigrationError[];
    duration: number;
}

export interface ConnectionTestResult {
    success: boolean;
    error?: string;
}
