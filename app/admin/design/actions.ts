'use server';

import { revalidatePath } from 'next/cache';
import { 
    updateCampaignBanner, 
    type CampaignBannerSettings, 
    type BannerMessage,
    updateHomepageSettings,
    type HomepageSettings
} from '@/lib/settings';

export async function updateCampaignBannerAction(formData: FormData) {
    // Parse messages from JSON string
    const messagesJson = formData.get('messages') as string;
    let messages: BannerMessage[] = [];

    try {
        messages = messagesJson ? JSON.parse(messagesJson) : [];
    } catch {
        messages = [];
    }

    const settings: CampaignBannerSettings = {
        enabled: formData.get('enabled') === 'on',
        messages,
        variant: (formData.get('variant') as 'info' | 'promo' | 'seasonal') || 'info',
        cycleInterval: parseInt(formData.get('cycleInterval') as string, 10) || 5000,
    };

    try {
        const success = await updateCampaignBanner(settings);

        if (!success) {
            return { success: false, error: 'Failed to update settings in database' };
        }

        revalidatePath('/admin/design');
        revalidatePath('/'); // Revalidate storefront to show updated banner
        return { success: true };
    } catch (error: unknown) {
        console.error('Action error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    }
}

export async function updateHomepageSettingsAction(formData: FormData) {
    const featuredProductIdsJson = formData.get('featuredProductIds') as string;
    let featuredProductIds: string[] = [];
    try {
        featuredProductIds = featuredProductIdsJson ? JSON.parse(featuredProductIdsJson) : [];
    } catch {
        featuredProductIds = [];
    }

    const settings: HomepageSettings = {
        hero: {
            title: formData.get('hero.title') as string,
            subtitle: formData.get('hero.subtitle') as string,
            imageUrl: formData.get('hero.imageUrl') as string,
            ctaText: formData.get('hero.ctaText') as string,
            ctaLink: formData.get('hero.ctaLink') as string,
        },
        featuredProductIds,
        storeHours: formData.get('storeHours') as string,
    };

    try {
        const success = await updateHomepageSettings(settings);

        if (!success) {
            return { success: false, error: 'Failed to update homepage settings' };
        }

        revalidatePath('/admin/design');
        revalidatePath('/'); // Revalidate homepage
        return { success: true };
    } catch (error: unknown) {
        console.error('Action error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    }
}
