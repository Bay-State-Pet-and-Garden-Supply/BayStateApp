import { Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function BrandsDataPage() {
    const supabase = await createClient();

    const { data, count } = await supabase
        .from('brands')
        .select('*', { count: 'exact' })
        .order('name');

    const brands = data || [];

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/data" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Data Explorer
                </Link>
            </div>

            <div className="mb-8 flex items-center gap-3">
                <Tag className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold">Brands</h1>
                    <p className="text-gray-600">{count || 0} brands</p>
                </div>
            </div>

            {brands.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <p className="text-gray-600">No brands yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Logo</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Slug</th>
                                <th className="px-4 py-3 text-left font-medium">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {brands.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {b.logo_url ? (
                                            <img src={b.logo_url} alt={b.name} className="h-8 w-8 rounded object-contain" />
                                        ) : (
                                            <div className="h-8 w-8 rounded bg-gray-200" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{b.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.slug}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {new Date(b.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
