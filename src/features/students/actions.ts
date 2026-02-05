'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const studentSchema = z.object({
    id: z.string().min(1, "Student ID is required"),
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email().optional().nullable().or(z.literal('')),
    class: z.string().optional().nullable(),
    national_id: z.string().length(13, "เลขประจำตัวประชาชนต้องมี 13 หลัก").optional().nullable().or(z.literal('')),
})

export async function upsertStudent(formData: FormData) {
    const supabase = await createClient()

    const data = {
        id: (formData.get('id') as string) || '',
        full_name: (formData.get('full_name') as string) || '',
        email: formData.get('email') as string,
        class: formData.get('class') as string,
        national_id: formData.get('national_id') as string,
    }

    const parsed = studentSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { error } = await supabase
        .from('students')
        .upsert(parsed.data, { onConflict: 'id' })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/students')
    return { success: true }
}

export async function importStudents(students: any[]) {
    const supabase = await createClient()

    // Filter and validate data
    const validStudents = students
        .map(s => ({
            id: String(s.id || s['รหัสนักเรียน'] || '').trim(),
            full_name: String(s.full_name || s['ชื่อ-นามสกุล'] || '').trim(),
            email: String(s.email || s['อีเมล'] || '').trim(),
            class: String(s.class || s['ชั้น/ห้อง'] || '').trim(),
            national_id: String(s.national_id || s['เลขประจำตัวประชาชน'] || '').trim(),
        }))
        .filter(s => s.id && s.full_name)

    if (validStudents.length === 0) {
        return { error: "No valid student data found in CSV" }
    }

    const { error } = await supabase
        .from('students')
        .upsert(validStudents, { onConflict: 'id' })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/students')
    return { success: validStudents.length }
}

export async function deleteStudent(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/students')
    return { success: true }
}
