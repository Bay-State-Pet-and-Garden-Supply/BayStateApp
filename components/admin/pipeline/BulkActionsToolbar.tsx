'use client';

import type { PipelineStatus } from '@/lib/pipeline';

interface BulkActionsToolbarProps {
    selectedCount: number;
    currentStatus: PipelineStatus;
    onAction: (action: 'approve' | 'publish' | 'reject' | 'consolidate') => void;
    onClearSelection: () => void;
}

const nextStatusMap: Record<PipelineStatus, { action: string; nextStatus: PipelineStatus }[]> = {
    staging: [
        { action: 'consolidate', nextStatus: 'consolidated' },
    ],
    scraped: [
        { action: 'consolidate', nextStatus: 'consolidated' },
    ],
    consolidated: [
        { action: 'approve', nextStatus: 'approved' },
        { action: 'reject', nextStatus: 'staging' },
    ],
    approved: [
        { action: 'publish', nextStatus: 'published' },
        { action: 'reject', nextStatus: 'consolidated' },
    ],
    published: [],
};

const actionLabels: Record<string, string> = {
    consolidate: 'Prepare for Review',
    approve: 'Verify Data',
    publish: 'Make Live',
    reject: 'Move Back',
};

export function BulkActionsToolbar({ selectedCount, currentStatus, onAction, onClearSelection }: BulkActionsToolbarProps) {
    if (selectedCount === 0) return null;

    const actions = nextStatusMap[currentStatus];

    return (
        <div className="flex items-center gap-4 rounded-lg bg-gray-900 px-4 py-3 text-white">
            <span className="text-sm">
                {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
            </span>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                {actions.map(({ action }) => (
                    <button
                        key={action}
                        onClick={() => onAction(action as 'approve' | 'publish' | 'reject' | 'consolidate')}
                        className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${action === 'reject'
                            ? 'bg-red-600 hover:bg-red-700'
                            : action === 'publish'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {actionLabels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
                    </button>
                ))}

                <button
                    onClick={onClearSelection}
                    className="rounded px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
