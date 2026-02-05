export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'teacher' | 'staff' | 'head' | 'admin' | 'guest'
export type RequestStatus = 'pending' | 'processing' | 'waiting_approval' | 'rejected' | 'completed'
export type GradeType = 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F' | 'ร' | 'มส' | 'ขส' | 'ผ' | 'มผ'
export type SemesterType = '1' | '2' | 'Summer'
export type DepartmentType =
    | 'Thai'
    | 'Math'
    | 'Science'
    | 'Social'
    | 'Health'
    | 'Art'
    | 'Career'
    | 'Foreign'
    | 'Activity'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string
                    role: UserRole
                    department: DepartmentType | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    role?: UserRole
                    department?: DepartmentType | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    role?: UserRole
                    department?: DepartmentType | null
                    created_at?: string
                    updated_at?: string
                }
            }
            requests: {
                Row: {
                    id: string
                    teacher_id: string
                    student_id: string
                    student_name: string
                    subject_code: string
                    subject_name: string
                    department: DepartmentType
                    semester: SemesterType
                    academic_year: string
                    grade_old: GradeType
                    grade_new: GradeType
                    reason: string
                    status: RequestStatus
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    teacher_id: string
                    student_id: string
                    student_name: string
                    subject_code: string
                    subject_name: string
                    department: DepartmentType
                    semester: SemesterType
                    academic_year: string
                    grade_old: GradeType
                    grade_new: GradeType
                    reason: string
                    status?: RequestStatus
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    teacher_id?: string
                    student_id?: string
                    student_name?: string
                    subject_code?: string
                    subject_name?: string
                    department?: DepartmentType
                    semester?: SemesterType
                    academic_year?: string
                    grade_old?: GradeType
                    grade_new?: GradeType
                    reason?: string
                    status?: RequestStatus
                    created_at?: string
                    updated_at?: string
                }
            }
        }
    }
}
