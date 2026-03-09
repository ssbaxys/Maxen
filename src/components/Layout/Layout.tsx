import React from 'react';
import Header from './Header';
import { useUIStore } from '../../store/uiStore';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { colorblindMode } = useUIStore();

    // Decide sidebar rendering later if needed

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${colorblindMode ? 'colorblind-filters' : ''} bg-background text-textBase`}>
            <div className="ambient-bg" />
            <Header />
            <main className="flex-grow flex flex-col relative w-full h-full">
                {children}
            </main>
        </div>
    );
};

export default Layout;
