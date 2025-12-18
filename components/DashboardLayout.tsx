'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen">
            <Sidebar />
            <main className="md:ml-64 min-h-screen pb-20 md:pb-0 transition-all">
                {children}
            </main>
            <MobileNav />
        </div>
    );
}
