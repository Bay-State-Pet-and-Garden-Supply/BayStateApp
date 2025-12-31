'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
    phone: z.string().optional(),
})

export async function updateProfileAction(values: z.infer<typeof profileSchema>) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { error: 'Unauthorized' }
    }

    // Validate input (redundant if using Zod resolver on client, but good practice)
    const result = profileSchema.safeParse(values)
    if (!result.success) {
        return { error: 'Invalid data' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: values.fullName,
            phone: values.phone,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/account') // Update sidebar/header name if used
    revalidatePath('/account/profile')
    return { success: true }
}
