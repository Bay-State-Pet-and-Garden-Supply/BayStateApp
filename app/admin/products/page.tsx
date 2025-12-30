import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button asChild>
            <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product: any) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {product.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${product.price}</div>
              <p className="text-xs text-muted-foreground">
                {product.stock_status}
              </p>
            </CardContent>
          </Card>
        ))}
        {(!products || products.length === 0) && (
            <p className="text-muted-foreground">No products found.</p>
        )}
      </div>
    </div>
  )
}
