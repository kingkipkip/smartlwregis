'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { requestSchema, RequestFormValues } from "../schemas"
import { lookupStudent, submitRequest } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function RequestForm() {
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [studentName, setStudentName] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)

    const form = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            student_id: "",
            student_name: "",
            subject_code: "",
            subject_name: "",
            academic_year: new Date().getFullYear() + 543 + "",
            semester: "1",
            reason: "",
        },
    })

    const handleLookup = async () => {
        const id = form.getValues("student_id")
        if (!id) return form.setError("student_id", { message: "กรุณากรอกรหัสนักเรียน" })

        setIsLookingUp(true)
        try {
            const result = await lookupStudent(id)
            if (result.success && result.data) {
                setStudentName(result.data.student_name)
                form.setValue("student_name", result.data.student_name)
                form.clearErrors("student_name")
            } else {
                setStudentName(null)
                form.setError("student_id", { message: "ไม่พบนักเรียน" })
            }
        } catch (error) {
            form.setError("student_id", { message: "เกิดข้อผิดพลาดในการตรวจสอบ" })
        } finally {
            setIsLookingUp(false)
        }
    }

    const onSubmit = async (data: RequestFormValues) => {
        setServerError(null)
        try {
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => formData.append(key, value))

            const result = await submitRequest(null, formData)

            if (result?.error) {
                if (typeof result.error === 'string') {
                    setServerError(result.error)
                } else {
                    setServerError("กรุณาตรวจสอบข้อมูลให้ถูกต้อง")
                    Object.entries(result.error).forEach(([key, messages]: [any, any]) => {
                        form.setError(key, { message: messages[0] })
                    })
                }
            }
        } catch (error: any) {
            if (error.message === 'NEXT_REDIRECT') throw error
            setServerError("เกิดข้อผิดพลาดในการส่งข้อมูล")
        }
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>ยื่นคำร้องแก้ไขผลการเรียน</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Student Lookup Section */}
                        <div className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="student_id"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>รหัสนักเรียน</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น 23755" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" onClick={handleLookup} disabled={isLookingUp}>
                                {isLookingUp ? <Loader2 className="animate-spin" /> : "ตรวจสอบ"}
                            </Button>
                        </div>

                        {studentName ? (
                            <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                                ชื่อ-นามสกุล: <strong>{studentName}</strong>
                                <input type="hidden" {...form.register("student_name")} />
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="student_name"
                                render={() => (
                                    <FormItem>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="academic_year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ปีการศึกษา</FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={4} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="semester"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ภาคเรียน</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกภาคเรียน" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">1</SelectItem>
                                                <SelectItem value="2">2</SelectItem>
                                                <SelectItem value="Summer">Summer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="subject_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>รหัสวิชา</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น ค31101" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subject_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อวิชา</FormLabel>
                                        <FormControl>
                                            <Input placeholder="เช่น คณิตศาสตร์ 1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="grade_old"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ผลการเรียนเดิม</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกเกรด" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส', 'ขส', 'ผ', 'มผ'].map(g => (
                                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="grade_new"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ผลการเรียนใหม่</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกเกรด" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส', 'ขส', 'ผ', 'มผ'].map(g => (
                                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>เหตุผลการแก้ไข (ระบุไม่เกิน 200 ตัวอักษร)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="เนื่องจาก..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {serverError && (
                            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm font-medium">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" className="w-full text-lg h-12" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                            ยืนยันการยื่นคำร้อง
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
