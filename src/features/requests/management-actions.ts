'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { sendLineNotify } from "@/lib/line/notify"

const actionSchema = z.object({
    requestId: z.string(),
    action: z.enum(['approve', 'reject', 'send_back', 'request_approval', 'approve_send_back', 'reject_send_back']),
    note: z.string().optional(),
})

export async function processRequest(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const rawData = {
        requestId: formData.get('requestId'),
        action: formData.get('action'),
        note: formData.get('note')
    }

    const parsed = actionSchema.safeParse(rawData)
    if (!parsed.success) return { error: "Invalid Input" }

    const { requestId, action, note } = parsed.data

    // Get current user role and name
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: "Profile not found" }
    const role = profile.role

    let newStatus = ''
    let logAction = ''

    // Logic based on Role and Action
    // Staff: Can 'approve' (finish), 'reject' (send back to teacher? Actually 'rejected' means teacher edits), 
    //        'request_approval' (ask head to reject/send back? The flow says "Send Back -> Ask Head")

    if (role === 'staff') {
        if (action === 'approve') {
            newStatus = 'completed'
            logAction = 'Staff Approved'
        } else if (action === 'send_back') {
            // Staff cannot directly send back? Needs head approval?
            // Flow: "Send Back -> Ask Head Approval"
            newStatus = 'waiting_approval' // Waiting for Head to confirm send back
            logAction = 'Staff Requested Send Back'
        } else {
            return { error: "Invalid action for staff" }
        }
    } else if (role === 'head' || role === 'admin') {
        if (action === 'approve') {
            newStatus = 'completed'
            logAction = 'Head Approved'
        } else if (action === 'send_back') {
            newStatus = 'rejected' // Directly send back to teacher
            logAction = 'Head Sent Back'
        } else if (action === 'approve_send_back') { // Approve the staff's request to send back
            newStatus = 'rejected'
            logAction = 'Head Approved Send Back'
        } else if (action === 'reject_send_back') { // Deny staff's request, force process?
            newStatus = 'processing' // Reset to processing?
            logAction = 'Head Denied Send Back'
        }
    } else {
        return { error: "Unauthorized role" }
    }

    // Update Request
    const { error: updateError } = await supabase
        .from('requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)

    if (updateError) return { error: updateError.message }

    // Log Action
    await supabase.from('request_logs').insert({
        request_id: requestId,
        actor_id: user.id,
        action: logAction,
        note: note || ''
    })

    // Send Line Notify
    const messages: Record<string, string> = {
        'completed': `✅ คำร้องได้รับการอนุมัติ\nRequest ID: ${requestId}\nโดย: ${profile.full_name}`,
        'rejected': `❌ คำร้องถูกส่งกลับแก้ไข\nRequest ID: ${requestId}\nโดย: ${profile.full_name}\nเหตุผล: ${note || '-'}`,
        'waiting_approval': `⚠️ มีคำร้องรอการอนุมัติส่งคืน (Send Back Approval)\nRequest ID: ${requestId}\nโดย: ${profile.full_name}\nเหตุผล: ${note || '-'}`,
        'processing': `🔄 คำร้องถูกปฏิเสธการส่งคืน (ให้ดำเนินการต่อ)\nRequest ID: ${requestId}\nโดย: ${profile.full_name}`
    }

    if (messages[newStatus]) {
        // We don't await this to avoid blocking the UI response if Line API is slow
        // But Next.js Server Actions usually want things to finish. 
        // Since it's critical for notification, let's await it or fire and forget safely.
        // For reliability, we await.
        await sendLineNotify(messages[newStatus])
    }

    revalidatePath(`/dashboard/requests/${requestId}`)
    revalidatePath('/dashboard/staff')

    return { success: true }
}

export async function getPendingRequestCount() {
    const supabase = await createClient()

    // Count requests with status: pending, processing, waiting_approval
    const { count, error } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'processing', 'waiting_approval'])

    if (error) {
        console.error("Error counting pending requests:", error)
        return 0
    }

    return count || 0
}
