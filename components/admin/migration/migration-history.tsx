'use client';

import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MigrationLogEntry } from '@/lib/admin/migration/history';

interface MigrationHistoryProps {
    initialLogs: MigrationLogEntry[];
}

export function MigrationHistory({ initialLogs }: MigrationHistoryProps) {
    const [logs, setLogs] = useState<MigrationLogEntry[]>(initialLogs);
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to real-time changes in migration_log
        const channel = supabase
            .channel('migration-log-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'migration_log',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Add new log to the top
                        setLogs((current) => [payload.new as MigrationLogEntry, ...current]);
                    } else if (payload.eventType === 'UPDATE') {
                        // Update existing log
                        setLogs((current) =>
                            current.map((log) =>
                                log.id === payload.new.id ? (payload.new as MigrationLogEntry) : log
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Sync History</CardTitle>
                <CardDescription>Real-time log of migration tasks</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {logs.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">
                                No sync history found.
                            </p>
                        )}
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="border rounded-lg p-4 space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">
                                            {log.sync_type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <StatusBadge status={log.status} />
                                </div>

                                <div className="grid grid-cols-4 gap-2 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Processed</span>
                                        <span className="font-medium">{log.processed}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Created</span>
                                        <span className="font-medium text-green-600">+{log.created}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Updated</span>
                                        <span className="font-medium text-blue-600">~{log.updated}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Failed</span>
                                        <span className="font-medium text-red-600">!{log.failed}</span>
                                    </div>
                                </div>

                                {log.status === 'running' && (
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-primary h-full animate-progress"
                                            style={{ width: '100%' }} // Indeterminate progress for now
                                        />
                                    </div>
                                )}

                                {log.errors && log.errors.length > 0 && (
                                    <div className="bg-red-50 text-red-900 rounded p-2 text-xs space-y-1">
                                        <p className="font-semibold flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Errors ({log.errors.length})
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 max-h-24 overflow-y-auto">
                                            {log.errors.map((err, i) => (
                                                <li key={i} className="truncate">
                                                    <span className="font-medium">{err.record}:</span> {err.error}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'completed':
            return (
                <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                </Badge>
            );
        case 'failed':
            return (
                <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Failed
                </Badge>
            );
        case 'running':
            return (
                <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Running
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
