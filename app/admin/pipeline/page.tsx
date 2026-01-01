import { PackagePlus } from 'lucide-react';
import { getProductsByStatus, getStatusCounts } from '@/lib/pipeline';
import { PipelineClient } from '@/components/admin/pipeline/PipelineClient';

export default async function PipelinePage() {
    // Fetch initial data server-side
    const [{ products }, counts] = await Promise.all([
        getProductsByStatus('staging', { limit: 200 }),
        getStatusCounts(),
    ]);

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center gap-3">
                <PackagePlus className="h-8 w-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold">New Product Intake</h1>
                    <p className="text-gray-600">
                        Review, enhance, and publish newly added products from ShopSite
                    </p>
                </div>
            </div>

            <PipelineClient
                initialProducts={products}
                initialCounts={counts}
                initialStatus="staging"
            />
        </div>
    );
}
