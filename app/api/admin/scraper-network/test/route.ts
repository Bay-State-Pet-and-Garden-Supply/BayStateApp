import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface TestRequest {
  scraper_id: string;
  skus: string[];
  test_mode?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: TestRequest = await request.json();

    const { scraper_id, skus, test_mode = true } = body;

    if (!scraper_id || !skus || skus.length === 0) {
      return NextResponse.json(
        { error: 'scraper_id and skus array are required' },
        { status: 400 }
      );
    }

    const { data: scraper, error: scraperError } = await supabase
      .from('scrapers')
      .select('*')
      .eq('id', scraper_id)
      .single();

    if (scraperError || !scraper) {
      return NextResponse.json(
        { error: 'Scraper not found' },
        { status: 404 }
      );
    }

    const testRun = {
      scraper_id,
      test_type: 'manual' as const,
      skus_tested: skus,
      results: [],
      status: 'pending' as const,
      started_at: new Date().toISOString(),
    };

    const { data: insertedRun, error: insertError } = await supabase
      .from('scraper_test_runs')
      .insert(testRun)
      .select()
      .single();

    if (insertError) {
      console.error('[Test API] Failed to create test run:', insertError);
      return NextResponse.json(
        { error: 'Failed to create test run' },
        { status: 500 }
      );
    }

    const { data: settings } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'github_token')
      .single();

    const githubToken = settings?.value as string | undefined;

    const { data: scraperRepo } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'scraper_repo')
      .single();

    const repoFullName = (scraperRepo?.value as string) || 'Bay-State-Pet-and-Garden-Supply/BayStateScraper';

    if (!githubToken) {
      await supabase
        .from('scraper_test_runs')
        .update({
          status: 'failed',
          error_message: 'GitHub token not configured. Add it in Settings.',
          completed_at: new Date().toISOString(),
        })
        .eq('id', insertedRun.id);

      return NextResponse.json({
        status: 'error',
        error: 'GitHub token not configured. Cannot trigger workflow.',
        test_run_id: insertedRun.id,
      });
    }

    const workflowDispatchUrl = `https://api.github.com/repos/${repoFullName}/actions/workflows/scrape.yml/dispatches`;

    const dispatchResponse = await fetch(workflowDispatchUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'BayStateApp',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          job_id: insertedRun.id,
          scraper_name: scraper.name,
          skus: JSON.stringify(skus),
          test_mode: String(test_mode),
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/admin/scraper-network/callback`,
        },
      }),
    });

    if (!dispatchResponse.ok) {
      const errorText = await dispatchResponse.text();
      console.error('[Test API] GitHub dispatch failed:', errorText);
      
      await supabase
        .from('scraper_test_runs')
        .update({
          status: 'failed',
          error_message: `GitHub dispatch failed: ${dispatchResponse.status}`,
          completed_at: new Date().toISOString(),
        })
        .eq('id', insertedRun.id);

      return NextResponse.json({
        status: 'error',
        error: `Failed to trigger GitHub workflow: ${dispatchResponse.status}`,
        test_run_id: insertedRun.id,
      });
    }

    await supabase
      .from('scraper_test_runs')
      .update({ status: 'running' })
      .eq('id', insertedRun.id);

    return NextResponse.json({
      status: 'dispatched',
      message: 'Test triggered successfully. Results will be available when the runner completes.',
      test_run_id: insertedRun.id,
      scraper_name: scraper.name,
      skus_count: skus.length,
    });

  } catch (error) {
    console.error('[Test API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const testRunId = searchParams.get('id');

    if (!testRunId) {
      return NextResponse.json(
        { error: 'Test run ID is required' },
        { status: 400 }
      );
    }

    const { data: testRun, error } = await supabase
      .from('scraper_test_runs')
      .select('*')
      .eq('id', testRunId)
      .single();

    if (error || !testRun) {
      return NextResponse.json(
        { error: 'Test run not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(testRun);

  } catch (error) {
    console.error('[Test API] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
