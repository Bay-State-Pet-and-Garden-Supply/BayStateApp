import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ScraperTestClient } from '@/components/admin/scrapers/ScraperTestClient';
import { ScraperRecord } from '@/lib/admin/scrapers/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: scraper } = await supabase
    .from('scrapers')
    .select('name, display_name')
    .eq('id', id)
    .single();

  return {
    title: scraper ? `Test ${scraper.display_name || scraper.name} | Scraper` : 'Test Scraper',
  };
}

export default async function ScraperTestPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: scraper, error } = await supabase
    .from('scrapers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !scraper) {
    notFound();
  }

  const { data: recentTests } = await supabase
    .from('scraper_test_runs')
    .select('*')
    .eq('scraper_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <ScraperTestClient
      scraper={scraper as unknown as ScraperRecord}
      recentTests={recentTests || []}
    />
  );
}
