import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ManagementControls } from "@/features/requests/components/ManagementControls"

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>โปรดเข้าสู่ระบบ</div>
    }

    // Fetch Profile for Role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile) return <div>Data Error</div>

    const { id } = await params

    const { data: request, error } = await supabase
        .from('requests')
        .select('*, profiles(full_name)')
        .eq('id', id)
        .single()

    if (error || !request) {
        return notFound()
    }

    // Fetch Action Logs
    const { data: logs } = await supabase
        .from('request_logs')
        .select('*, profiles(full_name)')
        .eq('request_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/requests">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">รายละเอียดคำร้อง</h1>
                    <p className="text-muted-foreground">{request.id}</p>
                </div>
                <div className="ml-auto">
                    <Badge className={
                        request.status === 'pending' ? 'bg-yellow-500' :
                            request.status === 'completed' ? 'bg-green-500' :
                                request.status === 'rejected' ? 'bg-red-500' :
                                    request.status === 'waiting_approval' ? 'bg-orange-500' :
                                        'bg-blue-500'
                    }>
                        {request.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลนักเรียน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">รหัสนักเรียน</span>
                            <span className="font-medium">{request.student_id}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">ชื่อ-นามสกุล</span>
                            <span className="font-medium">{request.student_name}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลวิชา</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">วิชา</span>
                            <span className="font-medium text-right">{request.subject_name}<br /><span className="text-xs text-muted-foreground">({request.subject_code})</span></span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">ภาคเรียน/ปีการศึกษา</span>
                            <span className="font-medium">{request.semester}/{request.academic_year}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm text-muted-foreground">กลุ่มสาระ</span>
                            <span className="font-medium">{request.department}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>การแก้ไขผลการเรียน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-8 mb-6">
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">เกรดเดิม</div>
                                <div className="text-3xl font-bold text-gray-500">{request.grade_old}</div>
                            </div>
                            <div className="text-2xl text-muted-foreground">→</div>
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">เกรดใหม่</div>
                                <div className="text-3xl font-bold text-primary">{request.grade_new}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">เหตุผลการแก้ไข</div>
                            <div className="p-4 bg-gray-50 rounded-md text-sm italic text-gray-700">
                                {request.reason}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Log & History Section */}
                {logs && logs.length > 0 && (
                    <Card className="md:col-span-2 border-orange-100 bg-orange-50/10">
                        <CardHeader className="pb-3 border-b border-orange-100">
                            <CardTitle className="text-lg">ประวัติการดำเนินการ / หมายเหตุ</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {logs.map((log) => (
                                    <div key={log.id} className="relative pl-6 border-l-2 border-gray-200 last:border-0 pb-2">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 border-2 border-white" />
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{log.profiles?.full_name || 'System'}</span>
                                                <Badge variant="outline" className="text-[10px] px-1 h-4">{log.action}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString('th-TH')}
                                                </span>
                                            </div>
                                            {log.note && (
                                                <div className="mt-2 p-3 bg-white rounded border border-gray-100 text-sm shadow-sm">
                                                    <span className="text-xs text-muted-foreground block mb-1 font-medium">หมายเหตุ:</span>
                                                    {log.note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>


            <ManagementControls
                requestId={request.id}
                userRole={profile.role}
                currentStatus={request.status}
            />
        </div>
    )
}
