"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExportPDFButton } from "./ExportPDFButton" // Ensure path is correct
import { format } from "date-fns"
import { th } from "date-fns/locale"

// Interfaces
interface RequestData {
    id: string
    created_at: string
    student_id: string
    student_name: string
    subject_code: string
    subject_name: string
    grade_old: string
    grade_new: string
    status: string
    teacher_id: string
    department?: string // derived
}

interface ReportExportViewProps {
    requests: RequestData[]
    departments: string[]
}

export function ReportExportView({ requests, departments }: ReportExportViewProps) {
    const [filterType, setFilterType] = useState<"all" | "department" | "month">("all")
    const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())

    // Generate Month Options
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ]

    const filteredData = useMemo(() => {
        let data = [...requests]

        if (filterType === "department" && selectedDepartment !== "all") {
            // In current schema, requests don't strictly have 'department' column on root.
            // But UI shows it. Let's assume we pass it or it's in the object.
            // If not, we might need to filter by subject or something.
            // For Demo, we filter if propertie exists.
            data = data.filter(r => r.department === selectedDepartment)
        } else if (filterType === "month") {
            data = data.filter(r => {
                const date = new Date(r.created_at)
                return date.getMonth().toString() === selectedMonth
            })
        }

        return data
    }, [requests, filterType, selectedDepartment, selectedMonth])

    // Prepare PDF Data
    const pdfHeaders = ["เลขที่", "วันที่", "นักเรียน", "วิชา", "เกรด", "สถานะ"]
    const pdfData = filteredData.map(r => [
        r.id.substring(0, 8), // Short ID
        format(new Date(r.created_at), 'dd/MM/yy', { locale: th }),
        r.student_name,
        r.subject_code,
        `${r.grade_old} > ${r.grade_new}`,
        r.status
    ])

    const pdfTitle = `รายงานคำร้องขอแก้ไขผลการเรียน ` +
        (filterType === 'all' ? '(ทั้งหมด)' :
            filterType === 'department' ? `(กลุ่มสาระ: ${selectedDepartment})` :
                `(เดือน: ${months[parseInt(selectedMonth)]})`)

    return (
        <Card>
            <CardHeader>
                <CardTitle>ส่งออกรายงาน (PDF)</CardTitle>
                <CardDescription>เลือกเงื่อนไขข้อมูลที่ต้องการส่งออก</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>เงื่อนไขการกรอง</Label>
                        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกเงื่อนไข" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="department">แยกตามกลุ่มสาระฯ</SelectItem>
                                <SelectItem value="month">แยกตามเดือน</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {filterType === "department" && (
                        <div className="space-y-2">
                            <Label>เลือกกลุ่มสาระฯ</Label>
                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกกลุ่มสาระ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    {departments.map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {filterType === "month" && (
                        <div className="space-y-2">
                            <Label>เลือกเดือน</Label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกเดือน" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m, i) => (
                                        <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex justify-end items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        พบ {filteredData.length} รายการ
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                import("@/lib/pdf/official-memo").then(mod => {
                                    mod.generateOfficialMemoPDF(filteredData, { full_name: "ครูประจำวิชา", department: "กลุ่มสาระฯ" })
                                })
                            }}
                            disabled={filteredData.length === 0}
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            พิมพ์บันทึกข้อความ
                        </Button>
                        <ExportPDFButton
                            title={pdfTitle}
                            headers={pdfHeaders}
                            data={pdfData}
                            disabled={filteredData.length === 0}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
