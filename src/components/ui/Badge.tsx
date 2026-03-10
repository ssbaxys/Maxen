import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "danger" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-border bg-surface hover:bg-surface-hover text-foreground",
        secondary: "border-transparent bg-secondary/10 text-secondary hover:bg-secondary/20",
        danger: "border-transparent bg-danger/10 text-danger hover:bg-danger/20",
        success: "border-transparent bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
        warning: "border-transparent bg-accent/10 text-accent hover:bg-accent/20",
        outline: "text-foreground border-border",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
