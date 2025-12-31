import { NextRequest, NextResponse } from 'next/server';
import { getProductsByStatus, type PipelineStatus } from '@/lib/pipeline';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const status = (searchParams.get('status') || 'staging') as PipelineStatus;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { products, count } = await getProductsByStatus(status, {
        limit,
        offset,
        search: search || undefined,
    });

    return NextResponse.json({ products, count });
}
