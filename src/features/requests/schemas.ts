import { z } from "zod"

export const requestSchema = z.object({
    student_id: z.string().min(1, "กรุณาระบรหัสนักเรียน"),
    // These fields might be populated from lookup, but validaton ensures they exist
    student_name: z.string().min(1, "ไม่พบชื่อนักเรียน"),

    subject_code: z.string().min(1, "กรุณาระบุรหัสวิชา"),
    subject_name: z.string().min(1, "กรุณาระบุชื่อวิชา"),

    semester: z.enum(['1', '2', 'Summer'], {
        message: "กรุณาเลือกภาคเรียน"
    }),

    academic_year: z.string().regex(/^\d{4}$/, "ปีการศึกษาต้องเป็นตัวเลข 4 หลัก (เช่น 2567)"),

    grade_old: z.enum(['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส', 'ขส', 'ผ', 'มผ'], {
        message: "กรุณาเลือกเกรดเดิม"
    }),

    grade_new: z.enum(['4', '3.5', '3', '2.5', '2', '1.5', '1', '0', 'ร', 'มส', 'ขส', 'ผ', 'มผ'], {
        message: "กรุณาเลือกเกรดใหม่"
    }),

    reason: z.string()
        .min(1, "กรุณาระบุเหตุผล")
        .max(200, "เหตุผลต้องไม่เกิน 200 ตัวอักษร"),
})

export type RequestFormValues = z.infer<typeof requestSchema>
