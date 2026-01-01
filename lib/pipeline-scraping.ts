'use server';

import { createClient } from '@/lib/supabase/server';
import { getGitHubClient } from '@/lib/admin/scraping/github-client';

/**
 * Triggers a scraping job for selected products in the pipeline.
 * This is integrated into the Product Intake flow.
 */
export async function scrapeProducts(skus: string[]): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
}> {
    if (!skus || skus.length === 0) {
        return { success: false, error: 'No SKUs provided' };
    }

    const supabase = await createClient();

    // Create a scrape job record
    const { data: job, error: insertError } = await supabase
        .from('scrape_jobs')
        .insert({
            skus: skus,
            scrapers: [], // Use all available scrapers
            test_mode: false,
            max_workers: 3,
            status: 'pending',
        })
        .select('id')
        .single();

    if (insertError || !job) {
        console.error('[Pipeline Scraping] Failed to create job:', insertError);
        return { success: false, error: 'Failed to create scraping job' };
    }

    try {
        // Get GitHub client and trigger workflow
        const githubClient = getGitHubClient();

        await githubClient.triggerWorkflow({
            job_id: job.id,
            skus: skus.join(','),
            scrapers: '',
            test_mode: false,
            max_workers: 3,
        });

        return { success: true, jobId: job.id };
    } catch (error) {
        // Update job status to failed
        const errorMessage = error instanceof Error ? error.message : 'Failed to trigger workflow';
        await supabase
            .from('scrape_jobs')
            .update({ status: 'failed', error_message: errorMessage })
            .eq('id', job.id);

        return { success: false, error: errorMessage };
    }
}

/**
 * Gets the status of a scraping job for the pipeline.
 */
export async function getScrapeJobStatus(jobId: string): Promise<{
    status: 'pending' | 'running' | 'completed' | 'failed';
    completedAt?: string;
    error?: string;
}> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('scrape_jobs')
        .select('status, completed_at, error_message')
        .eq('id', jobId)
        .single();

    if (error || !data) {
        return { status: 'failed', error: 'Job not found' };
    }

    return {
        status: data.status,
        completedAt: data.completed_at,
        error: data.error_message,
    };
}

/**
 * Check if there are any runners available for scraping.
 */
export async function checkRunnersAvailable(): Promise<boolean> {
    try {
        const githubClient = getGitHubClient();
        const status = await githubClient.getRunnerStatus();
        return status?.available ?? false;
    } catch {
        return false;
    }
}
