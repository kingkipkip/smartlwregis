'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileUp, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { importStudents } from "../actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function CSVImporter({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successCount, setSuccessCount] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setLoading(true)
        setError(null)
        setSuccessCount(null)

        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target?.result as string
            try {
                const rows = text.split('\n')
                const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

                const data = rows.slice(1).map(row => {
                    const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                    const obj: any = {}
                    headers.forEach((header, index) => {
                        obj[header] = values[index]
                    })
                    return obj
                }).filter(o => Object.values(o).some(v => v))

                const result = await importStudents(data)

                if (result.error) {
                    setError(result.error)
                } else if (result.success) {
                    setSuccessCount(result.success as number)
                    onSuccess()
                    // Reset input
                    if (fileInputRef.current) fileInputRef.current.value = ''
                }
            } catch (err) {
                setError("Failed to parse CSV file. Please ensure it is correctly formatted.")
            } finally {
                setLoading(false)
            }
        }
        reader.readAsText(file, 'UTF-8')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    นำเข้าไฟล์ CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>นำเข้านักเรียนผ่านไฟล์ CSV</DialogTitle>
                    <DialogDescription>
                        อัปโหลดไฟล์ CSV ที่มีข้อมูลนักเรียน ระบบจะทำการนำเข้าและอัปเดตข้อมูลอัตโนมัติ
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2 border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".csv"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            disabled={loading}
                        />
                        <div className="flex flex-col items-center gap-2">
                            {loading ? (
                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                            ) : (
                                <FileUp className="h-10 w-10 text-gray-400" />
                            )}
                            <div className="text-sm font-medium text-gray-900">
                                {loading ? "กำลังประมวลผล..." : "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่"}
                            </div>
                            <p className="text-xs text-gray-500">รองรับไฟล์ .csv เท่านั้น</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-900 mb-2">รูปแบบหัวตารางที่รองรับ:</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            รหัสนักเรียน (id), ชื่อ-นามสกุล (full_name), อีเมล (email), ชั้น/ห้อง (class), แผนกวิชา (department)
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-md text-red-700">
                            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                            <div className="text-sm">{error}</div>
                        </div>
                    )}

                    {successCount !== null && (
                        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-md text-green-700">
                            <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                            <div className="text-sm font-medium">
                                สำเร็จ! นำเข้าข้อมูลนักเรียนทั้งหมด {successCount} รายการเรียบร้อยแล้ว
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
