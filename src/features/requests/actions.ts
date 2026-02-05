'use server'

import { createClient } from "@/lib/supabase/server"
import { requestSchema } from "./schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Real student lookup
export async function lookupStudent(studentId: string) {
    const supabase = await createClient()

    const { data: student, error } = await supabase
        .from('students')
        .select('id, full_name, class')
        .eq('id', studentId)
        .single()

    if (error || !student) {
        return { success: false, error: "ไม่พบข้อมูลนักเรียน" }
    }

    return {
        success: true,
        data: {
            student_id: student.id,
            student_name: student.full_name,
            class: student.class
        }
    }
}

export async function submitRequest(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "Unauthenticated" }
    }

    // Fetch teacher's department from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('department')
        .eq('id', user.id)
        .single()

    if (!profile?.department) {
        return { error: "Teacher department not found. Please update your profile." }
    }

    // Extract data from formData
    const rawData = Object.fromEntries(formData.entries())

    // Validate
    const parsed = requestSchema.safeParse(rawData)

    if (!parsed.success) {
        return { error: parsed.error.flatten().fieldErrors }
    }

    // Generate ID (REQ-YY-XXX)
    const yearSuffix = (new Date()).getFullYear() + 543 - 2500
    const randomNum = Math.floor(100 + Math.random() * 900)
    const id = `REQ-${yearSuffix}-${randomNum}`

    const { error } = await supabase.from('requests').insert({
        id,
        teacher_id: user.id,
        department: profile.department, // Use department from profile
        ...parsed.data,
        status: 'pending'
    })

    if (error) {
        return { error: "Failed to submit request: " + error.message }
    }

    revalidatePath('/dashboard/requests')
    redirect('/dashboard/requests')
}
