import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, User, Mail, Phone, FileText } from 'lucide-react';
import { getOrderById } from '@/lib/orders';
import { updateOrderStatusAction } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const nextStatuses = {
    pending: ['processing', 'cancelled'],
    processing: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {order.order_number}
            </h1>
            <Badge className={status.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        {/* Status Actions */}
        {nextStatuses[order.status].length > 0 && (
          <div className="flex gap-2">
            {nextStatuses[order.status].map((nextStatus) => {
              const config = statusConfig[nextStatus as keyof typeof statusConfig];
              const action = updateOrderStatusAction.bind(null, order.id, nextStatus as 'processing' | 'completed' | 'cancelled');

              return (
                <form key={nextStatus} action={action}>
                  <Button
                    type="submit"
                    variant={nextStatus === 'cancelled' ? 'destructive' : 'default'}
                    size="sm"
                  >
                    Mark as {config.label}
                  </Button>
                </form>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
                        <Package className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{item.item_name}</p>
                        <p className="text-sm text-zinc-500">
                          {item.item_type === 'service' ? 'Service' : 'Product'} •{' '}
                          {formatCurrency(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-zinc-900">
                      {formatCurrency(item.total_price)}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-zinc-400" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-zinc-400" />
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-blue-600 hover:underline"
                >
                  {order.customer_email}
                </a>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-zinc-400" />
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {order.customer_phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-zinc-400" />
                  <p className="text-zinc-600">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
