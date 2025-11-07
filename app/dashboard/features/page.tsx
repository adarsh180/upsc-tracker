'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import StudyTimer from '@/components/StudyTimer';
import StudyNotes from '@/components/StudyNotes';
import AchievementSystem from '@/components/AchievementSystem';
import Flashcards from '@/components/Flashcards';
import QuestionBank from '@/components/QuestionBank';
import CurrentAffairs from '@/components/CurrentAffairs';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import SmartNotifications from '@/components/SmartNotifications';
import SmartQuestionGenerator from '@/components/SmartQuestionGenerator';
import EssayEvaluator from '@/components/EssayEvaluator';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <motion.div
        className="mb-12 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard
                  className="p-3 cursor-pointer bg-gradient-to-br from-blue-500/10 to-green-500/5 border-blue-400/20 hover:border-blue-400/30"
                  size="sm"
                >
                  <ArrowLeft className="w-5 h-5 text-blue-400" />
                </GlassCard>
              </motion.div>
            </Link>

            <div className="flex-1">
              <motion.div
                className="flex items-center gap-4 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-green-500/20 border border-blue-400/20">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-black gradient-text-primary tracking-tight">
                    Enhanced Features
                  </h1>
                  <p className="text-lg text-neutral-300 mt-2 leading-relaxed">
                    Advanced Study Tools • Timer • Notes • Achievements
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-sm text-neutral-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>New features to enhance your UPSC preparation journey</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="space-y-12">
        {/* Study Timer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <StudyTimer />
        </motion.div>

        {/* Achievement System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <AchievementSystem />
        </motion.div>

        {/* Study Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <StudyNotes />
        </motion.div>

        {/* Flashcards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Flashcards />
        </motion.div>

        {/* Question Bank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <QuestionBank />
        </motion.div>

        {/* Current Affairs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <CurrentAffairs />
        </motion.div>

        {/* Advanced Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <AdvancedAnalytics />
        </motion.div>

        {/* Smart Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0 }}
        >
          <SmartNotifications />
        </motion.div>

        {/* Smart Question Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
        >
          <SmartQuestionGenerator />
        </motion.div>

        {/* Essay Evaluator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 }}
        >
          <EssayEvaluator />
        </motion.div>
      </div>

      {/* Coming Soon Section */}
      <motion.div
        className="mt-12 pt-8 border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <GlassCard className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-400/20">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Coming Soon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Question Bank</h4>
              <p className="text-neutral-300">Previous year questions with detailed explanations - Available Now!</p>
            </div>
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Flashcards</h4>
              <p className="text-neutral-300">Interactive flashcards for quick revision - Available Now!</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">📊 Advanced Analytics</h4>
              <p className="text-neutral-400">Detailed performance insights and trends</p>
            </div>
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Current Affairs</h4>
              <p className="text-neutral-300">UPSC-relevant news from The Hindu & Indian Express - Available Now!</p>
            </div>
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Advanced Analytics</h4>
              <p className="text-neutral-300">Comprehensive performance insights with charts - Available Now!</p>
            </div>
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Smart Notifications</h4>
              <p className="text-neutral-300">Personalized study reminders and alerts - Available Now!</p>
            </div>
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Mobile PWA</h4>
              <p className="text-neutral-300">Progressive Web App with offline support - Available Now!</p>
            </div>
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Smart Question Generator</h4>
              <p className="text-neutral-300">AI-powered UPSC questions from any text or PDF - Available Now!</p>
            </div>
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">✅ Essay Evaluator</h4>
              <p className="text-neutral-300">AI assessment with detailed feedback for Mains essays - Available Now!</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}