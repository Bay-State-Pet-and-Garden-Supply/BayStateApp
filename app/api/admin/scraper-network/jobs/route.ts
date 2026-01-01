import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('scrape_jobs')
            .select('id, skus, status, created_at, completed_at, error_message')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('[Jobs API] Error:', error);
            return NextResponse.json({ jobs: [] }, { status: 500 });
        }

        return NextResponse.json({ jobs: data || [] });
    } catch (error) {
        console.error('[Jobs API] Error:', error);
        return NextResponse.json({ jobs: [] }, { status: 500 });
    }
}
