'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, Loader2 } from "lucide-react"
import { upsertStudent } from "../actions"

export function StudentForm({ student, onSuccess }: { student?: any, onSuccess: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const result = await upsertStudent(formData)

            if (result.error) {
                setError(result.error)
            } else {
                setOpen(false)
                onSuccess()
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={student ? "outline" : "default"} size={student ? "sm" : "default"}>
                    {student ? "แก้ไข" : (
                        <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            เพิ่มนักเรียนพิ่มรายคน
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{student ? "แก้ไขรายชื่อนักเรียน" : "เพิ่มนักเรียนรายคน"}</DialogTitle>
                        <DialogDescription>
                            เพิ่มข้อมูนักเรียนเข้าสู่ระบบ (หากรหัสนักเรียนซ้ำจะทำการอัปเดตข้อมูลเดิม)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="id">รหัสนักเรียน</Label>
                            <Input
                                id="id"
                                name="id"
                                defaultValue={student?.id}
                                readOnly={!!student}
                                placeholder="เช่น 12345"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                defaultValue={student?.full_name}
                                placeholder="เช่น นายสมชาย ใจดี"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="national_id">เลขประจำตัวประชาชน</Label>
                            <Input
                                id="national_id"
                                name="national_id"
                                defaultValue={student?.national_id}
                                placeholder="เลข 13 หลัก"
                                maxLength={13}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="class">ชั้น/ห้อง</Label>
                            <Input
                                id="class"
                                name="class"
                                defaultValue={student?.class}
                                placeholder="เช่น ม.4/1"
                            />
                        </div>
                        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {student ? "บันทึกการแก้ไข" : "เพิ่มรายชื่อ"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
