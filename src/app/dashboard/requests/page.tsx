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
import Link from "next/link"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div>โปรดเข้าสู่ระบบ</div>
    }

    const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return <div className="text-red-500">Error loading requests: {error.message}</div>
    }

    const activeRequests = requests?.filter(r => ['pending', 'processing', 'waiting_approval', 'rejected'].includes(r.status)) || []
    const historyRequests = requests?.filter(r => ['completed', 'canceled'].includes(r.status)) || []

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">รอดำเนินการ</Badge>
            case 'processing':
                return <Badge className="bg-blue-500 hover:bg-blue-600">กำลังดำเนินการ</Badge>
            case 'waiting_approval':
                return <Badge className="bg-orange-500 hover:bg-orange-600">รออนุมัติส่งกลับ</Badge>
            case 'rejected':
                return <Badge className="bg-red-500 hover:bg-red-600">ส่งกลับแก้ไข</Badge>
            case 'completed':
                return <Badge className="bg-green-500 hover:bg-green-600">เสร็จสิ้น</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const RequestTable = ({ data }: { data: typeof requests }) => (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>เลขที่คำร้อง</TableHead>
                        <TableHead>วันที่ยื่น</TableHead>
                        <TableHead>ชื่อนักเรียน</TableHead>
                        <TableHead>วิชา</TableHead>
                        <TableHead>เกรดเดิม → ใหม่</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                ไม่มีรายการคำร้อง
                            </TableCell>
                        </TableRow>
                    ) : (
                        data?.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.id}</TableCell>
                                <TableCell>{req.created_at ? format(new Date(req.created_at), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{req.student_name}</span>
                                        <span className="text-xs text-muted-foreground">{req.student_id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{req.subject_name}</span>
                                        <span className="text-xs text-muted-foreground">{req.subject_code} ({req.semester}/{req.academic_year})</span>
                                    </div>
                                </TableCell>
                                <TableCell>{req.grade_old} → {req.grade_new}</TableCell>
                                <TableCell>{getStatusBadge(req.status)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/dashboard/requests/${req.id}`}>ดูรายละเอียด</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">รายการคำร้องของฉัน</h1>
                <Button asChild>
                    <Link href="/dashboard/requests/create">
                        <Plus className="mr-2 h-4 w-4" /> ยื่นคำร้องใหม่
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList>
                    <TabsTrigger value="active">กำลังดำเนินการ ({activeRequests.length})</TabsTrigger>
                    <TabsTrigger value="history">ประวัติย้อนหลัง ({historyRequests.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-4">
                    <RequestTable data={activeRequests} />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    <RequestTable data={historyRequests} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
