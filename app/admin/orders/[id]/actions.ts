'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus } from '@/lib/orders';

export async function updateOrderStatusAction(
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
) {
  const success = await updateOrderStatus(id, status);

  if (!success) {
    throw new Error('Failed to update order status');
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
}
