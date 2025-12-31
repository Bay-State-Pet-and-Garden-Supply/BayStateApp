import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function OrdersDataPage() {
    const supabase = await createClient();

    const { data, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);

    const orders = data || [];

    return (
        <div className="p-8">
            <div className="mb-6">
                <Link href="/admin/data" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Data Explorer
                </Link>
            </div>

            <div className="mb-8 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-gray-600">{count || 0} orders</p>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <p className="text-gray-600">No orders yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Order #</th>
                                <th className="px-4 py-3 text-left font-medium">Customer</th>
                                <th className="px-4 py-3 text-left font-medium">Total</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs">{o.order_number || o.id.slice(0, 8)}</td>
                                    <td className="px-4 py-3">
                                        <div>{o.customer_name || '-'}</div>
                                        <div className="text-xs text-gray-500">{o.customer_email || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-green-600">
                                        ${Number(o.total || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded px-2 py-0.5 text-xs ${o.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {new Date(o.created_at).toLocaleDateString()}
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
