'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { login } from "@/features/auth/actions"
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, LogIn, GraduationCap } from "lucide-react"


import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setLoading(true)
        setError(null)
        console.log("Submitting login form via onSubmit...")
        try {
            const result = await login(formData)
            console.log("Login result:", result)
            if (result?.error) {
                setError(result.error)
            } else if (result?.success) {
                console.log("Redirecting to dashboard...")
                router.push('/dashboard')
            }
        } catch (e: any) {
            console.error("Client Error:", e)
            setError("Something went wrong: " + (e.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

            <Card className="z-10 w-full max-w-md border-0 bg-white/95 shadow-2xl backdrop-blur-sm sm:p-2">
                <CardHeader className="space-y-4 pb-2 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-8 ring-blue-50 shadow-sm">
                        <Image src="/school_logo.png" alt="Logo" width={96} height={96} className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">ระบบคำร้องแก้ไขผลการเรียน</CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            เข้าสู่ระบบสำหรับบุคลากร
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">อีเมลสถานศึกษา</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="teacher@school.ac.th"
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">รหัสผ่าน</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>
                        {error && <div className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded-md border border-red-100">{error}</div>}
                        <Button type="submit" disabled={loading} className="h-11 w-full bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all active:scale-[0.98]">
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                            เข้าสู่ระบบ
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t bg-gray-50/50 p-6">
                    <div className="flex w-full items-center justify-between text-sm">
                        <span className="text-gray-500">ยังไม่มีบัญชี?</span>
                        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            ลงทะเบียนใหม่
                        </Link>
                    </div>
                    <div className="flex w-full items-center justify-between text-sm">
                        <span className="text-gray-500">นักเรียนตรวจสอบผล?</span>
                        <Link href="/student" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                            ตรวจสอบสถานะคำร้อง
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
