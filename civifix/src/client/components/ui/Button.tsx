import * as React from "react"
import { cn } from "@/client/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variantClasses = {
      default: "bg-forest-600 text-white shadow hover:bg-forest-700 active:bg-forest-800",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800",
      outline: "border border-forest-300 bg-white text-forest-700 shadow-sm hover:bg-forest-50 hover:text-forest-800 active:bg-forest-100",
      secondary: "bg-sage-100 text-forest-900 shadow-sm hover:bg-sage-200 active:bg-sage-300",
      ghost: "text-forest-700 hover:bg-forest-50 hover:text-forest-900 active:bg-forest-100",
      link: "text-forest-700 underline-offset-4 hover:underline hover:text-forest-900"
    }

    const sizeClasses = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9"
    }

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (asChild) {
      // For asChild functionality, you'd need to implement Slot from Radix
      // For now, we'll just render as a button
      console.warn("asChild prop is not supported in this custom Button implementation")
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
