import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';

interface ChartCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    contentClassName?: string;
}

export const ChartCard = ({ title, description, children, action, className, contentClassName }: ChartCardProps) => {
    return (
        <Card className={cn("flex flex-col h-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    {description && <CardDescription className="text-xs">{description}</CardDescription>}
                </div>
                {action && <div>{action}</div>}
            </CardHeader>
            <CardContent className={cn("flex-1 px-4 pb-4 pt-0 w-full min-h-[200px]", contentClassName)}>
                {children}
            </CardContent>
        </Card>
    );
};
