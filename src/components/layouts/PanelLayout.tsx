import React from 'react';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
    const { colorblindMode } = useUIStore();

    return (
        <div className={cn(
            "min-h-screen flex flex-col bg-background transition-colors duration-300 font-sans antialiased text-foreground selection:bg-primary/30",
            colorblindMode && 'colorblind-filters'
        )}>
            <Navbar />
            <div className="flex flex-1 w-full relative">
                <Sidebar />
                <main className="flex-1 w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 flex flex-col relative animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default PanelLayout;
