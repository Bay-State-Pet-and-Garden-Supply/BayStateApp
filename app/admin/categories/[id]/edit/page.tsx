import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CategoryForm } from '../../category-form';
import { Pencil } from 'lucide-react';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
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

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the category to edit
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !category) {
    notFound();
  }

  // Fetch all categories for parent selector
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Pencil className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Editing &quot;{category.name}&quot;
          </p>
        </div>
      </div>

      <CategoryForm
        category={category as Category}
        allCategories={(allCategories as Category[]) || []}
      />
    </div>
  );
}
