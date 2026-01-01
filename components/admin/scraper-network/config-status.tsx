'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface ConfigCheck {
    name: string;
    status: 'ok' | 'error' | 'warning';
    message: string;
}

export function ConfigStatus() {
    const [checks, setChecks] = useState<ConfigCheck[]>([]);
    const [loading, setLoading] = useState(true);

    const runChecks = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/scraper-network/health');
            if (!res.ok) throw new Error('Health check failed');
            const data = await res.json();
            setChecks(data.checks || []);
        } catch {
            setChecks([
                { name: 'API', status: 'error', message: 'Failed to reach health endpoint' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runChecks();
    }, []);

    const getIcon = (status: ConfigCheck['status']) => {
        switch (status) {
            case 'ok':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-600" />;
        }
    };

    const allGood = checks.every(c => c.status === 'ok');

    return (
        <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h3 className="font-medium text-gray-900">Configuration Status</h3>
                <button
                    onClick={runChecks}
                    disabled={loading}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {checks.map((check) => (
                            <div key={check.name} className="flex items-start gap-3">
                                {getIcon(check.status)}
                                <div>
                                    <p className="font-medium text-gray-900">{check.name}</p>
                                    <p className="text-sm text-gray-500">{check.message}</p>
                                </div>
                            </div>
                        ))}

                        {allGood && checks.length > 0 && (
                            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                                ✓ All systems operational. Ready to scrape!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
