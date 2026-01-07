'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Home, Image, Star, Clock, Save } from 'lucide-react';
import { updateHomepageSettingsAction } from './actions';
import type { HomepageSettings } from '@/lib/settings';
import { toast } from 'sonner';

interface HomepageTabProps {
    initialSettings: HomepageSettings;
}

export function HomepageTab({ initialSettings }: HomepageTabProps) {
    const [hero, setHero] = useState(initialSettings.hero);
    const [featuredIds, setFeaturedIds] = useState(initialSettings.featuredProductIds.join(', '));
    const [storeHours, setStoreHours] = useState(initialSettings.storeHours);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsSaving(true);
        // Clean up featured IDs
        const ids = featuredIds.split(',').map(s => s.trim()).filter(Boolean);
        formData.set('featuredProductIds', JSON.stringify(ids));

        const result = await updateHomepageSettingsAction(formData);
        setIsSaving(false);

        if (result.success) {
            toast.success('Homepage settings updated');
        } else {
            toast.error(result.error || 'Failed to update settings');
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Hero Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <Image className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <CardTitle>Hero Section</CardTitle>
                            <CardDescription>
                                Customize the main hero banner on the homepage
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="hero.title">Headline</Label>
                        <Input
                            id="hero.title"
                            name="hero.title"
                            value={hero.title}
                            onChange={(e) => setHero({ ...hero, title: e.target.value })}
                            placeholder="Welcome to Bay State Pet & Garden"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hero.subtitle">Subtitle</Label>
                        <Input
                            id="hero.subtitle"
                            name="hero.subtitle"
                            value={hero.subtitle || ''}
                            onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                            placeholder="Your local source for pet supplies..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hero.imageUrl">Background Image URL</Label>
                        <Input
                            id="hero.imageUrl"
                            name="hero.imageUrl"
                            value={hero.imageUrl || ''}
                            onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })}
                            placeholder="/images/hero-bg.jpg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hero.ctaText">CTA Button Text</Label>
                            <Input
                                id="hero.ctaText"
                                name="hero.ctaText"
                                value={hero.ctaText || ''}
                                onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
                                placeholder="Shop Now"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hero.ctaLink">CTA Button Link</Label>
                            <Input
                                id="hero.ctaLink"
                                name="hero.ctaLink"
                                value={hero.ctaLink || ''}
                                onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                                placeholder="/products"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Featured Products */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                            <Star className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle>Featured Products</CardTitle>
                            <CardDescription>
                                Choose which products to highlight on the homepage
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="featuredProductIds">Product IDs (comma separated)</Label>
                        <Textarea
                            id="featuredProductIds"
                            value={featuredIds}
                            onChange={(e) => setFeaturedIds(e.target.value)}
                            placeholder="e.g. 123-abc, 456-def"
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Copy Product IDs from the Products page URL.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Store Hours */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                            <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle>Store Hours</CardTitle>
                            <CardDescription>
                                Update store hours displayed on the homepage footer
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="storeHours">Hours Text</Label>
                        <Textarea
                            id="storeHours"
                            name="storeHours"
                            value={storeHours}
                            onChange={(e) => setStoreHours(e.target.value)}
                            placeholder="Mon-Fri: 9am - 6pm..."
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="sticky bottom-4 flex justify-end">
                <Button type="submit" size="lg" disabled={isSaving} className="shadow-lg">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Homepage Settings'}
                </Button>
            </div>
        </form>
    );
}