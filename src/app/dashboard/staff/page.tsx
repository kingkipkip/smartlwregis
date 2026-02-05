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
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

export default async function StaffDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>Auth required</div>

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (!profile || !['staff', 'head', 'admin'].includes(profile.role)) {
        return <div>Access Denied</div>
    }

    const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false }) // Newest first

    if (error) {
        return <div className="text-red-500">Error: {error.message}</div>
    }

    // Active: Pending, Processing, Waiting Approval (things that need attention or are in progress)
    const activeRequests = requests?.filter(r => ['pending', 'processing', 'waiting_approval'].includes(r.status)) || []

    // History: Completed, Rejected (Finished workflows or sent back)
    const historyRequests = requests?.filter(r => ['completed', 'rejected', 'canceled'].includes(r.status)) || []

    const RequestTable = ({ data, showAction = true }: { data: typeof requests, showAction?: boolean }) => (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>เลขที่</TableHead>
                        <TableHead>วันที่ยื่น</TableHead>
                        <TableHead>ครูผู้ยื่น</TableHead>
                        <TableHead>นักเรียน</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                ไม่มีรายการคำร้อง
                            </TableCell>
                        </TableRow>
                    ) : (
                        data?.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.id}</TableCell>
                                <TableCell>{req.created_at ? format(new Date(req.created_at), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                                <TableCell>Teacher ID: {req.teacher_id.slice(0, 8)}...</TableCell>
                                <TableCell>{req.student_name}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        req.status === 'pending' ? 'default' :
                                            req.status === 'waiting_approval' ? 'secondary' :
                                                req.status === 'completed' ? 'outline' : 'destructive'
                                    } className={
                                        req.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                            req.status === 'waiting_approval' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                                req.status === 'completed' ? 'border-green-500 text-green-600' : ''
                                    }>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="default" size="sm" asChild>
                                        <Link href={`/dashboard/requests/${req.id}`}>
                                            {req.status === 'completed' || req.status === 'rejected' ? 'ดูรายละเอียด' : 'พิจารณา'}
                                        </Link>
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
                <h1 className="text-2xl font-bold tracking-tight">รายการคำร้อง (เจ้าหน้าที่/หัวหน้า)</h1>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList>
                    <TabsTrigger value="active">รายการต้องดำเนินการ ({activeRequests.length})</TabsTrigger>
                    <TabsTrigger value="history">ประวัติการดำเนินการ ({historyRequests.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="mt-4">
                    <RequestTable data={activeRequests} />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    <RequestTable data={historyRequests} showAction={false} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
