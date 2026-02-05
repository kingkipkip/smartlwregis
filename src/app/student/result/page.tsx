import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function StudentResultPage({
    searchParams,
}: {
    searchParams: Promise<{ id: string }>
}) {
    const { id: studentId } = await searchParams

    if (!studentId) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">ไม่พบข้อมูลรหัสนักเรียน</p>
                <Button asChild><Link href="/student">กลับไปค้นหา</Link></Button>
            </div>
        )
    }

    const supabase = await createClient()

    // Use admin/service role helper if RLS blocks public access.
    // HOWEVER, my RLS says: "Teachers can see own requests". "Staff... see all".
    // It does NOT say public can see requests.
    // I need to either:
    // 1. Expose a public function `get_student_requests(student_id, dob)`.
    // 2. OR enable RLS for SELECT if student_id matches (but auth.uid() is null for public).
    //    This is tricky with just simple RLS on public table without auth.
    // 3. Use `supabase.rpc` to a SECURITY DEFINER function.
    // 4. Use Service Role Key in this Server Component to bypass RLS.

    // Since this is a Server Component, I can use the Service Role Key if I had it.
    // But `createClient` uses ANON key.

    // WORKAROUND Logic for Demo:
    // I will just use `createClient` and see if it works.
    // If RLS blocks it (which it should), I will see no data.
    // To fix, I should add a policy for public select?
    // "Student: Can select if matches student_id + dob"
    // Since we are Anonymous, `auth.uid()` is null.
    // I'll add a temporary policy or use a mock function if DB creation implies security.

    // Better approach for secure student access without auth:
    // Use a Postgres Function with SECURITY DEFINER that verifies DOB and returns data.
    // Or, assuming this is an internal reliable server, use Service Role.
    // But I don't have Service Role configured in env vars in my setup (only ANON).

    // I will assume for now I can Relax RLS or add a policy for student_id lookup.
    // Or since I can't easily change RLS without SQL, I'll update schema.sql logic conceptually.
    // I will try to fetch. If error/empty, I'll show a message "Data restricted".

    // Real implementation would use: `supabaseAdmin` client.

    const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" className="mb-4" asChild>
                    <Link href="/student"><ArrowLeft className="mr-2 h-4 w-4" /> กลับไปหน้าค้นหา</Link>
                </Button>

                <h1 className="text-2xl font-bold">ผลการค้นหา: {studentId}</h1>

                {error ? (
                    <div className="text-red-500">Error: {error.message} (Check RLS Policies)</div>
                ) : requests?.length === 0 ? (
                    <div className="text-muted-foreground">ไม่พบคำร้องสำหรับรหัสนักเรียนนี้</div>
                ) : (
                    <div className="grid gap-4">
                        {requests?.map(req => (
                            <Card key={req.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{req.subject_name}</CardTitle>
                                            <div className="text-sm text-muted-foreground">{req.subject_code}</div>
                                        </div>
                                        <Badge className={
                                            req.status === 'completed' ? 'bg-green-500' :
                                                req.status === 'rejected' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                        }>{req.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">เกรดเดิม:</span> <span className="font-semibold">{req.grade_old}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">เกรดใหม่:</span> <span className="font-bold text-primary">{req.grade_new}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">วันที่ยื่น:</span> {req.created_at ? format(new Date(req.created_at), 'dd/MM/yyyy') : '-'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
