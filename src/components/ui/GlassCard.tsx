import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'primary' | 'accent' | 'success' | 'danger' | 'none';
  onClick?: () => void;
}

export const GlassCard = ({ children, className, hover = false, glow = 'none', onClick }: GlassCardProps) => {
  const glowClass = {
    primary: 'glow-primary',
    accent: 'glow-accent',
    success: 'glow-success',
    danger: 'glow-danger',
    none: '',
  }[glow];

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={cn(
        'space-card p-5',
        glowClass,
        hover && 'cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
