'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BarChart3, Target, Sparkles, User } from 'lucide-react';

const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Analytics', href: '/dashboard/test-data', icon: BarChart3 },
    { label: 'Goals', href: '/dashboard/goals', icon: Target },
    { label: 'AI', href: '/dashboard/features', icon: Sparkles },
];

export default function MobileNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
            style={{
                background: 'linear-gradient(180deg, rgba(13,13,26,0.95) 0%, rgba(18,18,31,0.98) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
            }}
        >
            <div className="flex justify-around items-center py-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link key={item.href} href={item.href} className="flex-1">
                            <motion.div
                                className="flex flex-col items-center gap-1 py-2"
                                whileTap={{ scale: 0.9 }}
                            >
                                <motion.div
                                    className={`p-2 rounded-xl transition-colors ${active ? 'bg-indigo-500/20' : ''
                                        }`}
                                    animate={{ scale: active ? 1.1 : 1 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                >
                                    <item.icon
                                        className={`w-5 h-5 ${active ? 'text-indigo-400' : 'text-gray-500'
                                            }`}
                                    />
                                </motion.div>
                                <span
                                    className={`text-xs font-medium ${active ? 'text-indigo-400' : 'text-gray-500'
                                        }`}
                                >
                                    {item.label}
                                </span>
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
