import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ScrapersClient } from '@/components/admin/scrapers/ScrapersClient';
import { ScraperRecord } from '@/lib/admin/scrapers/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Scraper Configs | Admin',
  description: 'Manage web scraper configurations',
};

export default async function ScrapersPage() {
  const supabase = await createClient();

  const { data: scrapers, count, error } = await supabase
    .from('scrapers')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false });

  if (scrapers) {
    console.log('[ScrapersPage] First scraper record:', scrapers[0]);
  }

  if (error) {
    console.error('Error fetching scrapers:', error);
  }

  // Cast to ScraperRecord type
  const clientScrapers = (scrapers || []) as unknown as ScraperRecord[];

  return (
    <ScrapersClient
      initialScrapers={clientScrapers}
      totalCount={count || 0}
    />
  );
}
