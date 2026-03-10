import React from 'react';
import Navbar from '../shared/Navbar';
import Footer from '../shared/Footer';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
    const { colorblindMode } = useUIStore();

    return (
        <div className={cn(
            "min-h-screen flex flex-col transition-colors duration-300 font-sans antialiased text-foreground selection:bg-foreground/20 relative",
            colorblindMode && 'colorblind-filters'
        )}>
            <Navbar />
            <main className="flex-1 w-full flex flex-col relative z-10">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
