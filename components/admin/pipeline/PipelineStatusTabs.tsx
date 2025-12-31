'use client';

import { useState } from 'react';
import type { PipelineStatus, StatusCount } from '@/lib/pipeline';

interface PipelineStatusTabsProps {
    counts: StatusCount[];
    activeStatus: PipelineStatus;
    onStatusChange: (status: PipelineStatus) => void;
}

const statusConfig: Record<PipelineStatus, { label: string; color: string }> = {
    staging: { label: 'Staging', color: 'bg-gray-500' },
    scraped: { label: 'Scraped', color: 'bg-blue-500' },
    consolidated: { label: 'Consolidated', color: 'bg-yellow-500' },
    approved: { label: 'Approved', color: 'bg-green-500' },
    published: { label: 'Published', color: 'bg-emerald-600' },
};

export function PipelineStatusTabs({ counts, activeStatus, onStatusChange }: PipelineStatusTabsProps) {
    const statuses: PipelineStatus[] = ['staging', 'scraped', 'consolidated', 'approved', 'published'];

    return (
        <div className="flex flex-wrap gap-2">
            {statuses.map((status) => {
                const config = statusConfig[status];
                const countData = counts.find((c) => c.status === status);
                const count = countData?.count ?? 0;
                const isActive = activeStatus === status;

                return (
                    <button
                        key={status}
                        onClick={() => onStatusChange(status)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <span className={`h-2 w-2 rounded-full ${config.color}`} />
                        <span>{config.label}</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
