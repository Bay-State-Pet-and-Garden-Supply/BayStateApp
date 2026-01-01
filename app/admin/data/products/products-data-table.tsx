'use client';

import { useState } from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/admin/data-table';

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  brand_id: string | null;
  stock_status: string;
  is_featured: boolean;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

interface ProductsDataTableProps {
  products: Product[];
}

export function ProductsDataTable({ products }: ProductsDataTableProps) {
  const [selected, setSelected] = useState<Product[]>([]);

  const columns: Column<Product>[] = [
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
      searchable: true,
      className: 'font-mono text-xs',
    },
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      searchable: true,
      render: (_, row) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 line-clamp-1">{row.name}</p>
          {row.description && (
            <p className="text-xs text-gray-500 line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-green-600">
          ${Number(value).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'stock_status',
      header: 'Stock',
      sortable: true,
      render: (value) => {
        const status = String(value);
        const isInStock = status === 'in_stock';
        return (
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              isInStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </span>
        );
      },
    },
    {
      key: 'is_featured',
      header: 'Featured',
      sortable: true,
      render: (value) => (value ? '⭐' : '-'),
      className: 'text-center',
    },
    {
      key: 'updated_at',
      header: 'Updated',
      sortable: true,
      render: (value) => {
        const date = new Date(String(value));
        return (
          <span className="text-xs text-gray-500">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit',
            })}
          </span>
        );
      },
    },
  ];

  const renderActions = (product: Product) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/admin/pipeline?sku=${product.sku}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/products/${product.slug}`} target="_blank">
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );

  return (
    <DataTable
      data={products}
      columns={columns}
      searchPlaceholder="Search products by name or SKU..."
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      selectable
      onSelectionChange={setSelected}
      actions={renderActions}
      emptyMessage="No published products yet."
      emptyAction={
        <Button asChild variant="outline">
          <Link href="/admin/pipeline">Go to Pipeline</Link>
        </Button>
      }
    />
  );
}
