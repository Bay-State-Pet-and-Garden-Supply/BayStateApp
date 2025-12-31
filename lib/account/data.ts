import { createClient } from '@/lib/supabase/server'
import { Address } from './types'

export async function getAddresses(): Promise<Address[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching addresses:', error)
        return []
    }

    return data as Address[]
}

export async function getWishlist() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('wishlists')
        .select(`
            product_id,
            products (
                id, name, slug, price, images, stock_status
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching wishlist:', error)
        return []
    }

    return data.map((item: any) => item.products).filter(Boolean)
}
