import { createClient } from "@/lib/supabase/server"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserRoleChange } from "./UserRoleChange"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Auth required</div>

    // Verify Admin Access
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profileError || profile?.role !== 'admin') {
        return (
            <div className="p-8 text-center space-y-4">
                <div className="text-red-500 font-semibold italic text-lg text-rose-600">
                    🚫 Access Denied. Admins only.
                </div>
                <div className="text-sm text-muted-foreground border p-4 rounded bg-gray-50 max-w-md mx-auto">
                    <p>สิทธิ์ปัจจุบันของคุณ: <strong>{profile?.role || 'null (ยังไม่ได้รับสิทธิ์)'}</strong></p>
                    <p className="mt-2 text-xs text-red-400">กรุณาติดต่อผู้ดูแลระบบเพื่อปรับปรุงสิทธิ์การใช้งาน</p>
                </div>
            </div>
        )
    }

    // Fetch all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return <div className="p-8 text-center text-red-500">Error loading users: {error.message}</div>

    // Separate Guests and Active Users
    const guests = profiles?.filter(p => p.role === 'guest') || []
    const activeUsers = profiles?.filter(p => p.role !== 'guest') || []

    // Group Active Users by Department
    const usersByDept: Record<string, typeof activeUsers> = {}
    activeUsers.forEach(user => {
        const dept = user.department || 'Unassigned' // Group null dept as Unassigned
        if (!usersByDept[dept]) {
            usersByDept[dept] = []
        }
        usersByDept[dept].push(user)
    })

    // Sort departments alphabetically or by custom order if needed
    const departments = Object.keys(usersByDept).sort()

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">จัดการผู้ใช้งาน (User Management)</h1>
                    <p className="text-sm text-muted-foreground">ตรวจสอบคำขอใหม่และจัดการบุคลากรตามหมวดหมู่</p>
                </div>
            </div>

            {/* Section 1: Guest Users (Pending Approval) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-gray-900">รออนุมัติสิทธิ์ (New Registrations)</h2>
                    <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">{guests.length}</Badge>
                </div>

                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-amber-50/50">
                            <TableRow>
                                <TableHead className="w-[250px]">ชื่อ-นามสกุล</TableHead>
                                <TableHead className="w-[200px]">อีเมล</TableHead>
                                <TableHead>วันที่สมัคร</TableHead>
                                <TableHead className="text-right">เปลี่ยนสถานะ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        ไม่มีรายการรออนุมัติ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                guests.map((u) => (
                                    <TableRow key={u.id} className="hover:bg-amber-50/30 transition-colors">
                                        <TableCell className="font-medium text-gray-900">{u.full_name}</TableCell>
                                        <TableCell className="text-gray-600">{u.email || '-'}</TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(u.created_at).toLocaleDateString('th-TH')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <UserRoleChange userId={u.id} currentRole={u.role} currentDepartment={u.department} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Section 2: Active Users (Grouped by Department) */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                    <h2 className="text-xl font-semibold text-gray-900">บุคลากร (Staff & Teachers)</h2>
                    <Badge variant="outline" className="ml-2">{activeUsers.length}</Badge>
                </div>

                {departments.map(dept => (
                    <div key={dept} className="space-y-3 pl-2">
                        <h3 className="text-lg font-medium text-gray-700 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            {dept === 'Unassigned' ? 'ยังไม่ระบุกลุ่มสาระ' : dept}
                            <span className="text-gray-400 text-sm font-normal">({usersByDept[dept].length})</span>
                        </h3>
                        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[250px]">ชื่อ-นามสกุล</TableHead>
                                        <TableHead className="w-[150px]">ตำแหน่ง (Role)</TableHead>
                                        <TableHead className="w-[200px]">อีเมล</TableHead>
                                        <TableHead className="text-right">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usersByDept[dept].map((u) => (
                                        <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-medium text-gray-900">{u.full_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    u.role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-700' :
                                                        u.role === 'head' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' :
                                                            u.role === 'staff' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                                                'border-gray-200 bg-gray-50 text-gray-700'
                                                }>
                                                    {u.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{u.email || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end">
                                                    <UserRoleChange userId={u.id} currentRole={u.role} currentDepartment={u.department} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ))}

                {activeUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                        ไม่พบข้อมูลบุคลากร
                    </div>
                )}
            </div>
        </div>
    )
}
