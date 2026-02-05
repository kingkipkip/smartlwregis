import { Sidebar } from "@/components/layout/Sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MobileNav } from "@/components/layout/MobileNav"
import { getPendingRequestCount } from "@/features/requests/management-actions"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Profile for Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Fetch Notification Count (Only for staff/head/admin)
    let pendingCount = 0
    if (['staff', 'head', 'admin'].includes(profile?.role || '')) {
        pendingCount = await getPendingRequestCount()
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <Sidebar role={profile?.role} pendingCount={pendingCount} />
            </div>

            <div className="flex flex-col">
                <header className="flex h-16 items-center gap-4 bg-white/50 backdrop-blur px-4 lg:h-[60px] lg:px-6 md:hidden sticky top-0 z-30 border-b border-gray-200/50">
                    <MobileNav role={profile?.role} pendingCount={pendingCount} />
                    <span className="font-bold text-lg text-gray-900">Smart Regis</span>
                    {/* Simplified mobile header, Sidebar handles roles for desktop, 
                        if we add mobile nav we should pass role there too */}
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">
                    {children}
                </main>
            </div>
        </div>
    )
}
