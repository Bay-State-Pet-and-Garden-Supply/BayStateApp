'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SyncButtonProps {
    type: 'products' | 'customers' | 'orders';
    label: string;
    description: string;
    action: () => Promise<void>;
}

export function SyncPanel() {
    const [activeSync, setActiveSync] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<{
        processed: number;
        created: number;
        updated: number;
        failed: number;
    } | null>(null);
    const [lastResult, setLastResult] = useState<{
        type: string;
        success: boolean;
        message: string;
    } | null>(null);

    const supabase = createClient();

    // Poll for sync progress while active
    useEffect(() => {
        if (!activeSync) return;

        const pollInterval = setInterval(async () => {
            const { data } = await supabase
                .from('migration_log')
                .select('sync_type, status, processed, created, updated, failed')
                .eq('status', 'running')
                .order('started_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setSyncStatus({
                    processed: data.processed,
                    created: data.created,
                    updated: data.updated,
                    failed: data.failed,
                });
            } else {
                // No running sync found - check if it completed
                const { data: completedData } = await supabase
                    .from('migration_log')
                    .select('sync_type, status, processed, created, updated, failed')
                    .eq('sync_type', activeSync)
                    .order('started_at', { ascending: false })
                    .limit(1)
                    .single();

                if (completedData && completedData.status !== 'running') {
                    setLastResult({
                        type: completedData.sync_type,
                        success: completedData.status === 'completed',
                        message: `${completedData.created} created, ${completedData.updated} updated, ${completedData.failed} failed`,
                    });
                    setActiveSync(null);
                    setSyncStatus(null);
                }
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [activeSync, supabase]);

    const handleSync = useCallback(async (type: string, action: () => Promise<void>) => {
        setActiveSync(type);
        setSyncStatus({ processed: 0, created: 0, updated: 0, failed: 0 });
        setLastResult(null);

        try {
            await action();
        } catch {
            setLastResult({
                type,
                success: false,
                message: 'Sync failed unexpectedly',
            });
            setActiveSync(null);
            setSyncStatus(null);
        }
    }, []);

    return (
        <div className="space-y-4">
            {/* Active sync progress */}
            {activeSync && syncStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="font-medium text-blue-900 capitalize">
                            Syncing {activeSync}...
                        </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <span className="text-green-700">+{syncStatus.created} created</span>
                        <span className="text-blue-700">~{syncStatus.updated} updated</span>
                        {syncStatus.failed > 0 && (
                            <span className="text-red-700">!{syncStatus.failed} failed</span>
                        )}
                    </div>
                </div>
            )}

            {/* Last result toast */}
            {lastResult && (
                <div className={`border rounded-lg p-4 ${lastResult.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center gap-2">
                        {lastResult.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium capitalize ${lastResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {lastResult.type} sync {lastResult.success ? 'complete' : 'failed'}
                        </span>
                        <button
                            onClick={() => setLastResult(null)}
                            className="ml-auto text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                    </div>
                    <p className={`text-sm mt-1 ${lastResult.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                        {lastResult.message}
                    </p>
                </div>
            )}

            {/* Sync buttons grid */}
            <div className="grid gap-4">
                <SyncRow
                    type="products"
                    label="Products"
                    description="Catalog sync"
                    isActive={activeSync === 'products'}
                    isDisabled={activeSync !== null}
                    onSync={handleSync}
                />
                <SyncRow
                    type="customers"
                    label="Customers"
                    description="Profile sync"
                    isActive={activeSync === 'customers'}
                    isDisabled={activeSync !== null}
                    onSync={handleSync}
                />
                <SyncRow
                    type="orders"
                    label="Orders"
                    description="Historical sync"
                    isActive={activeSync === 'orders'}
                    isDisabled={activeSync !== null}
                    onSync={handleSync}
                />
            </div>
        </div>
    );
}

function SyncRow({
    type,
    label,
    description,
    isActive,
    isDisabled,
    onSync
}: {
    type: string;
    label: string;
    description: string;
    isActive: boolean;
    isDisabled: boolean;
    onSync: (type: string, action: () => Promise<void>) => void;
}) {
    const handleClick = () => {
        onSync(type, async () => {
            const formData = new FormData();
            await fetch(`/api/admin/migration/sync?type=${type}`, {
                method: 'POST',
                body: formData
            });
        });
    };

    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isDisabled}
            >
                {isActive ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isActive ? 'Syncing...' : 'Sync'}
            </Button>
        </div>
    );
}
