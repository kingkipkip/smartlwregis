import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"
import { cache } from "react"

export const getUserProfile = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
})
