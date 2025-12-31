import { BarChart3, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AnalyticsPage() {
    const supabase = await createClient();

    // Fetch real store metrics
    const [
        { count: totalProducts },
        { count: totalBrands },
        { count: totalServices },
        { count: totalOrders },
        { data: recentOrders },
    ] = await Promise.all([
        supabase.from('products_published').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total, status, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    // Calculate order stats
    const totalRevenue = (recentOrders || []).reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingOrders = (recentOrders || []).filter((o) => o.status === 'pending').length;

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                    <h1 className="text-3xl font-bold">Store Analytics</h1>
                    <p className="text-gray-600">
                        Insights for your live store
                    </p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Package className="h-5 w-5" />
                        <span className="text-sm">Published Products</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{totalProducts || 0}</p>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="text-sm">Total Orders</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{totalOrders || 0}</p>
                    {pendingOrders > 0 && (
                        <p className="text-sm text-orange-600">{pendingOrders} pending</p>
                    )}
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-5 w-5" />
                        <span className="text-sm">Recent Revenue</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-green-600">
                        ${totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Last 10 orders</p>
                </div>

                <div className="rounded-lg border bg-white p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm">Catalog Size</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {(totalBrands || 0) + (totalServices || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {totalBrands || 0} brands, {totalServices || 0} services
                    </p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="rounded-lg border bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
                {(recentOrders || []).length === 0 ? (
                    <p className="text-gray-500">No orders yet.</p>
                ) : (
                    <div className="space-y-3">
                        {(recentOrders || []).map((order, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                                <div>
                                    <span
                                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${order.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : order.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className="font-semibold text-green-600">
                                    ${(order.total || 0).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
