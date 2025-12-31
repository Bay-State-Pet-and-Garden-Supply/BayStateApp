'use client';

import type { PipelineProduct, PipelineStatus } from '@/lib/pipeline';
import { ChevronRight, Package } from 'lucide-react';

interface PipelineProductCardProps {
    product: PipelineProduct;
    isSelected: boolean;
    onSelect: (sku: string) => void;
    onView: (sku: string) => void;
}

export function PipelineProductCard({ product, isSelected, onSelect, onView }: PipelineProductCardProps) {
    const registerName = product.input?.name || product.sku;
    const cleanName = product.consolidated?.name;
    const price = product.consolidated?.price ?? product.input?.price ?? 0;
    const hasScrapedData = Object.keys(product.sources || {}).length > 0;

    return (
        <div
            className={`rounded-lg border p-4 transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
        >
            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(product.sku)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs font-mono text-gray-500 truncate">{product.sku}</span>
                        {hasScrapedData && (
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                                Scraped
                            </span>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="font-medium text-gray-900 truncate" title={cleanName || registerName}>
                            {cleanName || registerName}
                        </p>
                        {cleanName && registerName !== cleanName && (
                            <p className="text-xs text-gray-500 truncate" title={registerName}>
                                Register: {registerName}
                            </p>
                        )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-green-600">${price.toFixed(2)}</span>
                        <button
                            onClick={() => onView(product.sku)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                            View <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
