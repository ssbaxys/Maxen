import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface TabsContextProps {
    activeTab: string
    setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextProps | undefined>(undefined)

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue: string
    value?: string
    onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
        const [activeTab, setUncontrolledActiveTab] = React.useState(defaultValue)

        const isControlled = value !== undefined
        const currentTab = isControlled ? value : activeTab

        const setActiveTab = React.useCallback(
            (newValue: string) => {
                if (!isControlled) {
                    setUncontrolledActiveTab(newValue)
                }
                onValueChange?.(newValue)
            },
            [isControlled, onValueChange]
        )

        return (
            <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab }}>
                <div ref={ref} className={cn("w-full", className)} {...props}>
                    {children}
                </div>
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = "Tabs"

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> { }

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-lg bg-surface-hover/30 p-1 text-muted-foreground",
                className
            )}
            {...props}
        />
    )
)
TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsTrigger must be used within Tabs")

        const isActive = context.activeTab === value

        return (
            <button
                ref={ref}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => context.setActiveTab(value)}
                className={cn(
                    "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    isActive ? "text-foreground" : "hover:text-foreground/80 hover:bg-surface-hover/50",
                    className
                )}
                {...props}
            >
                {isActive && (
                    <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 rounded-md bg-surface shadow-sm border border-border"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10">{children}</span>
            </button>
        )
    }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends Omit<import("framer-motion").HTMLMotionProps<"div">, "value" | "children"> {
    value: string
    children?: React.ReactNode
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, ...props }, ref) => {
        const context = React.useContext(TabsContext)
        if (!context) throw new Error("TabsContent must be used within Tabs")

        if (context.activeTab !== value) return null

        return (
            <motion.div
                ref={ref}
                role="tabpanel"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            />
        )
    }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
