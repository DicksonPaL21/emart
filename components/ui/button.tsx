import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva("f-2", {
  variants: {
    variant: { default: "button-primary", secondary: "btn-default", destructive: "red", plain: "" },
    fullWidth: { true: "w-100", false: "" },
  },
  defaultVariants: { variant: "plain", fullWidth: false },
})

export function Button({ className, variant, fullWidth, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, fullWidth }), className)} {...props} />
}
