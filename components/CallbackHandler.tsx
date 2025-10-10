'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type StatusType = 'success' | 'error' | 'warning' | 'info';

export interface StatusMessage {
  type: StatusType;
  title: string;
  message: string;
  duration?: number;
}

interface CallbackState {
  isLoading: boolean;
  message: StatusMessage | null;
}

export function useCallbackHandler() {
  const [state, setState] = useState<CallbackState>({
    isLoading: false,
    message: null
  });

  const showMessage = useCallback((message: StatusMessage) => {
    setState(prev => ({ ...prev, message }));
    
    // 自动隐藏消息
    if (message.duration !== 0) {
      setTimeout(() => {
        setState(prev => ({ ...prev, message: null }));
      }, message.duration || 5000);
    }
  }, []);

  const hideMessage = useCallback(() => {
    setState(prev => ({ ...prev, message: null }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const handleSuccess = useCallback((title: string, message: string, duration?: number) => {
    setLoading(false);
    showMessage({ type: 'success', title, message, duration });
  }, [setLoading, showMessage]);

  const handleError = useCallback((title: string, message: string, duration?: number) => {
    setLoading(false);
    showMessage({ type: 'error', title, message, duration });
  }, [setLoading, showMessage]);

  const handleWarning = useCallback((title: string, message: string, duration?: number) => {
    setLoading(false);
    showMessage({ type: 'warning', title, message, duration });
  }, [setLoading, showMessage]);

  const handleInfo = useCallback((title: string, message: string, duration?: number) => {
    setLoading(false);
    showMessage({ type: 'info', title, message, duration });
  }, [setLoading, showMessage]);

  const executeWithCallback = useCallback(async (
    operation: () => Promise<any>,
    successMessage?: { title: string; message: string },
    errorMessage?: { title: string; message: string }
  ): Promise<any | null> => {
    try {
      setLoading(true);
      const result = await operation();
      
      if (successMessage) {
        handleSuccess(successMessage.title, successMessage.message);
      } else {
        setLoading(false);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '操作失败';
      
      if (errorMessage) {
        handleError(errorMessage.title, errorMessage.message);
      } else {
        handleError('操作失败', errorMsg);
      }
      
      return null;
    }
  }, [setLoading, handleSuccess, handleError]);

  return {
    ...state,
    showMessage,
    hideMessage,
    setLoading,
    handleSuccess,
    handleError,
    handleWarning,
    handleInfo,
    executeWithCallback
  };
}

interface StatusMessageComponentProps {
  message: StatusMessage;
  onClose: () => void;
}

export function StatusMessageComponent({ message, onClose }: StatusMessageComponentProps) {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  const getTextColor = () => {
    switch (message.type) {
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-yellow-300';
      case 'info':
        return 'text-blue-300';
      default:
        return 'text-blue-300';
    }
  };

  return (
    <motion.div
      className={`p-4 rounded-lg border ${getBackgroundColor()} backdrop-blur-sm`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${getTextColor()}`}>
            {message.title}
          </h4>
          <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {message.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`${getTextColor()} hover:opacity-70 transition-opacity`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

interface CallbackHandlerProps {
  children: React.ReactNode;
  className?: string;
}

export default function CallbackHandler({ children, className = '' }: CallbackHandlerProps) {
  const callback = useCallbackHandler();

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* 状态消息显示 */}
      <AnimatePresence>
        {callback.message && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <StatusMessageComponent
              message={callback.message}
              onClose={callback.hideMessage}
            />
          </div>
        )}
      </AnimatePresence>
      
      {/* 加载遮罩 */}
      <AnimatePresence>
        {callback.isLoading && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm font-medium">处理中...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}