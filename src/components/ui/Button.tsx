import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "default" | "secondary" | "danger" | "outline" | "ghost" | "glass"
    size?: "sm" | "default" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {

        // Using string interpolation for variants to keep things clean.
        // In a real scenario we could use class-variance-authority (cva)
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            danger: "bg-danger text-danger-foreground hover:bg-danger/90",
            outline: "border border-border bg-transparent hover:bg-surface-hover text-foreground",
            ghost: "hover:bg-surface-hover text-foreground",
            glass: "glass-button text-foreground",
        }

        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8",
            icon: "h-9 w-9",
        }

        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.97 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
