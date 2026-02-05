import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentManagementView } from "@/features/students/components/StudentManagementView"
import { Users } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function StudentManagementPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Restriction: Only Head and Admin
    if (!profile || !['head', 'admin'].includes(profile.role)) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-red-100 p-6">
                    <Users className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">เข้าถึงได้เฉพาะหัวหน้าฝ่ายและผู้ดูแลระบบ</h1>
                <p className="text-muted-foreground max-w-sm">
                    คุณไม่มีสิทธิ์ในการจัดการรายชื่อนักเรียน <br />
                    โปรดติดต่อ Admin หากเชื่อว่านี่คือความผิดพลาด
                </p>
            </div>
        )
    }

    return <StudentManagementView />
}
