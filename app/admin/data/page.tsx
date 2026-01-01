import { Database, Package, ShoppingCart, Tag, Wrench, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface TableSummary {
    name: string;
    displayName: string;
    icon: React.ReactNode;
    count: number;
    href: string;
    description: string;
}

export default async function DataExplorerPage() {
    const supabase = await createClient();

    // Fetch counts for all tables
    const [
        { count: productsCount },
        { count: brandsCount },
        { count: servicesCount },
        { count: ordersCount },
        { count: pipelineCount },
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products_ingestion').select('*', { count: 'exact', head: true }),
    ]);

    const tables: TableSummary[] = [
        {
            name: 'products',
            displayName: 'Products',
            icon: <Package className="h-6 w-6" />,
            count: productsCount || 0,
            href: '/admin/data/products',
            description: 'Published products on your storefront',
        },
        {
            name: 'brands',
            displayName: 'Brands',
            icon: <Tag className="h-6 w-6" />,
            count: brandsCount || 0,
            href: '/admin/data/brands',
            description: 'Brand catalog with logos',
        },
        {
            name: 'services',
            displayName: 'Services',
            icon: <Wrench className="h-6 w-6" />,
            count: servicesCount || 0,
            href: '/admin/data/services',
            description: 'Service offerings',
        },
        {
            name: 'orders',
            displayName: 'Orders',
            icon: <ShoppingCart className="h-6 w-6" />,
            count: ordersCount || 0,
            href: '/admin/data/orders',
            description: 'Customer orders and order items',
        },
        {
            name: 'pipeline',
            displayName: 'Intake Queue',
            icon: <PackagePlus className="h-6 w-6" />,
            count: pipelineCount || 0,
            href: '/admin/data/pipeline',
            description: 'Raw product intake data and processing history',
        },
    ];

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center gap-3">
                <Database className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-3xl font-bold">Data Explorer</h1>
                    <p className="text-gray-600">
                        Browse and manage your store data
                    </p>
                </div>
            </div>

            {/* Table Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tables.map((table) => (
                    <Link
                        key={table.name}
                        href={table.href}
                        className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-100">
                                {table.icon}
                            </div>
                            <span className="text-2xl font-bold text-gray-900">{table.count}</span>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">{table.displayName}</h3>
                        <p className="mt-1 text-sm text-gray-500">{table.description}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 rounded-lg border bg-gray-50 p-6">
                <h2 className="mb-4 text-lg font-semibold">Database Overview</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <p className="text-sm text-gray-600">Total Records</p>
                        <p className="text-2xl font-bold">
                            {(productsCount || 0) + (brandsCount || 0) + (servicesCount || 0) + (ordersCount || 0) + (pipelineCount || 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Storefront Items</p>
                        <p className="text-2xl font-bold">
                            {(productsCount || 0) + (servicesCount || 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Intake Queue</p>
                        <p className="text-2xl font-bold">{pipelineCount || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
