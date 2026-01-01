import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Tag } from 'lucide-react';
import { BrandsDataTable } from './brands-data-table';

export default async function AdminBrandsPage() {
  const supabase = await createClient();
  const { data: brands, count } = await supabase
    .from('brands')
    .select('*', { count: 'exact' })
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
            <p className="text-muted-foreground">{count || 0} brands</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" /> Add Brand
          </Link>
        </Button>
      </div>

      <BrandsDataTable brands={brands || []} />
    </div>
  );
}
