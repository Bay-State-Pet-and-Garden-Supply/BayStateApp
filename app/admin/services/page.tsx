import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Wrench } from 'lucide-react';
import { ServicesDataTable } from './services-data-table';

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services, count } = await supabase
    .from('services')
    .select('*', { count: 'exact' })
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">{count || 0} services</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Link>
        </Button>
      </div>

      <ServicesDataTable services={services || []} />
    </div>
  );
}
