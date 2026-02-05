'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    const parsed = loginSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Invalid input' }
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data)

    if (error) {
        console.error("Login Error:", error.message)
        return { error: error.message }
    }

    console.log("Login Success for:", parsed.data.email)
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        full_name: formData.get('full_name'),
        department: formData.get('department'),
    }

    const { error } = await supabase.auth.signUp({
        email: data.email as string,
        password: data.password as string,
        options: {
            data: {
                full_name: data.full_name,
                department: data.department,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
