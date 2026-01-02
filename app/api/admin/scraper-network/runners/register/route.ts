import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/scraper-network/runners/register
 * 
 * Registers a new runner or updates an existing one.
 * Called by the runner CLI during setup to verify credentials
 * and register the runner with the coordinator.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Get the authenticated user from the JWT
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - invalid or missing authentication' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { runner_name, metadata = {} } = body;

        if (!runner_name || typeof runner_name !== 'string') {
            return NextResponse.json(
                { error: 'runner_name is required' },
                { status: 400 }
            );
        }

        // Upsert the runner record
        const { data: runner, error: upsertError } = await supabase
            .from('scraper_runners')
            .upsert(
                {
                    name: runner_name,
                    user_id: user.id,
                    last_seen_at: new Date().toISOString(),
                    status: 'online',
                    metadata: {
                        ...metadata,
                        registered_at: new Date().toISOString(),
                        email: user.email,
                    },
                },
                {
                    onConflict: 'name',
                    ignoreDuplicates: false,
                }
            )
            .select()
            .single();

        if (upsertError) {
            console.error('[Runner Register] Upsert error:', upsertError);
            return NextResponse.json(
                { error: 'Failed to register runner', details: upsertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            runner: {
                name: runner.name,
                status: runner.status,
                registered_at: runner.metadata?.registered_at,
            },
            message: `Runner '${runner_name}' registered successfully`,
        });
    } catch (error) {
        console.error('[Runner Register] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/scraper-network/runners/register
 * 
 * Validates runner credentials without registering.
 * Used by CLI to test authentication.
 */
export async function GET() {
    try {
        const supabase = await createClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { valid: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            valid: true,
            user_id: user.id,
            email: user.email,
        });
    } catch (error) {
        console.error('[Runner Register] Validation error:', error);
        return NextResponse.json(
            { valid: false, error: 'Validation failed' },
            { status: 500 }
        );
    }
}
