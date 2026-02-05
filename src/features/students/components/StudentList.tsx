'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trash2, User } from "lucide-react"
import { StudentForm } from "./StudentForm"
import { deleteStudent } from "../actions"

export function StudentList() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const supabase = createClient()

    const fetchStudents = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('id', { ascending: true })

        if (!error && data) {
            setStudents(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("ยืนยันการลบรายชื่อนักเรียน?")) return
        const result = await deleteStudent(id)
        if (result.success) {
            fetchStudents()
        } else {
            alert("Error: " + result.error)
        }
    }

    const filteredStudents = students.filter(s =>
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.class?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="ค้นหารหัสนักเรียน ชื่อ หรือชั้นเรียน..."
                    className="pl-10 h-11"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[120px]">รหัสนักเรียน</TableHead>
                            <TableHead>ชื่อ-นามสกุล</TableHead>
                            <TableHead>ชั้น/ห้อง</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                    กำลังโหลดข้อมูล...
                                </TableCell>
                            </TableRow>
                        ) : filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                    ไม่พบรายชื่อนักเรียน
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => (
                                <TableRow key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-mono font-medium text-blue-600">{student.id}</TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="h-4 w-4 text-gray-500" />
                                            </div>
                                            {student.full_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{student.class || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <StudentForm student={student} onSuccess={fetchStudents} />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(student.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                ลบ
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-muted-foreground text-center">
                แสดงนักเรียนทั้งหมด {filteredStudents.length} คน
            </div>
        </div>
    )
}
