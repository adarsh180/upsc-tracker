'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CountdownTimer from '@/components/CountdownTimer';
import GlassCard from '@/components/GlassCard';

export default function HomePage() {
  const router = useRouter();

  const handleDashboardAccess = () => {
    const isAuthenticated = localStorage.getItem('authenticated');
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/signin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl font-bold gradient-text mb-4">
          UPSC CSE Tracker
        </h1>
        <motion.p 
          className="text-xl text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Your AI-powered preparation companion for UPSC Civil Services
        </motion.p>
      </motion.div>

      {/* Countdown Timers */}
      <div className="grid md:grid-cols-2 gap-8 mb-12 w-full max-w-4xl">
        <CountdownTimer
          examName="UPSC CSE Prelims 2026"
          examDate="2026-05-24T00:00:00"
          color="text-blue-400"
        />
        <CountdownTimer
          examName="UPSC CSE Mains 2026"
          examDate="2026-08-21T00:00:00"
          color="text-blue-400"
        />
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12 w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GlassCard className="text-center h-full">
            <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Tracking</h3>
            <p className="text-gray-300">Track lectures, DPPs, tests, and current affairs with real-time progress</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <GlassCard className="text-center h-full">
            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-300">Get personalized recommendations and performance analytics</p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <GlassCard className="text-center h-full">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              📊
            </div>
            <h3 className="text-xl font-semibold mb-2">Visual Analytics</h3>
            <p className="text-gray-300">Interactive charts and graphs to visualize your progress</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <button onClick={handleDashboardAccess}>
          <GlassCard className="inline-flex items-center gap-3 px-8 py-4 cursor-pointer neon-glow hover:shadow-blue-500/70 transition-all duration-300">
            <span className="text-xl font-semibold">Enter Dashboard</span>
            <ArrowRight className="w-6 h-6" />
          </GlassCard>
        </button>
      </motion.div>
    </div>
  );
}