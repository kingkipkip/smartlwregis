'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { manageUserRole } from "@/features/admin/actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function UserRoleChange({ userId, currentRole, currentDepartment }: { userId: string, currentRole: string, currentDepartment?: string | null }) {
    const [loading, setLoading] = useState(false)

    // Local state to handle changes before "saving" if we wanted a save button, 
    // but here we might want to trigger update on change.
    // However, separating Role and Department prompts might be UI heavy.
    // Let's make it so changing either triggers the update.

    const handleRoleChange = async (value: string) => {
        if (value === currentRole) return
        setLoading(true)
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('newRole', value)
        // Keep current department when role changes, unless role is guest then clear it?
        // For simplicity, keep current department.
        formData.append('newDepartment', currentDepartment || '')

        await manageUserRole(formData)
        setLoading(false)
    }

    const handleDepartmentChange = async (value: string) => {
        if (value === currentDepartment) return
        setLoading(true)
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('newRole', currentRole)
        formData.append('newDepartment', value)

        await manageUserRole(formData)
        setLoading(false)
    }

    const departments = [
        "Thai", "Math", "Science", "Social", "Health", "Art", "Career", "Foreign", "Activity"
    ]

    // Only Teachers need to be assigned to a specific Subject Department
    // Staff, Head (Registration), and Admin are usually central
    const showDepartmentSelect = ['teacher'].includes(currentRole)

    return (
        <div className="flex items-center gap-2">
            {/* Department Select (Only for Teachers/Heads) */}
            {showDepartmentSelect && (
                <Select defaultValue={currentDepartment || undefined} onValueChange={handleDepartmentChange} disabled={loading}>
                    <SelectTrigger className="w-[130px] h-8 text-xs bg-white">
                        <SelectValue placeholder="เลือกกลุ่มสาระ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">ไม่ระบุ</SelectItem>
                        {departments.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Role Select */}
            <Select defaultValue={currentRole} onValueChange={handleRoleChange} disabled={loading}>
                <SelectTrigger className="w-[130px] h-8 text-xs font-medium">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="teacher">ครูผู้สอน (Teacher)</SelectItem>
                    <SelectItem value="staff">ทะเบียน (Staff)</SelectItem>
                    <SelectItem value="head">หัวหน้างานทะเบียน (Head)</SelectItem>
                    <SelectItem value="admin">ผู้ดูแลระบบ (Admin)</SelectItem>
                    <SelectItem value="guest">รออนุมัติ (Guest)</SelectItem>
                </SelectContent>
            </Select>

            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
    )
}
