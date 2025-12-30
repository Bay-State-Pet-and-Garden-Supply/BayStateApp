'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type Brand } from '@/lib/data';

interface EditBrandFormProps {
    brand: Brand;
}

export function EditBrandForm({ brand }: EditBrandFormProps) {
    const router = useRouter();
    const [name, setName] = useState(brand.name);
    const [slug, setSlug] = useState(brand.slug);
    const [logoUrl, setLogoUrl] = useState(brand.logo_url || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase
                .from('brands')
                .update({
                    name,
                    slug,
                    logo_url: logoUrl || null,
                })
                .eq('id', brand.id);

            if (updateError) {
                throw updateError;
            }

            router.push('/admin/brands');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update brand');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this brand? Products using this brand will have their brand unset.')) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { error: deleteError } = await supabase
                .from('brands')
                .delete()
                .eq('id', brand.id);

            if (deleteError) {
                throw deleteError;
            }

            router.push('/admin/brands');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete brand');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
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
                            onChange={(e) => setName(e.target.value)}
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

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting || isDeleting}>
                            {isSubmitting ? 'Updating...' : 'Update Brand'}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting || isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
