import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSafeRedirectUrl } from '@/lib/auth/redirect-validation'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // SECURITY: Validate the next parameter to prevent open redirect attacks
    const next = getSafeRedirectUrl(searchParams.get('next'))

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Smart redirect: if next is default /account, check for admin/staff roles
            let finalNext = next
            if (finalNext === '/account') {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single()

                    const role = profile?.role || 'customer'
                    if (role === 'admin' || role === 'staff') {
                        finalNext = '/admin'
                    }
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${finalNext}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${finalNext}`)
            } else {
                return NextResponse.redirect(`${origin}${finalNext}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?detail=auth_error`)
}
