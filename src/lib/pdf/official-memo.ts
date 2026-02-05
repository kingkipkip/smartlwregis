import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to load image helper (assuming we might need it, or we just fetch)
// For this MVP, we'll assume the user will provide a garuda.png or we fail gracefully.

export const generateOfficialMemoPDF = async (
    requests: any[], // Raw data to aggregate
    userProfile: any // Teacher info for signature
) => {
    const doc = new jsPDF();

    // 1. Font and Image Loading 
    try {
        // Regular Font
        const response = await fetch('/fonts/THSarabunNew.ttf');
        if (response.ok) {
            const blob = await response.blob();
            const base64String = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
            doc.addFileToVFS('THSarabunNew.ttf', base64String);
            doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
        }

        // Bold Font
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
        } catch (e) { }

        doc.setFont('THSarabunNew');

        // Garuda Image
        const imgResponse = await fetch('/garuda.png');
        if (imgResponse.ok) {
            const imgBlob = await imgResponse.blob();
            const imgReader = new FileReader();
            const imgBase64 = await new Promise<string>((resolve) => {
                imgReader.onload = () => resolve(imgReader.result as string);
                imgReader.readAsDataURL(imgBlob);
            });
            // Standard Garuda size ~1.5cm width (approx 15-18mm)
            const imgWidth = 17;
            const imgHeight = 15;
            // const x = (210 - imgWidth) / 2; // Old Center
            const x = 20; // Left aligned
            doc.addImage(imgBase64, 'PNG', x, 15, imgWidth, imgHeight);
        }

    } catch (e) {
        console.error("Asset error", e);
    }

    // 2. Header Section
    // Garuda: Left top. 

    doc.setFontSize(22); // Header Title
    // Move Text Down to avoid overlap with Garuda
    // doc.text("บันทึกข้อความ", 105, 40, { align: 'center' }); // Old Center
    doc.text("บันทึกข้อความ", 20, 40); // Left aligned

    doc.setFontSize(18); // Header Topic (User requested 18)
    doc.text("ส่วนราชการ", 20, 50);
    // Values can be same or slightly smaller? Let's keep 16 for content values or 18 if topic
    doc.setFontSize(16); // Content
    doc.text("โรงเรียนลาดยาววิทยาคม", 55, 50);

    doc.setFontSize(18);
    doc.text("ที่", 20, 58);
    doc.setFontSize(16);
    doc.text(".......................................................", 30, 58); // Manual adjustment

    doc.setFontSize(18);
    doc.text("วันที่", 115, 58);
    doc.setFontSize(16);
    doc.text(".......................................................", 130, 58);

    doc.setFontSize(18);
    doc.text("เรื่อง", 20, 66);
    doc.setFontSize(16);
    doc.text("รายงานผลการ   O สอบแก้ตัวครั้งที่ 1   O สอบแก้ตัว ครั้งที่ 2   O เรียนซ้ำ   ภาคเรียนที่......../............", 35, 66);

    // separator line
    doc.setLineWidth(0.1); // Thinner line
    doc.line(20, 70, 190, 70);

    // 3. Content
    doc.setFontSize(18);
    doc.text("เรียน", 20, 80);
    doc.setFontSize(16);
    doc.text("ผู้อำนวยการโรงเรียนลาดยาววิทยาคม", 35, 80);

    const indent = 35;
    doc.text("ตามที่โรงเรียนได้กำหนดให้มีการ    O สอบแก้ตัว ครั้งที่ 1    O สอบแก้ตัว ครั้งที่ 2    O เรียนซ้ำ", indent, 90);
    doc.text("ภาคเรียนที่................ ปีการศึกษา............................ ระหว่างวันที่ .........................................ถึง.........................................", 20, 98);

    // Check if we have user name
    const teacherName = userProfile?.full_name || "..................................................................";
    const userRole = userProfile?.department || ".............................................";

    doc.text(`ข้าพเจ้า  ${teacherName}  ครูกลุ่มสาระการเรียนรู้  ${userRole}`, 20, 106);
    doc.text("ได้ดำเนินการสอบแก้ตัว ดังนี้ (ตามเอกสารดังแนบ)", 20, 114);

    // 4. Table
    // Aggregation Logic: Group by Subject and Class
    // This is complex dynamic data. For the demo, we mock rows based on requests data.
    // We'll create one row per unique Subject found in requests.

    // Group requests by subject
    const subjectGroups: Record<string, any> = {};
    requests.forEach(r => {
        if (!subjectGroups[r.subject_code]) {
            subjectGroups[r.subject_code] = {
                code: r.subject_code,
                name: r.subject_name,
                count: 0
            };
        }
        subjectGroups[r.subject_code].count++;
    });

    const tableBody = Object.values(subjectGroups).map(g => [
        g.code,
        "   ", // Leave blank for manual filling or just space
        "", "", "", "", g.count, // Results columns (mock empty)
        "", "", "", "", "", // Remaining columns (mock empty)
        "" // Remark
    ]);

    // Append Total Row
    tableBody.push([
        "รวม", "",
        "", "", "", "", requests.length,
        "", "", "", "", "",
        ""
    ]);

    autoTable(doc, {
        startY: 120,
        head: [
            [
                { content: 'รหัสวิชา', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                { content: 'ชั้น', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                { content: 'จำนวนนักเรียนที่มีผลการเรียน', colSpan: 5, styles: { halign: 'center' } },
                { content: 'ผลการสอบแก้ตัว/เรียนซ้ำ\nเหลือจำนวนนักเรียนที่มีผลการเรียน', colSpan: 5, styles: { halign: 'center' } },
                { content: 'หมาย\nเหตุ', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } }
            ],
            [
                '0', 'ร', 'มส', 'มผ', 'รวม',
                '0', 'ร', 'มส', 'มผ', 'รวม'
            ]
        ],
        body: tableBody,
        theme: 'grid',
        styles: {
            font: 'THSarabunNew',
            fontSize: 14,
            cellPadding: 1,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
            textColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [255, 255, 255], // White header as per form? Or grey? Let's stick to white or light gray.
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            // Fine tune widths later
        }
    });

    // 5. Signatures
    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // If getting close to bottom, add page? 
    if (finalY > 230) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(16);
    doc.text("จึงเรียนมาเพื่อโปรดทราบ", 50, finalY);

    finalY += 20;
    const rightColX = 110;

    // Teacher Sign
    doc.text("ลงชื่อ ........................................................... ครูประจำวิชา", rightColX, finalY);
    doc.text(`( ${teacherName} )`, rightColX + 10, finalY + 8);

    finalY += 20;

    // Measurement Head Sign
    doc.text("ลงชื่อ ........................................................... งานวัดประเมินผล", rightColX, finalY);
    doc.text("( นางสาวศิมภรณ์  อุบัต )", rightColX + 10, finalY + 8);

    finalY += 30;

    // Vice Director & Director (2 columns)
    const leftColX = 20;

    doc.text("ความเห็นรองผู้อำนวยการกลุ่มบริหารวิชาการ", leftColX, finalY);
    doc.text("ความเห็นผู้อำนวยการโรงเรียนลาดยาววิทยาคม", rightColX, finalY);

    finalY += 10;
    // Use text dots instead of line to match style and avoid width issues
    doc.text("..........................................................................", leftColX, finalY);
    doc.text("..........................................................................", rightColX, finalY);

    finalY += 15;
    doc.text("ลงชื่อ ...........................................................", leftColX, finalY);
    doc.text("ลงชื่อ ...........................................................", rightColX, finalY);

    finalY += 8;
    doc.text("( นางชลดา สมัครเกษตรการ )", leftColX + 5, finalY);
    doc.text("( นางชรินรัตน์ สีทา )", rightColX + 5, finalY);

    doc.save('บันทึกข้อความ_รายงานผลการสอบแก้ตัว.pdf');
}
