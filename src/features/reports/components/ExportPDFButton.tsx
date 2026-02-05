"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { generateReportPDF } from "@/lib/pdf/pdf-utils"
import { useState } from "react"

interface ExportPDFButtonProps {
    data: any[]
    headers: string[]
    title: string
    disabled?: boolean
}

export function ExportPDFButton({ data, headers, title, disabled }: ExportPDFButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            // Transform data for PDF (array of arrays)
            // Assuming data is array of objects, we map to array of values based on headers order?
            // Actually autoTable takes body as array of arrays or array of objects.
            // If objects, we need keys.
            // Let's assume the caller passes formatted data (array of arrays) or we handle it here.
            // For simplicity, let's assume 'data' passed here is ready for autoTable (RowInput[]).

            // Wait for generation (font loading is async)
            // Refactored generateReportPDF to return Promise
            await generateModifiedReportPDF(title, data, headers)
        } catch (error) {
            console.error("Export failed", error)
        } finally {
            setLoading(false)
        }
    }

    // Helper to wrap the callback-based generic function if needed, 
    // but better to fix utils to be Promise based.
    // ...

    return (
        <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || disabled}>
            <FileDown className="mr-2 h-4 w-4" />
            {loading ? 'กำลังสร้าง...' : 'ส่งออก PDF'}
        </Button>
    )
}

// Fixed version of the util function call inside component to match
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const generateModifiedReportPDF = async (title: string, data: any[], headers: string[]) => {
    const doc = new jsPDF();

    // Fetch Font
    try {
        // Load Regular
        const response = await fetch('/fonts/THSarabunNew.ttf');
        if (!response.ok) throw new Error("Font fetch failed");
        const blob = await response.blob();

        const base64String = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(blob);
        });

        doc.addFileToVFS('THSarabunNew.ttf', base64String);
        doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');

        // Load Bold (For Headers)
        try {
            const boldRes = await fetch('/fonts/THSarabunNew Bold.ttf');
            if (boldRes.ok) {
                const boldBlob = await boldRes.blob();
                const boldBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(boldBlob);
                });
                doc.addFileToVFS('THSarabunNew-Bold.ttf', boldBase64);
                doc.addFont('THSarabunNew-Bold.ttf', 'THSarabunNew', 'bold');
            }
        } catch (e) { console.warn("Bold font error", e) }

        doc.setFont('THSarabunNew');
    } catch (e) {
        console.warn("Using default font", e);
    }

    doc.setFontSize(20);
    doc.text(title, 14, 20); // x,y

    doc.setFontSize(14);
    doc.text(`สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')}`, 14, 30);

    autoTable(doc, {
        head: [headers],
        body: data,
        startY: 35,
        styles: { font: 'THSarabunNew', fontSize: 14 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`${title}.pdf`);
}
