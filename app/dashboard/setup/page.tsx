'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

export default function SetupPage() {
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [error, setError] = useState('');

  const fixDatabase = async () => {
    setFixing(true);
    setError('');
    
    try {
      const response = await fetch('/api/fix-database', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFixed(true);
      } else {
        setError(data.error || 'Failed to fix database');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <GlassCard className="p-3 cursor-pointer bg-gradient-to-br from-blue-500/10 to-green-500/5 border-blue-400/20 hover:border-blue-400/30 w-fit">
              <ArrowLeft className="w-5 h-5 text-blue-400" />
            </GlassCard>
          </motion.div>
        </Link>
      </div>

      <GlassCard className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/20">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Database className="w-8 h-8 text-blue-400" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold gradient-text-primary">Database Setup</h1>
            <p className="text-sm text-neutral-400">Fix database issues and initialize new features</p>
          </div>
        </div>

        <div className="space-y-6">
          {!fixed && !error && (
            <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-yellow-400">Database Issues Detected</h3>
              </div>
              <p className="text-neutral-300 text-sm mb-4">
                The current affairs table structure needs to be updated to support new features. 
                Click the button below to fix the database.
              </p>
              <button
                onClick={fixDatabase}
                disabled={fixing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-400 transition-colors disabled:opacity-50"
              >
                {fixing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Database className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Database className="w-4 h-4" />
                )}
                {fixing ? 'Fixing Database...' : 'Fix Database'}
              </button>
            </div>
          )}

          {fixed && (
            <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-green-400">Database Fixed Successfully!</h3>
              </div>
              <p className="text-neutral-300 text-sm mb-4">
                The database has been updated and all new features are now available.
              </p>
              <Link href="/dashboard/features">
                <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-400 transition-colors">
                  View New Features
                </button>
              </Link>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold text-red-400">Error</h3>
              </div>
              <p className="text-neutral-300 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">New Features Available:</h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Smart Question Generator - Create UPSC questions from any text
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Essay Evaluator - AI-powered essay assessment with detailed feedback
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Enhanced Current Affairs - Daily news with question generation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                High-Level Question Bank - UPSC standard analytical questions
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}