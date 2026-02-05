import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // We only run this middleware if the env vars are set, otherwise we skip to avoid build errors 
    // (though in reality we should error out)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return response
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected Routes Logic
    // 1. If no user, redirect to login (except for /login, /student, /auth)
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/student') &&
        !request.nextUrl.pathname.startsWith('/register')
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. If user is logged in
    if (user) {
        // Fetch Profile to check role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

        if (profile) {
            // If Guest -> Force to /guest page
            if (profile.role === 'guest' && !request.nextUrl.pathname.startsWith('/guest')) {
                const url = request.nextUrl.clone()
                url.pathname = '/guest'
                return NextResponse.redirect(url)
            }

            // If NOT Guest but trying to access /guest -> redirect to dashboard
            if (profile.role !== 'guest' && request.nextUrl.pathname.startsWith('/guest')) {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }

        // Redirect away from login/register if logged in
        if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return response
}
