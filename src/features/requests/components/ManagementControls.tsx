'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { processRequest } from "../management-actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface ManagementControlsProps {
    requestId: string
    userRole: 'staff' | 'head' | 'admin' | 'teacher'
    currentStatus: string
}

export function ManagementControls({ requestId, userRole, currentStatus }: ManagementControlsProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const [note, setNote] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [actionType, setActionType] = useState<string | null>(null)

    if (userRole === 'teacher') return null
    if (currentStatus === 'completed' || currentStatus === 'rejected') return null

    // Determine available actions based on Role and Status
    // Staff: Can Approve (Done), Send Back (-> Waiting Approval)
    // Head: Can Approve (Done), Send Back (-> Rejected), Approve Send Back (-> Rejected)

    const handleAction = async () => {
        if (!actionType) return
        setIsProcessing(true)

        // Convert friendly action to server action param
        // Staff: 'Approve' -> 'approve', 'Send Back' -> 'send_back'
        // Head: 'Approve' -> 'approve', 'Send Back' -> 'send_back'
        // If status is waiting_approval and role is head: 'Approve Return' -> 'approve_send_back', 'Reject Return' -> 'reject_send_back'

        let serverAction = actionType

        // Map UI action to Server Action if needed, but handled by assigning right string

        const formData = new FormData()
        formData.append('requestId', requestId)
        formData.append('action', serverAction)
        formData.append('note', note)

        await processRequest(formData)
        setIsProcessing(false)
        setIsOpen(false)
    }

    const openDialog = (type: string) => {
        setActionType(type)
        setNote("")
        setIsOpen(true)
    }

    return (
        <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">ส่วนจัดการเจ้าหน้าที่ ({userRole})</h3>
            <div className="flex gap-4">

                {/* Approve Button - Always available for pending/processing/waiting_approval? */}
                {/* If waiting_approval, Head sees "Approve Return" and "Cancel Return" instead usually? */}
                {/* Flow says: "Head considers... Approve to Send Back... or Not Approve (Process)" */}

                {currentStatus !== 'waiting_approval' && (
                    <Button
                        onClick={() => openDialog('approve')}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        อนุมัติ / ดำเนินการเรียบร้อย
                    </Button>
                )}

                {/* Send Back Button */}
                {currentStatus !== 'waiting_approval' && (
                    <Button
                        onClick={() => openDialog('send_back')}
                        variant="destructive"
                    >
                        ส่งกลับแก้ไข
                    </Button>
                )}

                {/* Head Actions for Waiting Approval */}
                {currentStatus === 'waiting_approval' && (userRole === 'head' || userRole === 'admin') && (
                    <>
                        <Button
                            onClick={() => openDialog('approve_send_back')}
                            variant="destructive"
                        >
                            อนุมัติให้ส่งกลับ (ตามที่เสนอ)
                        </Button>
                        <Button
                            onClick={() => openDialog('reject_send_back')}
                            variant="outline"
                        >
                            ไม่อนุมัติ (ดำเนินการต่อ)
                        </Button>
                    </>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ยืนยันการดำเนินการ</DialogTitle>
                        <DialogDescription>
                            กรุณาระบุหมายเหตุ (ถ้ามี)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="หมายเหตุ..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>ยกเลิก</Button>
                        <Button onClick={handleAction} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ยืนยัน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
