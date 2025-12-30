import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditBrandForm } from './EditBrandForm';

interface EditBrandPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: brand, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !brand) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Edit Brand</h1>
            <EditBrandForm brand={brand} />
        </div>
    );
}
