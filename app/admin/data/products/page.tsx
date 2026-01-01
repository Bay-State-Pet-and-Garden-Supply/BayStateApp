import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductsDataTable } from './products-data-table';

export default async function ProductsDataPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  const products = data || [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/data"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Data Explorer
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <Package className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">{count || 0} published products</p>
        </div>
      </div>

      <ProductsDataTable products={products} />
    </div>
  );
}
