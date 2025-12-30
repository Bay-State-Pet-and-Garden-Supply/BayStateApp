'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Generates a URL-friendly slug from a string.
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function NewBrandPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        setSlug(generateSlug(newName));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error: insertError } = await supabase
                .from('brands')
                .insert({
                    name,
                    slug,
                    logo_url: logoUrl || null,
                });

            if (insertError) {
                throw insertError;
            }

            router.push('/admin/brands');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create brand');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add Brand</h1>

            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Brand Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="e.g., Blue Buffalo"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="e.g., blue-buffalo"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                URL-friendly identifier. Auto-generated from name.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo_url">Logo URL (optional)</Label>
                            <Input
                                id="logo_url"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Brand'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
