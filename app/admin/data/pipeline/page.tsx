import { PackagePlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { PipelineProduct } from '@/lib/pipeline';

export default async function PipelineDataPage() {
    const supabase = await createClient();

    const { data, count } = await supabase
        .from('products_ingestion')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .limit(100);

    const products = (data as PipelineProduct[]) || [];

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/data" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Data Explorer
                </Link>
            </div>

            <div className="mb-8 flex items-center gap-3">
                <PackagePlus className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold">Raw Intake Data</h1>
                    <p className="text-gray-600">{count || 0} products currently in the intake system</p>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <p className="text-gray-600">No products in the pipeline.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">SKU</th>
                                <th className="px-4 py-3 text-left font-medium">Register Name</th>
                                <th className="px-4 py-3 text-left font-medium">Clean Name</th>
                                <th className="px-4 py-3 text-left font-medium">Price</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Sources</th>
                                <th className="px-4 py-3 text-left font-medium">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((p) => (
                                <tr key={p.sku} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                                    <td className="px-4 py-3 max-w-[150px] truncate">{p.input?.name || '-'}</td>
                                    <td className="px-4 py-3 max-w-[150px] truncate">{p.consolidated?.name || '-'}</td>
                                    <td className="px-4 py-3 text-green-600">
                                        ${(p.consolidated?.price ?? p.input?.price ?? 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${p.pipeline_status === 'published' ? 'bg-green-100 text-green-700' :
                                            p.pipeline_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                p.pipeline_status === 'consolidated' ? 'bg-yellow-100 text-yellow-700' :
                                                    p.pipeline_status === 'scraped' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {p.pipeline_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {Object.keys(p.sources || {}).length || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {new Date(p.updated_at).toLocaleDateString()}
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
