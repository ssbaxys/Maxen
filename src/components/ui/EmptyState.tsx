import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    actionHref?: string;
    actionOnClick?: () => void;
    className?: string;
}

export const EmptyState = ({
    title,
    description,
    icon,
    actionLabel,
    actionHref,
    actionOnClick,
    className
}: EmptyStateProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "w-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-3xl glass-panel",
                className
            )}
        >
            {icon && (
                <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl bg-surface border border-border text-muted-foreground shadow-sm">
                    {React.cloneElement(icon as React.ReactElement, { size: 32 })}
                </div>
            )}
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
                {description}
            </p>

            {actionLabel && (
                actionHref ? (
                    <Link to={actionHref}>
                        <Button variant="default">{actionLabel}</Button>
                    </Link>
                ) : (
                    <Button variant="default" onClick={actionOnClick}>
                        {actionLabel}
                    </Button>
                )
            )}
        </motion.div>
    );
};
