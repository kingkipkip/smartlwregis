import { RequestForm } from "@/features/requests/components/RequestForm"

export default function CreateRequestPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">ยื่นคำร้องใหม่</h1>
            </div>
            <RequestForm />
        </div>
    )
}
