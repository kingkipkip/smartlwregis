'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateRoleSchema = z.object({
    userId: z.string(),
    newRole: z.enum(['teacher', 'staff', 'head', 'admin', 'guest']),
    newDepartment: z.string().optional().nullable(),
})

export async function manageUserRole(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // Check if current user is admin
    const { data: currentUserProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!currentUserProfile || currentUserProfile.role !== 'admin') {
        return { error: "Permission Denied: Must be Admin" }
    }

    const rawData = {
        userId: formData.get('userId'),
        newRole: formData.get('newRole'),
        newDepartment: formData.get('newDepartment') === 'null' ? null : formData.get('newDepartment')
    }

    const parsed = updateRoleSchema.safeParse(rawData)
    if (!parsed.success) return { error: "Invalid Input" }

    const { userId, newRole, newDepartment } = parsed.data

    // If role is teacher or head, department is required (or at least encouraged), but for flexibility we allow null if not set
    // Casting newDepartment to any because it might be string or null, matching DepartmentType | null
    const { error } = await supabase
        .from('profiles')
        .update({
            role: newRole,
            department: newDepartment as any
        })
        .eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/admin/users')
    return { success: true }
}
