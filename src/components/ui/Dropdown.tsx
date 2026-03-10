import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
    label: string | React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    destructive?: boolean;
}

interface DropdownProps {
    trigger?: React.ReactNode;
    triggerText?: string;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}

export const Dropdown = ({ trigger, triggerText = 'Options', items, align = 'left', className }: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger || (
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-colors text-sm font-medium">
                        {triggerText} <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute z-50 mt-2 w-56 glass-card rounded-xl shadow-glass-lg py-1 border border-border outline-none",
                            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
                        )}
                    >
                        <div className="py-1">
                            {items.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        item.onClick?.();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                                        item.destructive
                                            ? "text-danger hover:bg-danger/10 focus:bg-danger/10"
                                            : "text-foreground hover:bg-surface-hover focus:bg-surface-hover hover:text-primary"
                                    )}
                                >
                                    {item.icon && <span className="opacity-70">{item.icon}</span>}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
