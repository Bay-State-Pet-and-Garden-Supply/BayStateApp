import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkflowBuilderClient } from '@/components/admin/scrapers/WorkflowBuilderClient';
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
    title: scraper ? `Workflow: ${scraper.display_name || scraper.name}` : 'Workflow Builder',
  };
}

export default async function WorkflowBuilderPage({ params }: PageProps) {
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

  return <WorkflowBuilderClient scraper={scraper as unknown as ScraperRecord} />;
}
