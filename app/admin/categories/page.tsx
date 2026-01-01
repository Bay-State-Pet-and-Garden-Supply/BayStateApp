import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, FolderTree } from 'lucide-react';
import { CategoriesClient } from './categories-client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  display_order: number;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories, count } = await supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .order('display_order')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderTree className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">{count || 0} categories</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Link>
        </Button>
      </div>

      <CategoriesClient categories={(categories as Category[]) || []} />
    </div>
  );
}
