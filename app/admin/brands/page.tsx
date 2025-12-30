import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';

export default async function AdminBrandsPage() {
    const supabase = await createClient();
    const { data: brands } = await supabase
        .from('brands')
        .select('*')
        .order('name');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
                <Button asChild>
                    <Link href="/admin/brands/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Brand
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {brands?.map((brand) => (
                    <Card key={brand.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {brand.name}
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/brands/${brand.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {brand.logo_url ? (
                                <img
                                    src={brand.logo_url}
                                    alt={`${brand.name} logo`}
                                    className="h-12 w-auto object-contain"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                    {brand.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                                Slug: {brand.slug}
                            </p>
                        </CardContent>
                    </Card>
                ))}
                {(!brands || brands.length === 0) && (
                    <p className="text-muted-foreground">No brands found. Add your first brand!</p>
                )}
            </div>
        </div>
    );
}
