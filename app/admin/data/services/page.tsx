import { Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ServicesDataPage() {
    const supabase = await createClient();

    const { data, count } = await supabase
        .from('services')
        .select('*', { count: 'exact' })
        .order('name');

    const services = data || [];

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/data" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Data Explorer
                </Link>
            </div>

            <div className="mb-8 flex items-center gap-3">
                <Wrench className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold">Services</h1>
                    <p className="text-gray-600">{count || 0} services</p>
                </div>
            </div>

            {services.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <p className="text-gray-600">No services yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Price</th>
                                <th className="px-4 py-3 text-left font-medium">Unit</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {services.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{s.name}</td>
                                    <td className="px-4 py-3 text-green-600">
                                        {s.price ? `$${Number(s.price).toFixed(2)}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{s.unit || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded px-2 py-0.5 text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
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
