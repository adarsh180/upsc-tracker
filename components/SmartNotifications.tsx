'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, Settings, X, Check, Clock, Target, Trophy } from 'lucide-react';
import GlassCard from './GlassCard';

interface Notification {
  id: number;
  type: 'reminder' | 'achievement' | 'milestone' | 'motivation';
  title: string;
  message: string;
  is_read: boolean;
  scheduled_at: string;
  created_at: string;
}

interface NotificationSettings {
  study_reminder: boolean;
  break_reminder: boolean;
  achievement_alerts: boolean;
  milestone_alerts: boolean;
  motivation_quotes: boolean;
  reminder_time: string;
  break_interval: number;
}

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    study_reminder: true,
    break_reminder: true,
    achievement_alerts: true,
    milestone_alerts: true,
    motivation_quotes: true,
    reminder_time: '09:00',
    break_interval: 25
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      const data = await response.json();
      if (data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const dismissNotification = async (id: number) => {
    try {
      await fetch('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const updateSettings = async () => {
    try {
      await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'milestone': return <Target className="w-5 h-5 text-green-400" />;
      case 'motivation': return <BellRing className="w-5 h-5 text-purple-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'border-blue-400/30 bg-blue-500/10';
      case 'achievement': return 'border-yellow-400/30 bg-yellow-500/10';
      case 'milestone': return 'border-green-400/30 bg-green-500/10';
      case 'motivation': return 'border-purple-400/30 bg-purple-500/10';
      default: return 'border-gray-400/30 bg-gray-500/10';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="h-96 bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-400/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20 relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Bell className="w-8 h-8 text-indigo-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{unreadCount}</span>
                </div>
              )}
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold gradient-text-primary">Smart Notifications</h3>
              <p className="text-sm text-neutral-400">Personalized study reminders & alerts</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border transition-all ${
                  notification.is_read 
                    ? 'bg-white/5 border-white/10 opacity-75' 
                    : `${getNotificationColor(notification.type)} border-2`
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{notification.title}</h4>
                      <p className="text-sm text-neutral-300 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>{new Date(notification.created_at).toLocaleString()}</span>
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-2xl">
            <h3 className="text-xl font-semibold text-indigo-400 mb-6">Notification Settings</h3>
            
            <div className="space-y-6">
              {/* Toggle Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'study_reminder', label: 'Daily Study Reminders', desc: 'Get reminded to start studying' },
                  { key: 'break_reminder', label: 'Break Reminders', desc: 'Reminders to take breaks during study' },
                  { key: 'achievement_alerts', label: 'Achievement Alerts', desc: 'Notifications for earned badges' },
                  { key: 'milestone_alerts', label: 'Milestone Alerts', desc: 'Progress milestone notifications' },
                  { key: 'motivation_quotes', label: 'Motivation Quotes', desc: 'Daily motivational messages' }
                ].map(({ key, label, desc }) => (
                  <div key={key} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{label}</h4>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof NotificationSettings] }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          settings[key as keyof NotificationSettings] 
                            ? 'bg-indigo-500' 
                            : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          settings[key as keyof NotificationSettings] 
                            ? 'translate-x-6' 
                            : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Time Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Daily Reminder Time
                  </label>
                  <input
                    type="time"
                    value={settings.reminder_time}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminder_time: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-400/50 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Break Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    value={settings.break_interval}
                    onChange={(e) => setSettings(prev => ({ ...prev, break_interval: parseInt(e.target.value) || 25 }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-indigo-400/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateSettings}
                className="px-4 py-2 text-sm bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}