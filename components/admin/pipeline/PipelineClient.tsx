'use client';

import { useState, useTransition } from 'react';
import type { PipelineProduct, PipelineStatus, StatusCount } from '@/lib/pipeline';
import { PipelineStatusTabs } from './PipelineStatusTabs';
import { PipelineProductCard } from './PipelineProductCard';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { Search, RefreshCw } from 'lucide-react';

interface PipelineClientProps {
    initialProducts: PipelineProduct[];
    initialCounts: StatusCount[];
    initialStatus: PipelineStatus;
}

export function PipelineClient({ initialProducts, initialCounts, initialStatus }: PipelineClientProps) {
    const [activeStatus, setActiveStatus] = useState<PipelineStatus>(initialStatus);
    const [products, setProducts] = useState<PipelineProduct[]>(initialProducts);
    const [counts, setCounts] = useState<StatusCount[]>(initialCounts);
    const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = async (status: PipelineStatus) => {
        setActiveStatus(status);
        setSelectedSkus(new Set());

        startTransition(async () => {
            const res = await fetch(`/api/admin/pipeline?status=${status}&search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
            }
        });
    };

    const handleSearch = async () => {
        startTransition(async () => {
            const res = await fetch(`/api/admin/pipeline?status=${activeStatus}&search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
            }
        });
    };

    const handleSelect = (sku: string) => {
        const newSelected = new Set(selectedSkus);
        if (newSelected.has(sku)) {
            newSelected.delete(sku);
        } else {
            newSelected.add(sku);
        }
        setSelectedSkus(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedSkus.size === products.length) {
            setSelectedSkus(new Set());
        } else {
            setSelectedSkus(new Set(products.map((p) => p.sku)));
        }
    };

    const handleBulkAction = async (action: 'approve' | 'publish' | 'reject' | 'consolidate') => {
        const statusMap: Record<string, Record<PipelineStatus, PipelineStatus>> = {
            approve: { consolidated: 'approved', staging: 'staging', scraped: 'scraped', approved: 'approved', published: 'published' },
            publish: { approved: 'published', staging: 'staging', scraped: 'scraped', consolidated: 'consolidated', published: 'published' },
            reject: { consolidated: 'staging', approved: 'consolidated', staging: 'staging', scraped: 'staging', published: 'approved' },
            consolidate: { staging: 'consolidated', scraped: 'consolidated', consolidated: 'consolidated', approved: 'approved', published: 'published' },
        };

        const newStatus = statusMap[action][activeStatus];

        startTransition(async () => {
            const res = await fetch('/api/admin/pipeline/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skus: Array.from(selectedSkus), newStatus }),
            });

            if (res.ok) {
                // Refresh data
                const [productsRes, countsRes] = await Promise.all([
                    fetch(`/api/admin/pipeline?status=${activeStatus}`),
                    fetch('/api/admin/pipeline/counts'),
                ]);

                if (productsRes.ok) {
                    const data = await productsRes.json();
                    setProducts(data.products);
                }
                if (countsRes.ok) {
                    const data = await countsRes.json();
                    setCounts(data.counts);
                }
                setSelectedSkus(new Set());
            }
        });
    };

    const handleView = (sku: string) => {
        // TODO: Open detail modal
        console.log('View product:', sku);
    };

    const handleRefresh = () => {
        startTransition(async () => {
            const [productsRes, countsRes] = await Promise.all([
                fetch(`/api/admin/pipeline?status=${activeStatus}&search=${encodeURIComponent(search)}`),
                fetch('/api/admin/pipeline/counts'),
            ]);

            if (productsRes.ok) {
                const data = await productsRes.json();
                setProducts(data.products);
            }
            if (countsRes.ok) {
                const data = await countsRes.json();
                setCounts(data.counts);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Status Tabs */}
            <PipelineStatusTabs
                counts={counts}
                activeStatus={activeStatus}
                onStatusChange={handleStatusChange}
            />

            {/* Search and Actions Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by SKU or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                    Refresh
                </button>

                {products.length > 0 && (
                    <button
                        onClick={handleSelectAll}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        {selectedSkus.size === products.length ? 'Deselect All' : 'Select All'}
                    </button>
                )}
            </div>

            {/* Bulk Actions */}
            <BulkActionsToolbar
                selectedCount={selectedSkus.size}
                currentStatus={activeStatus}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedSkus(new Set())}
            />

            {/* Product Grid */}
            {isPending ? (
                <div className="flex h-64 items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                    <p className="text-gray-600">No products in {activeStatus} status.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <PipelineProductCard
                            key={product.sku}
                            product={product}
                            isSelected={selectedSkus.has(product.sku)}
                            onSelect={handleSelect}
                            onView={handleView}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
