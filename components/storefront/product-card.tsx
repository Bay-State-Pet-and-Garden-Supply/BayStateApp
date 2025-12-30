import Link from 'next/link';
import { type Product } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard - Displays a product in grid layouts.
 * Shows image, name, price, and stock status.
 */
export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group h-full cursor-pointer transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col p-4">
          {/* Product Image */}
          <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-zinc-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                No image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-1 flex-col">
            {product.brand && (
              <p className="mb-1 text-xs text-zinc-500">{product.brand.name}</p>
            )}
            <h3 className="mb-2 line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-zinc-700">
              {product.name}
            </h3>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-lg font-semibold text-zinc-900">
                {formattedPrice}
              </span>
              {product.stock_status === 'out_of_stock' && (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
              {product.stock_status === 'pre_order' && (
                <Badge variant="outline">Pre-Order</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
