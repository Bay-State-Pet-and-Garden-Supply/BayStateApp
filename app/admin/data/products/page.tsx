import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ProductsDataPage() {
    const supabase = await createClient();

    const { data, count } = await supabase
        .from('products_published')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);

    const products = data || [];

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/data" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
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

            {products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <p className="text-gray-600">No published products yet.</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Products from the pipeline will appear here once published.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">ID</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Price</th>
                                <th className="px-4 py-3 text-left font-medium">Stock</th>
                                <th className="px-4 py-3 text-left font-medium">Featured</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                                    <td className="px-4 py-3">{p.name}</td>
                                    <td className="px-4 py-3 text-green-600">${Number(p.price).toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded px-2 py-0.5 text-xs ${p.stock_status === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {p.stock_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{p.is_featured ? '⭐' : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
