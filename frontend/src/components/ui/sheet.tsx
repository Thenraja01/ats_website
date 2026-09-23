"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog"

const sheetSides = {
  top: "inset-x-0 top-0 border-b rounded-b-2xl",
  bottom: "inset-x-0 bottom-0 border-t rounded-t-2xl",
  left: "inset-y-0 left-0 h-full border-r rounded-r-2xl",
  right: "inset-y-0 right-0 h-full border-l rounded-l-2xl",
}

const slideIn = {
  top: "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
  bottom: "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
  left: "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
  right: "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
}

function Sheet({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogOverlay
      data-slot="sheet-overlay"
      className={cn("bg-black/50", className)}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "top" | "bottom" | "left" | "right"
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="sheet-portal">
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "bg-background text-foreground fixed z-50 flex flex-col shadow-xl transition duration-200",
          "data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-200 data-[state=open]:duration-200",
          sheetSides[side],
          slideIn[side],
          className
        )}
        {...props}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        {showCloseButton && (
          <DialogPrimitive.Close className="bg-background focus:ring-ring absolute top-4 right-4 z-20 flex size-8 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-hidden [&_svg]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex shrink-0 flex-col gap-1.5 border-b px-5 py-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <DialogFooter
      data-slot="sheet-footer"
      className={cn("shrink-0 border-t px-5 py-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogTitle
      data-slot="sheet-title"
      className={cn("text-base", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogDescription
      data-slot="sheet-description"
      className={cn("text-sm", className)}
      {...props}
    />
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-body"
      className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBody,
}