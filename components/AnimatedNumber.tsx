'use client';

import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export default function AnimatedNumber({
    value,
    duration = 1000,
    decimals = 0,
    suffix = '',
    prefix = '',
    className = ''
}: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    const spring = useSpring(0, {
        mass: 1,
        stiffness: 75,
        damping: 15,
        duration: duration / 1000
    });

    const display = useTransform(spring, (current) => {
        return `${prefix}${current.toFixed(decimals)}${suffix}`;
    });

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, spring, value]);

    return (
        <motion.span ref={ref} className={className}>
            {display}
        </motion.span>
    );
}

// Simple counter without motion values (for server-side compatibility)
export function CountUp({
    end,
    duration = 2000,
    decimals = 0,
    suffix = '',
    prefix = '',
    className = ''
}: {
    end: number;
    duration?: number;
    decimals?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const countRef = useRef<number>(0);

    useEffect(() => {
        if (!isInView || !ref.current) return;

        const start = 0;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeProgress;

            countRef.current = current;

            if (ref.current) {
                ref.current.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, end, duration, decimals, prefix, suffix]);

    return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
