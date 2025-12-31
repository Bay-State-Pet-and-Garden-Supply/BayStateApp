/**
 * API Route to trigger sync operations
 * 
 * POST /api/admin/migration/sync?type=products|orders|customers
 */

import { NextRequest, NextResponse } from 'next/server';
import { syncProductsAction, syncCustomersAction, syncOrdersAction } from '@/app/admin/migration/actions';

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    if (!type || !['products', 'orders', 'customers'].includes(type)) {
        return NextResponse.json(
            { error: 'Invalid type. Must be products, orders, or customers.' },
            { status: 400 }
        );
    }

    try {
        let result;
        switch (type) {
            case 'products':
                result = await syncProductsAction();
                break;
            case 'customers':
                result = await syncCustomersAction();
                break;
            case 'orders':
                result = await syncOrdersAction();
                break;
        }

        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Sync failed' },
            { status: 500 }
        );
    }
}
