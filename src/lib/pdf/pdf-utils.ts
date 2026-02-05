import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReportPDF = async (title: string, data: any[], headers: string[]) => {
    const doc = new jsPDF();

    // Load Thai Font (THSarabunNew)
    // We fetch it from a reliable source or local public folder
    try {
        const fontUrl = '/fonts/THSarabunNew.ttf'; // Determine if we put in public
        // Or fetch from GitHub for demo (Client side fetch)
        const response = await fetch('https://raw.githubusercontent.com/mrapichat/ThSarabunNew/master/THSarabunNew.ttf');
        const blob = await response.blob();
        const reader = new FileReader();

        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result as string;
            // Remove "data:font/ttf;base64," prefix
            const fontBase64 = base64data.split(',')[1];

            doc.addFileToVFS('THSarabunNew.ttf', fontBase64);
            doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
            doc.setFont('THSarabunNew');

            // Header
            doc.setFontSize(20);
            doc.text(title, 20, 20);

            // Date
            doc.setFontSize(14);
            doc.text(`วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}`, 20, 30);

            // Table
            autoTable(doc, {
                head: [headers],
                body: data,
                startY: 40,
                styles: {
                    font: 'THSarabunNew',
                    fontSize: 14
                },
                headStyles: {
                    fillColor: [66, 133, 244], // Blue
                }
            });

            doc.save(`${title}.pdf`);
        };
    } catch (error) {
        console.error("Error loading font:", error);
        alert("ไม่สามารถโหลดฟอนต์ภาษาไทยได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
        // Fallback to standard font (Thai won't show)
        doc.text(title, 20, 20);
        autoTable(doc, {
            head: [headers],
            body: data,
            startY: 40
        });
        doc.save(`${title}.pdf`);
    }
};
