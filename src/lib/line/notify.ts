export async function sendLineNotify(message: string, token: string = process.env.LINE_NOTIFY_TOKEN || '') {
    if (!token) {
        console.log('[Line Notify Mock] Token not found. Message:', message)
        return { success: false, error: 'Token not configured' }
    }

    try {
        const response = await fetch('https://notify-api.line.me/api/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}`,
            },
            body: new URLSearchParams({ message }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[Line Notify] Error:', errorText)
            return { success: false, error: errorText }
        }

        console.log('[Line Notify] Sent:', message)
        return { success: true }
    } catch (error) {
        console.error('[Line Notify] Exception:', error)
        return { success: false, error: 'Network error' }
    }
}
