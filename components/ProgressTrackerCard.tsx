'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import GlassCard from './GlassCard';

export default function ProgressTrackerCard() {
  return (
    <Link href="/dashboard/progress">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <GlassCard className="cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-600/20">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-400">Progress Tracker</h3>
              <p className="text-sm text-gray-400">View detailed analytics</p>
            </div>
          </div>
          
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-blue-400 mb-2">📊</div>
            <p className="text-gray-300 text-sm">Click to view comprehensive progress analytics</p>
          </div>
        </GlassCard>
      </motion.div>
    </Link>
  );
}