'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { searchStudentRequests } from "./actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function StudentSearchPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        const result = await searchStudentRequests(formData)
        // If result is returned, it likely contains an error because success redirects
        if (result && result.error) {
            setError(result.error)
            setLoading(false)
        }
        // If result is undefined/void, it redirected (or client side handling for promise pending?)
        // Actually redirect happens on server, so we might not reach here if redirect throws?
        // But Next.js redirect() throws an error, so usually we don't catch it unless we wrap call.
        // Assuming action doesn't return on success (redirects).
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">ตรวจสอบสถานะคำร้อง</CardTitle>
                    <CardDescription>
                        กรอกข้อมูลเพื่อค้นหาคำร้องแก้ไขผลการเรียนของท่าน (ใช้รหัสนักเรียนตาม Mock Data)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="student_id">รหัสนักเรียน</Label>
                            <Input
                                id="student_id"
                                name="student_id"
                                placeholder="เลขประจำตัวนักเรียน 5 หลัก (เช่น 12345)"
                                required
                                maxLength={5}
                                pattern="\d{5}"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="national_id">เลขประจำตัวประชาชน (13 หลัก)</Label>
                            <Input
                                id="national_id"
                                name="national_id"
                                placeholder="เลขประจำตัวประชาชน 13 หลัก"
                                required
                                maxLength={13}
                                pattern="\d{13}"
                            />
                            <p className="text-xs text-muted-foreground">ใช้เพื่อยืนยันตัวตนคนยื่นคำร้อง</p>
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ตรวจสอบ
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <a href="/login" className="text-sm text-muted-foreground hover:underline">สำหรับบุคลากร Login</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
