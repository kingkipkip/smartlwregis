'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FilePlus, FileText, User, LogOut, FileBarChart, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logout } from "@/features/auth/actions"
import { UserRole } from "@/types/database.types"

interface SidebarProps {
    role?: UserRole
    onNavigate?: () => void
    pendingCount?: number
}

export function Sidebar({ role, onNavigate, pendingCount = 0 }: SidebarProps) {
    const pathname = usePathname()

    const links = [
        { name: "หน้าหลัก", href: "/dashboard", icon: LayoutDashboard },
        { name: "จัดการคำร้อง", href: "/dashboard/staff", icon: FileText, roles: ['staff', 'head', 'admin'], badge: pendingCount > 0 ? pendingCount : undefined },
        { name: "ยื่นคำร้องใหม่", href: "/dashboard/requests/create", icon: FilePlus, roles: ['teacher', 'head', 'admin'] },
        { name: "คำร้องของฉัน", href: "/dashboard/requests", icon: FileText },
        { name: "จัดการนักเรียน", href: "/dashboard/students", icon: Users, roles: ['head', 'admin'] },
        { name: "รายงาน", href: "/dashboard/reports", icon: FileBarChart, roles: ['staff', 'head', 'admin'] },
        { name: "จัดการผู้ใช้ (Admin)", href: "/dashboard/admin/users", icon: User, roles: ['admin'] },
    ]

    const handleSignOut = async () => {
        await logout()
    }

    return (
        <div className="flex select-none flex-col bg-white h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
            <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6 mb-4">
                <Link href="/" className="flex items-center gap-3 font-semibold text-lg" onClick={onNavigate}>
                    <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                        <Image src="/school_logo.png" alt="Logo" fill className="object-cover" />
                    </div>
                    <span className="text-gray-900 tracking-tight">Smart LWregis</span>
                </Link>
            </div>
            <div className="flex-1 py-2 px-3">
                <nav className="grid items-start space-y-1">
                    {links.map((link) => {
                        // Check roles: If link requires roles, hide it if user role is missing or not authorized
                        if (link.roles && (!role || !link.roles.includes(role))) {
                            return null
                        }

                        const Icon = link.icon
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onNavigate}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-sm font-medium",
                                    isActive
                                        ? "bg-gray-100/80 text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                                {link.name}
                                {/* Notification Badge */}
                                {(link as any).badge && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/50">
                                        {(link as any).badge > 99 ? '99+' : (link as any).badge}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                </Button>
            </div>
        </div>
    )
}
