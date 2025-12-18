'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Target, BarChart3, TrendingUp, Brain,
    FileText, BookOpen, Settings, ChevronLeft, ChevronRight,
    Sparkles, GraduationCap, Menu, X
} from 'lucide-react';

const navItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        color: 'text-indigo-400',
        bgColor: 'from-indigo-500/20 to-blue-500/10'
    },
    {
        label: 'Test Analytics',
        href: '/dashboard/test-data',
        icon: BarChart3,
        color: 'text-emerald-400',
        bgColor: 'from-emerald-500/20 to-teal-500/10'
    },
    {
        label: 'Goals',
        href: '/dashboard/goals',
        icon: Target,
        color: 'text-purple-400',
        bgColor: 'from-purple-500/20 to-pink-500/10'
    },
    {
        label: 'Progress',
        href: '/dashboard/progress',
        icon: TrendingUp,
        color: 'text-cyan-400',
        bgColor: 'from-cyan-500/20 to-blue-500/10'
    },
    {
        label: 'Analysis',
        href: '/dashboard/analysis',
        icon: Brain,
        color: 'text-amber-400',
        bgColor: 'from-amber-500/20 to-orange-500/10'
    },
    {
        label: 'AI Features',
        href: '/dashboard/features',
        icon: Sparkles,
        color: 'text-pink-400',
        bgColor: 'from-pink-500/20 to-rose-500/10'
    },
    {
        label: 'Prediction',
        href: '/dashboard/prediction',
        icon: GraduationCap,
        color: 'text-violet-400',
        bgColor: 'from-violet-500/20 to-purple-500/10'
    },
];

const subjectItems = [
    { label: 'GS1', href: '/dashboard/gs1' },
    { label: 'GS2', href: '/dashboard/gs2' },
    { label: 'GS3', href: '/dashboard/gs3' },
    { label: 'GS4', href: '/dashboard/gs4' },
    { label: 'CSAT', href: '/dashboard/csat' },
    { label: 'Optional', href: '/dashboard/optional' },
    { label: 'Essay', href: '/dashboard/essay' },
    { label: 'Current Affairs', href: '/dashboard/current-affairs' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showSubjects, setShowSubjects] = useState(false);

    const isActive = (href: string) => pathname === href;

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-6 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <span className="text-lg font-bold text-white">UPSC Tracker</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                <motion.div
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active
                                        ? `bg-gradient-to-r ${item.bgColor} border border-white/10`
                                        : 'hover:bg-white/5'
                                        } ${collapsed ? 'justify-center' : ''}`}
                                    whileHover={{ x: collapsed ? 0 : 2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? item.color : 'text-gray-400'}`} />
                                    {!collapsed && (
                                        <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-400'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                {/* Subjects Section */}
                <div className="mt-6">
                    <button
                        onClick={() => setShowSubjects(!showSubjects)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all hover:bg-white/5 ${collapsed ? 'justify-center' : ''}`}
                    >
                        <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        {!collapsed && (
                            <>
                                <span className="text-sm font-medium text-gray-400 flex-1 text-left">Subjects</span>
                                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showSubjects ? 'rotate-90' : ''}`} />
                            </>
                        )}
                    </button>

                    <AnimatePresence>
                        {showSubjects && !collapsed && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pl-8 py-2 space-y-1">
                                    {subjectItems.map((item) => (
                                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                                            <div className={`px-3 py-2 rounded-lg text-sm transition-all ${isActive(item.href)
                                                ? 'bg-white/10 text-white'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                                }`}>
                                                {item.label}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-white/5">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:flex items-center gap-2 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5 text-gray-400 mx-auto" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-400">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                className={`hidden md:flex flex-col fixed left-0 top-0 h-screen z-40 ${collapsed ? 'w-[72px]' : 'w-64'
                    }`}
                style={{
                    background: 'linear-gradient(180deg, #0d0d1a 0%, #12121f 100%)',
                    borderRight: '1px solid rgba(255,255,255,0.06)'
                }}
                animate={{ width: collapsed ? 72 : 256 }}
                transition={{ duration: 0.2 }}
            >
                <SidebarContent />
            </motion.aside>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur-xl"
            >
                <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="md:hidden fixed left-0 top-0 h-screen w-72 z-50"
                            style={{
                                background: 'linear-gradient(180deg, #0d0d1a 0%, #12121f 100%)',
                                borderRight: '1px solid rgba(255,255,255,0.06)'
                            }}
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
