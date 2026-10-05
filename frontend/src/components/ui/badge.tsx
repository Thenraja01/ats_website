import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium primaryspace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-2xs [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-primary focus-visible:ring-destructive/20 dark:bg-destructive/80 [a&]:hover:bg-destructive/90",
        outline:
          "border-border/80 text-foreground bg-card/60 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
        header: "bg-orange-500 text-primary font-semibold text-[11px] px-3 py-0.5 shadow-xs border-orange-600",
        ai: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 font-medium",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium",
        info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
