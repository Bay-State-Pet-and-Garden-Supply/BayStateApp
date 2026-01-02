import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface CallbackPayload {
  job_id: string;
  status: 'success' | 'partial' | 'failed' | 'timeout';
  results: Array<{
    sku: string;
    status: 'success' | 'no_results' | 'error' | 'timeout';
    data?: Record<string, unknown>;
    error_message?: string;
    duration_ms?: number;
  }>;
  error_message?: string;
  duration_ms?: number;
  runner_id?: string;
}

async function validateApiKey(request: NextRequest): Promise<{ valid: boolean; runnerId?: string }> {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey || !apiKey.startsWith('bsr_')) {
    return { valid: false };
  }

  const supabase = await createClient();
  
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  const { data: runner, error } = await supabase
    .from('scraper_runners')
    .select('id, status')
    .eq('api_key_hash', keyHash)
    .single();

  if (error || !runner) {
    return { valid: false };
  }

  if (runner.status === 'revoked') {
    return { valid: false };
  }

  return { valid: true, runnerId: runner.id };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    
    if (!auth.valid) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const body: CallbackPayload = await request.json();

    const { job_id, status, results, error_message, duration_ms } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      );
    }

    const { data: testRun, error: fetchError } = await supabase
      .from('scraper_test_runs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (fetchError || !testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      );
    }

    let finalStatus: 'passed' | 'failed' | 'partial' = 'failed';
    
    if (status === 'success') {
      const allSuccess = results.every(r => r.status === 'success' || r.status === 'no_results');
      finalStatus = allSuccess ? 'passed' : 'partial';
    } else if (status === 'partial') {
      finalStatus = 'partial';
    }

    const { error: updateError } = await supabase
      .from('scraper_test_runs')
      .update({
        status: finalStatus,
        results,
        error_message,
        duration_ms,
        completed_at: new Date().toISOString(),
        runner_id: auth.runnerId,
      })
      .eq('id', job_id);

    if (updateError) {
      console.error('[Callback] Failed to update test run:', updateError);
      return NextResponse.json(
        { error: 'Failed to update test run' },
        { status: 500 }
      );
    }

    await updateScraperHealth(supabase, testRun.scraper_id);

    if (auth.runnerId) {
      await supabase
        .from('scraper_runners')
        .update({
          last_seen_at: new Date().toISOString(),
          status: 'online',
        })
        .eq('id', auth.runnerId);
    }

    return NextResponse.json({
      success: true,
      message: 'Results recorded',
      test_run_id: job_id,
      final_status: finalStatus,
    });

  } catch (error) {
    console.error('[Callback] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateScraperHealth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  scraperId: string
) {
  const { data: recentTests } = await supabase
    .from('scraper_test_runs')
    .select('status')
    .eq('scraper_id', scraperId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentTests || recentTests.length === 0) return;

  const passedCount = recentTests.filter(t => t.status === 'passed').length;
  const partialCount = recentTests.filter(t => t.status === 'partial').length;
  
  const healthScore = Math.round(
    ((passedCount + partialCount * 0.5) / recentTests.length) * 100
  );

  let healthStatus: 'healthy' | 'degraded' | 'broken' | 'unknown' = 'unknown';
  if (healthScore >= 80) healthStatus = 'healthy';
  else if (healthScore >= 50) healthStatus = 'degraded';
  else if (healthScore > 0) healthStatus = 'broken';

  await supabase
    .from('scrapers')
    .update({
      health_score: healthScore,
      health_status: healthStatus,
      last_test_at: new Date().toISOString(),
    })
    .eq('id', scraperId);
}
