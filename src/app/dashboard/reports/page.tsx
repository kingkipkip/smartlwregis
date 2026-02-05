import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"
import { ReportExportView } from "@/features/reports/components/ReportExportView"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Count Stats (Efficient)
    const { count: totalRequests } = await supabase.from('requests').select('*', { count: 'exact', head: true })
    const { count: pendingRequests } = await supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    const { count: completedRequests } = await supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    const { count: rejectedRequests } = await supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'rejected')

    // Fetch Full Data for Export (Limit to recent 500 for MVP performance)
    const { data: allRequests } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

    // Extract departments for filter (Unique values)
    const departments = Array.from(new Set(allRequests?.map(r => r.department).filter(Boolean) as string[])) || []

    // Stats Cards
    const stats = [
        { title: "คำร้องทั้งหมด", value: totalRequests || 0, icon: FileText, color: "text-blue-500" },
        { title: "รอดำเนินการ", value: pendingRequests || 0, icon: Clock, color: "text-yellow-500" },
        { title: "เสร็จสิ้น", value: completedRequests || 0, icon: CheckCircle, color: "text-green-500" },
        { title: "ส่งกลับแก้ไข", value: rejectedRequests || 0, icon: Users, color: "text-red-500" },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">รายงานและสถิติ</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="my-6">
                <ReportExportView
                    requests={allRequests || []}
                    departments={departments}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>คำร้องล่าสุด</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Simple List for visual filler */}
                        <div className="space-y-4">
                            {allRequests?.slice(0, 5).map(req => (
                                <div key={req.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{req.student_name}</p>
                                        <p className="text-sm text-muted-foreground">{req.subject_name}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm">
                                        {req.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>กลุ่มสาระยอดนิยม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(() => {
                                const deptCounts: Record<string, number> = {};
                                allRequests?.forEach(r => {
                                    const dept = r.department || "ไม่ระบุกลุ่มสาระ";
                                    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                                });

                                const sortedDepts = Object.entries(deptCounts)
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5);

                                const maxCount = sortedDepts[0]?.[1] || 1;

                                return sortedDepts.map(([dept, count]) => (
                                    <div key={dept} className="flex items-center">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">{dept}</p>
                                            <div className="h-2 w-full bg-secondary rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="ml-4 font-medium text-sm text-muted-foreground w-8 text-right">
                                            {count}
                                        </div>
                                    </div>
                                ));
                            })()}
                            {(!allRequests || allRequests.length === 0) && (
                                <div className="text-center text-muted-foreground py-8">
                                    ไม่มีข้อมูล
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
