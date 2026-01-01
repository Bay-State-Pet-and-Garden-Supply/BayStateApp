/**
 * @jest-environment node
 */
import { transformShopSiteProduct, buildProductSlug } from '@/lib/admin/migration/product-sync';

describe('Product Sync Utilities', () => {
    describe('transformShopSiteProduct', () => {
        it('transforms ShopSite product to Supabase format', () => {
            const shopSiteProduct = {
                sku: 'SKU-001',
                name: 'Test Product',
                price: 29.99,
                description: 'A test product description',
                quantityOnHand: 10,
                imageUrl: 'https://example.com/image.jpg',
                outOfStockLimit: 5,
                googleProductCategory: 'Pet Supplies',
                shopsitePages: ['Dogs', 'Food'],
            };

            const result = transformShopSiteProduct(shopSiteProduct);

            expect(result).toEqual({
                sku: 'SKU-001',
                name: 'Test Product',
                slug: 'test-product',
                price: 29.99,
                sale_price: null,
                cost: null,
                description: 'A test product description',
                long_description: null,
                stock_status: 'in_stock',
                images: ['https://example.com/image.jpg'],
                weight: null,
                taxable: true,
                gtin: null,
                product_type: null,
                fulfillment_type: 'tangible',
                search_keywords: null,
                google_product_category: 'Pet Supplies',
                is_disabled: false,
                availability: null,
                quantity_on_hand: 10,
                low_stock_threshold: null,
                out_of_stock_limit: 5,
                minimum_quantity: 1,
                shopsite_data: {
                    shopsite_id: null,
                    shopsite_guid: null,
                    legacy_filename: null,
                    brand_name: null,
                    category_name: null,
                    shopsite_pages: ['Dogs', 'Food'],
                    raw_xml: null,
                },
            });
        });

        it('infers GTIN from SKU if SKU is a valid barcode and GTIN is missing', () => {
            const shopSiteProduct = {
                sku: '012345678901', // 12-digit UPC
                name: 'Inferred GTIN Product',
                price: 15.00,
                description: 'Description',
                quantityOnHand: 5,
                imageUrl: '',
            };

            const result = transformShopSiteProduct(shopSiteProduct);

            expect(result.gtin).toBe('012345678901');
        });

        it('does not infer GTIN if SKU is not a barcode', () => {
            const shopSiteProduct = {
                sku: 'NOT-A-BARCODE',
                name: 'Regular SKU Product',
                price: 10.00,
                description: '',
                quantityOnHand: 5,
                imageUrl: '',
            };

            const result = transformShopSiteProduct(shopSiteProduct);

            expect(result.gtin).toBeNull();
        });

        it('sets stock_status to out_of_stock when quantity is 0', () => {
            const shopSiteProduct = {
                sku: 'SKU-002',
                name: 'Out of Stock Product',
                price: 19.99,
                description: '',
                quantityOnHand: 0,
                imageUrl: '',
            };

            const result = transformShopSiteProduct(shopSiteProduct);

            expect(result.stock_status).toBe('out_of_stock');
        });

        it('handles empty image URL', () => {
            const shopSiteProduct = {
                sku: 'SKU-003',
                name: 'No Image Product',
                price: 9.99,
                description: '',
                quantityOnHand: 5,
                imageUrl: '',
            };

            const result = transformShopSiteProduct(shopSiteProduct);

            expect(result.images).toEqual([]);
        });
    });

    describe('buildProductSlug', () => {
        it('generates lowercase hyphenated slug from name', () => {
            expect(buildProductSlug('Test Product Name')).toBe('test-product-name');
        });

        it('removes special characters', () => {
            expect(buildProductSlug("Product's Special & Great!")).toBe('products-special-great');
        });

        it('handles multiple spaces', () => {
            expect(buildProductSlug('Product   With   Spaces')).toBe('product-with-spaces');
        });

        it('appends SKU for uniqueness when provided', () => {
            expect(buildProductSlug('Common Product', 'SKU-123')).toBe('common-product-sku-123');
        });
    });
});
