import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/roles'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/account/profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let profile = await getProfile(user.id)

    // Lazy creation: if profile doesn't exist (e.g. user created before migration), create it now
    if (!profile) {
        const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                email: user.email,
                role: 'customer'
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating missing profile:', error)
            return (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
                    Could not load or create your profile. Please try logging out and back in.
                </div>
            )
        }
        profile = newProfile
    }

    if (!profile) {
        return (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
                An unexpected error occurred while loading your profile.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
                <p className="text-muted-foreground">Manage your personal information.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your name and contact details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm profile={profile} />
                </CardContent>
            </Card>
        </div>
    )
}
