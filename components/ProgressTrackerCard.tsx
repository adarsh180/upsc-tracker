'use client';

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import GlassCard from './GlassCard';

export default function ProgressTrackerCard() {
  return (
    <Link href="/dashboard/progress">
      <motion.div 
        whileHover={{ y: -4 }} 
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <GlassCard 
          className="cursor-pointer bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border-indigo-400/20 hover:border-indigo-400/30 group"
          variant="premium"
          hover={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <TrendingUp className="w-8 h-8 text-indigo-400" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold gradient-text-primary">Progress Analytics</h3>
                <p className="text-sm text-neutral-400">Comprehensive performance insights</p>
              </div>
            </div>
            
            <motion.div
              className="text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div 
              className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <BarChart3 className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-xs text-neutral-400 font-medium">Charts</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <PieChart className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-xs text-neutral-400 font-medium">Insights</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <Activity className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <div className="text-xs text-neutral-400 font-medium">Trends</div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <div className="text-center py-4 border-t border-white/10">
            <motion.p 
              className="text-neutral-300 text-sm leading-relaxed"
              initial={{ opacity: 0.7 }}
              whileHover={{ opacity: 1 }}
            >
              Dive deep into your preparation metrics with advanced analytics and personalized recommendations
            </motion.p>
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
        </GlassCard>
      </motion.div>
    </Link>
  );
}