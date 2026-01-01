import { getOrders } from '@/lib/orders';
import { Package } from 'lucide-react';
import { OrdersDataTable } from './orders-data-table';

export default async function AdminOrdersPage() {
  const { orders, count } = await getOrders({ limit: 500 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">{count} total orders</p>
          </div>
        </div>
      </div>

      <OrdersDataTable orders={orders} />
    </div>
  );
}
