'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import GlassCard from './GlassCard';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  // Don't show if already installed
  if (isInstalled) return null;
  
  if (typeof window !== 'undefined') {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
      return null;
    }
  }

  if (!showInstallPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
      >
        <GlassCard className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Install UPSC Tracker</h3>
                <p className="text-sm text-neutral-400">Get the app for better experience</p>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <Monitor className="w-4 h-4 text-green-400" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Fast loading</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Mobile optimized</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/30 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
            <button
              onClick={dismissPrompt}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm"
            >
              Later
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}