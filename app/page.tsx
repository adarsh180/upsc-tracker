'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Target, TrendingUp, Sparkles, Award, BarChart3, Brain, Zap } from 'lucide-react';
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

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Precision Tracking",
      description: "Monitor every lecture, test, and revision with military precision",
      color: "text-indigo-400",
      gradient: "from-indigo-500/20 to-blue-500/10"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Intelligence", 
      description: "Advanced algorithms analyze your patterns and optimize study plans",
      color: "text-purple-400",
      gradient: "from-purple-500/20 to-pink-500/10"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Elite Analytics",
      description: "Professional-grade insights that reveal your true potential",
      color: "text-emerald-400", 
      gradient: "from-emerald-500/20 to-teal-500/10"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16 max-w-4xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Elite Preparation Platform</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-8xl font-black gradient-text mb-6 tracking-tight">
            UPSC CSE
            <br />
            <span className="text-6xl md:text-7xl">Tracker</span>
          </h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-neutral-300 mb-8 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            The most sophisticated preparation dashboard designed for 
            <span className="gradient-text-primary font-semibold"> serious aspirants </span>
            who demand excellence
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 text-sm text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>Premium Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Precision Tracking</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Countdown Timers */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-16 w-full max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <CountdownTimer
            examName="UPSC CSE Prelims 2026"
            examDate="2026-05-24T00:00:00"
            color="text-indigo-400"
          />
          <CountdownTimer
            examName="UPSC CSE Mains 2026"
            examDate="2026-08-21T00:00:00"
            color="text-purple-400"
          />
        </motion.div>

        {/* Features */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-16 w-full max-w-6xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
            >
              <GlassCard 
                className={`text-center h-full bg-gradient-to-br ${feature.gradient} border-white/10 hover:border-white/20`}
                variant="premium"
                hover={true}
                glow={true}
              >
                <div className={`${feature.color} mx-auto mb-6 p-3 rounded-2xl bg-white/5 w-fit`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-neutral-300 leading-relaxed">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <button onClick={handleDashboardAccess} className="group">
            <GlassCard 
              className="inline-flex items-center gap-4 px-10 py-5 cursor-pointer bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400/30 hover:border-indigo-400/50"
              variant="premium"
              hover={true}
              glow={true}
            >
              <span className="text-2xl font-bold gradient-text-primary">Begin Your Journey</span>
              <ArrowRight className="w-7 h-7 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" />
            </GlassCard>
          </button>
        </motion.div>

        {/* Subtle Footer */}
        <motion.div
          className="mt-16 text-center text-neutral-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
        >
          <p>Trusted by thousands of successful UPSC aspirants</p>
        </motion.div>
      </div>
    </div>
  );
}