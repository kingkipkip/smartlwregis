'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Clock, LogOut } from "lucide-react"
import { logout } from "@/features/auth/actions"

export default function GuestPage() {
    const handleLogout = async () => {
        await logout()
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center shadow-lg border-amber-100">
                <CardHeader>
                    <div className="mx-auto bg-amber-100 p-4 rounded-full w-fit mb-4">
                        <Clock className="h-10 w-10 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">รอการอนุมัติสิทธิ์</CardTitle>
                    <CardDescription className="text-base">
                        บัญชีของคุณได้รับการลงทะเบียนเรียบร้อยแล้ว <br />
                        กรุณารอให้ผู้ดูแลระบบ (Admin) ทำการอนุมัติและกำหนดสิทธิ์ก่อนเข้าใช้งาน
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-500">
                        หากรีบร้อน โปรดติดต่อฝ่ายทะเบียน หรือผู้ดูแลระบบ
                    </p>
                </CardContent>
                <CardFooter className="justify-center border-t pt-6">
                    <Button variant="ghost" className="text-gray-500 hover:text-rose-600" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        ออกจากระบบ / กลับไปหน้า Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
