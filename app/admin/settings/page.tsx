import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage system settings and configurations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Design Settings - Link to new page */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Palette className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Site Design</CardTitle>
                <CardDescription>
                  Banners, homepage, branding
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Customize your storefront appearance including banners, homepage sections, and branding.
            </p>
            <Link href="/admin/design">
              <Button variant="outline">Manage Design</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Data Settings - Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Data & Sync</CardTitle>
                <CardDescription>
                  Import, export, and sync settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Import and sync products, customers, and orders from legacy ShopSite store.
            </p>
            <Link href="/admin/migration">
              <Button variant="outline">Manage Migration</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
