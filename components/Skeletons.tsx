'use client';

import { motion } from 'framer-motion';

// Basic Skeleton
export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded ${className}`}
            style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear'
            }}
        />
    );
}

// Card Skeleton
export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`rounded-2xl p-6 ${className}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <Skeleton className="h-8 w-20 mb-4" />
            <Skeleton className="h-2 w-full rounded-full" />
        </div>
    );
}

// Stat Skeleton
export function SkeletonStat() {
    return (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-8 w-12" />
        </div>
    );
}

// Chart Skeleton
export function SkeletonChart({ height = 300 }: { height?: number }) {
    return (
        <div
            className="rounded-2xl p-6"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                height
            }}
        >
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="flex items-end gap-2 h-[calc(100%-80px)]">
                {[60, 80, 45, 90, 70, 85, 55, 75].map((h, i) => (
                    <motion.div
                        key={i}
                        className="flex-1 rounded-t bg-white/5"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                    />
                ))}
            </div>
        </div>
    );
}

// Table Skeleton
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="p-4 border-b border-white/5">
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="divide-y divide-white/5">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonStat key={i} />
                ))}
            </div>

            {/* Chart */}
            <SkeletonChart height={350} />

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}

// Page Loading Skeleton
export function PageSkeleton() {
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #0f0f23 100%)' }}>
            <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div>
                        <Skeleton className="h-7 w-40 mb-2" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>

                <DashboardSkeleton />
            </div>
        </div>
    );
}
