import React from 'react';
import { cn } from '../../lib/utils';
import { Card } from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    description?: React.ReactNode;
    trend?: {
        value: string | number;
        isUp: boolean;
    };
    className?: string;
    color?: 'primary' | 'secondary' | 'accent' | 'danger';
}

export const StatCard = ({ title, value, icon, description, trend, className, color = 'primary' }: StatCardProps) => {

    const colorClasses = {
        primary: 'text-primary bg-primary/10 border-primary/20',
        secondary: 'text-secondary bg-secondary/10 border-secondary/20',
        accent: 'text-accent bg-accent/10 border-accent/20',
        danger: 'text-danger bg-danger/10 border-danger/20',
    };

    return (
        <Card className={cn("relative overflow-hidden group hover:border-border-hover transition-all w-full", className)}>
            <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity ${colorClasses[color].split(' ')[0]}`}>
                {icon && React.cloneElement(icon as React.ReactElement, { size: 64 })}
            </div>

            <div className="p-6 relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
                        <h3 className="text-3xl font-bold text-foreground">{value}</h3>
                    </div>
                    {icon && (
                        <div className={cn("p-3 rounded-2xl border", colorClasses[color])}>
                            {React.cloneElement(icon as React.ReactElement, { size: 24 })}
                        </div>
                    )}
                </div>

                {(description || trend) && (
                    <div className="flex items-center gap-2 mt-2">
                        {trend && (
                            <span className={cn(
                                "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
                                trend.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-danger/10 text-danger"
                            )}>
                                {trend.isUp ? '↑' : '↓'} {trend.value}
                            </span>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
