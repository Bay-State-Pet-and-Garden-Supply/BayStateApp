import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Package, ExternalLink, Eye } from 'lucide-react';

interface PublishedProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock_status: string;
  is_featured: boolean;
  images: string[] | null;
  brand_name: string | null;
  brand_slug: string | null;
  created_at: string;
}

export default async function AdminProductsPage() {
  const supabase = await createClient();
  
  const { data: products, count } = await supabase
    .from('products_published')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50);

  const parseImages = (images: unknown): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        return JSON.parse(images);
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">{count || 0} published products</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/data/products">
              View All Data
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/pipeline">
              <Plus className="mr-2 h-4 w-4" /> Add via Pipeline
            </Link>
          </Button>
        </div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16">
          <Package className="h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-600">No published products yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Products flow through the pipeline before being published
          </p>
          <Button asChild className="mt-4">
            <Link href="/admin/pipeline">
              <Plus className="mr-2 h-4 w-4" />
              Go to Pipeline
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: PublishedProduct) => {
            const images = parseImages(product.images);
            const imageUrl = images[0];
            const stockColor = product.stock_status === 'in_stock' 
              ? 'bg-green-100 text-green-700' 
              : product.stock_status === 'out_of_stock'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700';

            return (
              <Card key={product.id} className="overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <Package className="h-12 w-12" />
                    </div>
                  )}
                  {product.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {product.name}
                  </CardTitle>
                  {product.brand_name && (
                    <p className="text-xs text-muted-foreground">{product.brand_name}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <Badge className={stockColor}>
                      {product.stock_status === 'in_stock' ? 'In Stock' : 
                       product.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Pre-order'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/admin/pipeline?sku=${product.sku}`}>
                        <Eye className="mr-1 h-3 w-3" /> Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/products/${product.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {products && products.length >= 50 && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/admin/data/products">View All Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
