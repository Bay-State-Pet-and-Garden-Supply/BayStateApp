/**
 * Enrichment Sources Registry
 * 
 * Unified registry of all enrichment sources (scrapers + B2B feeds).
 * This provides a single source of truth for what sources are available.
 */

import { createClient } from '@/lib/supabase/server';
import type { EnrichmentSource, EnrichableField, SourceType } from './types';

/**
 * Static scraper source definitions.
 * These correspond to YAML configs in BayStateScraper/scrapers/configs/
 */
const SCRAPER_SOURCES: Omit<EnrichmentSource, 'status' | 'enabled' | 'lastFetchAt'>[] = [
  {
    id: 'amazon',
    displayName: 'Amazon',
    type: 'scraper',
    requiresAuth: false,
    providesFields: ['name', 'brand', 'images', 'weight', 'description'],
  },
  {
    id: 'walmart',
    displayName: 'Walmart',
    type: 'scraper',
    requiresAuth: false,
    providesFields: ['name', 'brand', 'description', 'images', 'weight', 'upc'],
  },
  {
    id: 'phillips',
    displayName: 'Phillips Pet Food',
    type: 'scraper',
    requiresAuth: true,
    providesFields: ['name', 'brand', 'upc', 'images', 'weight'],
  },
  {
    id: 'bradley',
    displayName: 'Bradley Caldwell',
    type: 'scraper',
    requiresAuth: false,
    providesFields: ['name', 'brand', 'weight', 'images'],
  },
  {
    id: 'central_pet',
    displayName: 'Central Pet',
    type: 'scraper',
    requiresAuth: false,
    providesFields: ['name', 'brand', 'weight', 'images'],
  },
  {
    id: 'coastal',
    displayName: 'Coastal Pet',
    type: 'scraper',
    requiresAuth: false,
    providesFields: ['name', 'brand', 'images'],
  },
  {
    id: 'mazuri',
    displayName: 'Mazuri',
    type: 'scraper',
    requiresAuth: false,
    providesFields: ['name', 'brand', 'weight', 'images', 'ingredients'],
  },
  {
    id: 'orgill',
    displayName: 'Orgill',
    type: 'scraper',
    requiresAuth: true,
    providesFields: ['name', 'brand', 'weight', 'images'],
  },
  {
    id: 'petfoodex',
    displayName: 'Pet Food Experts',
    type: 'scraper',
    requiresAuth: true,
    providesFields: ['name', 'brand', 'weight', 'images'],
  },
  {
    id: 'baystatepet',
    displayName: 'Bay State Pet (Self)',
    type: 'scraper',
    requiresAuth: false,
    providesFields: ['name', 'description', 'images'],
  },
];

/**
 * B2B distributor codes that map to B2B adapters.
 */
const B2B_DISTRIBUTOR_CODES = ['BCI', 'ORGILL', 'PHILLIPS', 'PFX', 'CENTRAL'] as const;
type DistributorCode = (typeof B2B_DISTRIBUTOR_CODES)[number];

/**
 * B2B source field mappings - what fields each B2B feed typically provides.
 */
const B2B_FIELD_MAPPINGS: Record<DistributorCode, EnrichableField[]> = {
  BCI: ['name', 'brand', 'description', 'weight', 'images', 'upc'],
  ORGILL: ['name', 'brand', 'weight', 'upc'],
  PHILLIPS: ['name', 'brand', 'weight', 'upc', 'images'],
  PFX: ['name', 'brand', 'weight', 'images'],
  CENTRAL: ['name', 'brand', 'weight', 'upc'],
};

/**
 * Gets all available scraper sources with their current status from the database.
 */
export async function getScraperSources(): Promise<EnrichmentSource[]> {
  const supabase = await createClient();

  // Fetch scraper status from scrapers table
  const { data: scrapers } = await supabase
    .from('scrapers')
    .select('name, status, disabled, last_tested');

  const scraperStatusMap = new Map(
    scrapers?.map((s) => [s.name, { status: s.status, disabled: s.disabled, lastTested: s.last_tested }]) ?? []
  );

  return SCRAPER_SOURCES.map((source) => {
    const dbStatus = scraperStatusMap.get(source.id);
    return {
      ...source,
      status: (dbStatus?.status as EnrichmentSource['status']) ?? 'unknown',
      enabled: !dbStatus?.disabled,
      lastFetchAt: dbStatus?.lastTested ?? undefined,
    };
  });
}

/**
 * Gets all available B2B sources with their current status from the database.
 */
export async function getB2BSources(): Promise<EnrichmentSource[]> {
  const supabase = await createClient();

  const { data: feeds } = await supabase
    .from('b2b_feeds')
    .select('distributor_code, display_name, status, enabled, last_sync_at');

  if (!feeds) return [];

  return feeds.map((feed) => ({
    id: `b2b_${feed.distributor_code.toLowerCase()}`,
    displayName: feed.display_name,
    type: 'b2b' as SourceType,
    requiresAuth: true, // B2B feeds always require auth
    status: feed.status as EnrichmentSource['status'],
    enabled: feed.enabled,
    providesFields: B2B_FIELD_MAPPINGS[feed.distributor_code as DistributorCode] ?? [],
    lastFetchAt: feed.last_sync_at ?? undefined,
  }));
}

/**
 * Gets all available enrichment sources (scrapers + B2B).
 */
export async function getAllSources(): Promise<EnrichmentSource[]> {
  const [scrapers, b2b] = await Promise.all([
    getScraperSources(),
    getB2BSources(),
  ]);

  return [...scrapers, ...b2b];
}

/**
 * Gets a single source by ID.
 */
export async function getSourceById(sourceId: string): Promise<EnrichmentSource | null> {
  const sources = await getAllSources();
  return sources.find((s) => s.id === sourceId) ?? null;
}

/**
 * Checks if a source ID is a B2B source.
 */
export function isB2BSource(sourceId: string): boolean {
  return sourceId.startsWith('b2b_');
}

/**
 * Extracts the distributor code from a B2B source ID.
 */
export function getDistributorCode(sourceId: string): string | null {
  if (!isB2BSource(sourceId)) return null;
  return sourceId.replace('b2b_', '').toUpperCase();
}

/**
 * Gets the scraper name from a source ID (for non-B2B sources).
 */
export function getScraperName(sourceId: string): string | null {
  if (isB2BSource(sourceId)) return null;
  return sourceId;
}
