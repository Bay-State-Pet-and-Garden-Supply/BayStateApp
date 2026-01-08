import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isB2BSource, getScraperName } from '@/lib/enrichment/sources';

/**
 * POST /api/admin/enrichment/[sku]/scrape
 * 
 * Trigger a targeted scrape for specific sources on a single product.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { sku } = await params;

  if (!sku) {
    return NextResponse.json({ error: 'SKU is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify user is admin/staff
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'staff'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { sources } = body;

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: 'sources (array of source IDs) is required' },
        { status: 400 }
      );
    }

    // Separate scraper sources from B2B sources
    const scraperSources = sources
      .filter((s: string) => !isB2BSource(s))
      .map((s: string) => getScraperName(s))
      .filter(Boolean) as string[];

    const b2bSources = sources.filter((s: string) => isB2BSource(s));

    // For scrapers, create a scrape job
    if (scraperSources.length > 0) {
      const { data: job, error: jobError } = await supabase
        .from('scrape_jobs')
        .insert({
          skus: [sku],
          scrapers: scraperSources,
          test_mode: false,
          max_workers: 1,
          status: 'pending',
          created_by: user.id,
        })
        .select('id')
        .single();

      if (jobError) {
        console.error('[Enrichment API] Failed to create scrape job:', jobError);
        return NextResponse.json({ error: 'Failed to create scrape job' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        jobId: job.id,
        scrapers: scraperSources,
        b2bSources: b2bSources,
        message: `Scrape job created for ${scraperSources.length} scraper(s)`,
      });
    }

    // For B2B sources, we could trigger a sync, but for now just acknowledge
    if (b2bSources.length > 0) {
      return NextResponse.json({
        success: true,
        b2bSources: b2bSources,
        message: `B2B sources will be refreshed on next sync: ${b2bSources.join(', ')}`,
      });
    }

    return NextResponse.json({ success: true, message: 'No sources to refresh' });
  } catch (error) {
    console.error('[Enrichment API] Error triggering scrape:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
