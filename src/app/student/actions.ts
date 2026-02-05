'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function searchStudentRequests(formData: FormData) {
    const studentId = (formData.get('student_id') as string)?.trim()
    const nationalId = (formData.get('national_id') as string)?.trim()

    if (!studentId || !nationalId) {
        return { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }
    }

    const supabase = await createClient()

    // 1. Verify student and national_id match
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, national_id')
        .eq('id', studentId)
        .single()

    if (studentError || !student) {
        return { error: 'ไม่พบข้อมูลนักเรียนในระบบ' }
    }

    if (student.national_id !== nationalId) {
        return { error: 'ข้อมูลยืนยันตัวตนไม่ถูกต้อง' }
    }

    // Redirect to results page with query param
    redirect(`/student/result?id=${studentId}`)
}
