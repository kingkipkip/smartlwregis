'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { signup } from "@/features/auth/actions"
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, User, UserPlus, Loader2, Briefcase } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        setError(null)
        try {
            const result = await signup(formData)
            if (result?.error) {
                setError(result.error)
            } else if (result?.success) {
                router.push('/guest') // New users go to guest page
            }
        } catch (e) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

            <Card className="z-10 w-full max-w-md border-0 bg-white/95 shadow-2xl backdrop-blur-sm sm:p-2">
                <CardHeader className="space-y-4 pb-2 text-center">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-8 ring-indigo-50 shadow-sm">
                        <Image src="/school_logo.png" alt="Logo" width={96} height={96} className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">ลงทะเบียนบัญชีใหม่</CardTitle>
                        <CardDescription className="text-base text-gray-600">
                            สำหรับบุคลากร (ครู/เจ้าหน้าที่)
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">ชื่อ-นามสกุล</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    placeholder="อ.สมชาย ใจดี"
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    required
                                />
                            </div>
                        </div>
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
                            <Label htmlFor="password" title="password" className="text-sm font-medium text-gray-700">รหัสผ่าน</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-sm font-medium text-gray-700">แผนกวิชา</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                                <Select name="department" required>
                                    <SelectTrigger className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all">
                                        <SelectValue placeholder="เลือกแผนกวิชาของคุณ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Thai">ภาษาไทย</SelectItem>
                                        <SelectItem value="Math">คณิตศาสตร์</SelectItem>
                                        <SelectItem value="Science">วิทยาศาสตร์</SelectItem>
                                        <SelectItem value="Social">สังคมศึกษา</SelectItem>
                                        <SelectItem value="Health">สุขศึกษา</SelectItem>
                                        <SelectItem value="Art">ศิลปะ</SelectItem>
                                        <SelectItem value="Career">การงานอาชีพ</SelectItem>
                                        <SelectItem value="Foreign">ภาษาต่างประเทศ</SelectItem>
                                        <SelectItem value="Activity">กิจกรรมพัฒนาผู้เรียน</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {error && <div className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded-md border border-red-100">{error}</div>}
                        <Button type="submit" disabled={loading} className="h-11 w-full bg-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all active:scale-[0.98]">
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            สมัครสมาชิก
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t bg-gray-50/50 p-6 text-sm">
                    <span className="text-gray-500 mr-2">มีบัญชีอยู่แล้ว? </span>
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                        เข้าสู่ระบบ
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
