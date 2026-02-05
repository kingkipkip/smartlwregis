'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { UserRole } from "@/types/database.types"
import { useState } from "react"
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface MobileNavProps {
    role?: UserRole
    pendingCount?: number
}

export function MobileNav({ role, pendingCount }: MobileNavProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 relative">
                    <Menu className="h-6 w-6" />
                    {pendingCount && pendingCount > 0 ? (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                    ) : null}
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 border-r-0 w-[280px] bg-transparent shadow-none [&>button]:top-4 [&>button]:right-4 [&>button]:bg-white/80 [&>button]:backdrop-blur">
                <VisuallyHidden.Root>
                    <SheetTitle>Menu</SheetTitle>
                </VisuallyHidden.Root>
                <Sidebar role={role} onNavigate={() => setOpen(false)} pendingCount={pendingCount} />
            </SheetContent>
        </Sheet>
    )
}
