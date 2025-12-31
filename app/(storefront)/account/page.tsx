import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'

export default async function AccountPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Account Dashboard</h1>
            <p className="mb-4">Welcome back, {user.email}</p>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Profile</h2>
                    <p className="text-muted-foreground mb-4">View and edit your personal information.</p>
                    <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
                </div>

                <div className="p-6 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Orders</h2>
                    <p className="text-muted-foreground mb-4">View your purchase history.</p>
                    <Button variant="outline" disabled>View Orders (Coming Soon)</Button>
                </div>

                <div className="p-6 border rounded-lg md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Session</h2>
                    <form action={signOutAction}>
                        <Button variant="destructive">Sign Out</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
