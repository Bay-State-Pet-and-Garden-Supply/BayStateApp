import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '../category-form';
import { FolderPlus } from 'lucide-react';

interface NewCategoryPageProps {
  searchParams: Promise<{ parent?: string }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  display_order: number;
  image_url: string | null;
  is_featured: boolean;
}

export default async function NewCategoryPage({ searchParams }: NewCategoryPageProps) {
  const { parent } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const parentCategory = parent
    ? (categories as Category[])?.find((c) => c.id === parent)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderPlus className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Category</h1>
          {parentCategory && (
            <p className="text-muted-foreground">
              Creating subcategory under &quot;{parentCategory.name}&quot;
            </p>
          )}
        </div>
      </div>

      <CategoryForm
        allCategories={(categories as Category[]) || []}
        defaultParentId={parent || null}
      />
    </div>
  );
}
