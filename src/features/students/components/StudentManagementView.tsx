'use client'

import { useState, useCallback } from "react"
import { CSVImporter } from "./CSVImporter"
import { StudentForm } from "./StudentForm"
import { StudentList } from "./StudentList"

export function StudentManagementView() {
    const [refreshKey, setRefreshKey] = useState(0)

    const handleSuccess = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">จัดการรายชื่อนักเรียน</h1>
                    <p className="text-muted-foreground mt-1">นำเข้า ตรวจสอบ และแก้ไขข้อมูลนักเรียนทั้งหมดในระบบ</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <CSVImporter onSuccess={handleSuccess} />
                    <StudentForm onSuccess={handleSuccess} />
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-1">
                <StudentList key={refreshKey} />
            </div>
        </div>
    )
}
