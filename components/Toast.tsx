'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bg: 'from-emerald-500/20 to-emerald-500/5',
        border: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
        textColor: 'text-emerald-300'
    },
    error: {
        icon: XCircle,
        bg: 'from-red-500/20 to-red-500/5',
        border: 'border-red-500/30',
        iconColor: 'text-red-400',
        textColor: 'text-red-300'
    },
    warning: {
        icon: AlertCircle,
        bg: 'from-amber-500/20 to-amber-500/5',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400',
        textColor: 'text-amber-300'
    },
    info: {
        icon: Info,
        bg: 'from-blue-500/20 to-blue-500/5',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        textColor: 'text-blue-300'
    }
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(onRemove, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.duration, onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${config.bg} backdrop-blur-xl border ${config.border} shadow-lg max-w-sm`}
        >
            <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
            <span className="text-sm font-medium text-white flex-1">{toast.message}</span>
            <button onClick={onRemove} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </motion.div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'info', duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 md:bottom-6 md:right-6">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// Standalone toast for non-context usage
export function Toast({
    message,
    type = 'info',
    show,
    onClose
}: {
    message: string;
    type?: ToastType;
    show: boolean;
    onClose: () => void;
}) {
    const config = toastConfig[type];
    const Icon = config.icon;

    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r ${config.bg} backdrop-blur-xl border ${config.border} shadow-lg max-w-sm md:bottom-6 md:right-6`}
                >
                    <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
                    <span className="text-sm font-medium text-white flex-1">{message}</span>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
