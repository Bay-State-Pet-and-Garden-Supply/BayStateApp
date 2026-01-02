import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ScraperEditorClient } from '@/components/admin/scrapers/ScraperEditorClient';
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
    title: scraper ? `${scraper.display_name || scraper.name} | Scraper Config` : 'Scraper Config',
  };
}

export default async function ScraperDetailPage({ params }: PageProps) {
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

  return <ScraperEditorClient scraper={scraper as unknown as ScraperRecord} />;
}
