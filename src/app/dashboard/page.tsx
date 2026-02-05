import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FilePlus, FileText, User, FileBarChart } from "lucide-react"

import { getPendingRequestCount } from "@/features/requests/management-actions"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Auth Required</div>

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    if (!profile) return <div>Profile not found</div>

    // Fetch Notification Count
    let pendingCount = 0
    if (['staff', 'head', 'admin'].includes(profile.role)) {
        pendingCount = await getPendingRequestCount()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">สวัสดี, {profile.full_name}</h1>
            <p className="text-muted-foreground">ยินดีต้อนรับสู่ระบบสมาร์ทรีจิส (Smart Regis)</p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* For Teachers */}
                {(profile.role === 'teacher' || profile.role === 'admin' || profile.role === 'head') && (
                    <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold text-gray-900">ยื่นคำร้องใหม่</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <FilePlus className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-1 text-gray-900">สร้างคำร้อง</div>
                            <p className="text-sm text-gray-500 mb-6 font-light">
                                ยื่นคำร้องขอแก้ไขผลการเรียนให้นักเรียน
                            </p>
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"><Link href="/dashboard/requests/create">เริ่มทำรายการ</Link></Button>
                        </CardContent>
                    </Card>
                )}

                {/* For Staff/Head/Admin (Registry) */}
                {(profile.role === 'staff' || profile.role === 'head' || profile.role === 'admin') && (
                    <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 border-indigo-100/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base font-semibold text-indigo-900">ฝ่ายทะเบียน / หัวหน้าหมวด</CardTitle>
                                {pendingCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                                        {pendingCount > 99 ? '99+' : pendingCount}
                                    </span>
                                )}
                            </div>
                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-1 text-indigo-900 flex items-center gap-2">
                                จัดการคำร้อง
                            </div>
                            <p className="text-sm text-gray-500 mb-6 font-light">
                                {pendingCount > 0
                                    ? `มี ${pendingCount} รายการรอการดำเนินการ`
                                    : "ตรวจสอบและพิจารณาคำร้องแก้ไขผลการเรียน"}
                            </p>
                            <Button variant="default" asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"><Link href="/dashboard/staff">พิจารณาคำร้อง</Link></Button>
                        </CardContent>
                    </Card>
                )}

                {/* For Everyone (My Requests) */}
                <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900">คำร้องของฉัน</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-1 text-gray-900">ประวัติ</div>
                        <p className="text-sm text-gray-500 mb-6 font-light">
                            ติดตามสถานะคำร้องที่คุณส่ง
                        </p>
                        <Button variant="outline" asChild className="w-full border-gray-200 hover:bg-gray-50 hover:text-gray-900"><Link href="/dashboard/requests">ดูรายการ</Link></Button>
                    </CardContent>
                </Card>

                {/* For Admin */}
                {profile.role === 'admin' && (
                    <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-semibold text-gray-900">ผู้ดูแลระบบ</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                                <User className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-1 text-gray-900">จัดการผู้ใช้</div>
                            <p className="text-sm text-gray-500 mb-6 font-light">
                                กำหนดสิทธิ์และจัดการสมาชิก
                            </p>
                            <Button variant="secondary" asChild className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100"><Link href="/dashboard/admin/users">เข้าสู่เมนู Admin</Link></Button>
                        </CardContent>
                    </Card>
                )}

                {/* Reports Link */}
                <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold text-gray-900">รายงาน</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                            <FileBarChart className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-1 text-gray-900">ภาพรวม</div>
                        <p className="text-sm text-gray-500 mb-6 font-light">
                            ดูสถิติการยื่นคำร้องทั้งหมด
                        </p>
                        <Button variant="ghost" asChild className="w-full hover:bg-orange-50 hover:text-orange-700"><Link href="/dashboard/reports">ดูรายงาน</Link></Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
