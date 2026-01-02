import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ScraperDashboardClient } from '@/components/admin/scrapers/ScraperDashboardClient';

export const metadata: Metadata = {
  title: 'Scraper Dashboard | Admin',
  description: 'Overview of scraper health and test results',
};

export default async function ScraperDashboardPage() {
  const supabase = await createClient();

  const { data: scrapers } = await supabase
    .from('scrapers')
    .select('id, name, display_name, status, health_status, health_score, last_test_at')
    .order('name');

  const { data: recentTests } = await supabase
    .from('scraper_test_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const healthCounts = {
    healthy: scrapers?.filter((s) => s.health_status === 'healthy').length || 0,
    degraded: scrapers?.filter((s) => s.health_status === 'degraded').length || 0,
    broken: scrapers?.filter((s) => s.health_status === 'broken').length || 0,
    unknown: scrapers?.filter((s) => s.health_status === 'unknown').length || 0,
  };

  const statusCounts = {
    active: scrapers?.filter((s) => s.status === 'active').length || 0,
    draft: scrapers?.filter((s) => s.status === 'draft').length || 0,
    disabled: scrapers?.filter((s) => s.status === 'disabled').length || 0,
  };

  return (
    <ScraperDashboardClient
      scrapers={scrapers || []}
      recentTests={recentTests || []}
      healthCounts={healthCounts}
      statusCounts={statusCounts}
    />
  );
}
