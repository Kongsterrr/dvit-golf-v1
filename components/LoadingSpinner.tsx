'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'primary' | 'gray';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    primary: 'border-dvit-accent border-t-transparent',
    gray: 'border-gray-300 border-t-transparent'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    />
  );
}

interface LoadingButtonContentProps {
  text?: string;
  loadingText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'primary' | 'gray';
}

export function LoadingButtonContent({ 
  text = '提交',
  loadingText = '处理中...',
  isLoading = false,
  size = 'sm',
  color = 'white'
}: LoadingButtonContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2">
        <LoadingSpinner size={size} color={color} />
        <span>{loadingText}</span>
      </div>
    );
  }

  return <span>{text}</span>;
}

interface FullPageLoadingProps {
  message?: string;
}

export function FullPageLoading({ message = '加载中...' }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-dvit-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="bg-white/10 backdrop-blur-md rounded-lg p-8 flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <LoadingSpinner size="lg" color="white" />
        <p className="text-white text-lg font-medium">{message}</p>
      </motion.div>
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = '加载中...',
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 flex flex-col items-center gap-3">
        <LoadingSpinner size="md" color="white" />
        <p className="text-white text-sm font-medium">{message}</p>
      </div>
    </motion.div>
  );
}