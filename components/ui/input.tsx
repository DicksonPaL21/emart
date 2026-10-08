import * as React from "react"
import { cn } from "@/lib/utils"

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("f-1", className)} {...props} />
}
