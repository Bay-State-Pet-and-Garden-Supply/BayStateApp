import { NextResponse } from 'next/server';
import { getGitHubClient } from '@/lib/admin/scraping/github-client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = getGitHubClient();
        const status = await client.getRunnerStatus();

        return NextResponse.json({
            runners: status.runners,
            available: status.available,
            onlineCount: status.onlineCount,
            offlineCount: status.offlineCount,
        });
    } catch (error) {
        console.error('[Runners API] Error:', error);
        return NextResponse.json(
            {
                runners: [],
                available: false,
                error: error instanceof Error ? error.message : 'Failed to fetch runners'
            },
            { status: 500 }
        );
    }
}
