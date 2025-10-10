'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthModal } from '../../../contexts/AuthModalContext';
import PageLayout from '../../../components/PageLayout';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useAuthModal();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('无效的验证链接');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsSuccess(true);
          setMessage(data.message);
          // 3秒后跳转到主页面
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setError(data.error || '验证失败');
        }
      } catch (error) {
        console.error('邮箱验证错误:', error);
        setError('网络错误，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <main className="relative min-h-screen bg-dvit-black overflow-hidden">
        {/* 背景渐变 */}
        <div className="fixed inset-0 hero-gradient" />
        
        {/* 动态背景粒子效果 */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-dvit-gray-950/20 to-transparent" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <PageLayout>
          <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-md w-full space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center">
                <motion.div 
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-full glass-effect"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <svg className="h-8 w-8 text-dvit-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </motion.div>
                <h2 className="mt-6 text-center text-3xl font-bold text-white">
                  验证邮箱中...
                </h2>
                <p className="mt-2 text-center text-sm text-dvit-gray-300">
                  请稍候，我们正在验证您的邮箱地址
                </p>
              </div>
            </motion.div>
          </div>
        </PageLayout>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="relative min-h-screen bg-dvit-black overflow-hidden">
        {/* 背景渐变 */}
        <div className="fixed inset-0 hero-gradient" />
        
        {/* 动态背景粒子效果 */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-dvit-gray-950/20 to-transparent" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <PageLayout>
          <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-md w-full space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center">
                <motion.div 
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-full glass-effect bg-green-500/20"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h2 className="mt-6 text-center text-3xl font-bold text-white">
                  邮箱验证成功
                </h2>
                <motion.div 
                  className="mt-4 glass-effect border border-green-400/20 rounded-lg p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <p className="text-sm text-green-400">{message}</p>
                  <p className="text-sm text-dvit-gray-300 mt-2">3秒后自动跳转到主页面...</p>
                </motion.div>
                <div className="mt-6">
                  <button 
                    onClick={() => router.push('/')}
                    className="button-primary"
                  >
                    立即进入主页
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </PageLayout>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-dvit-black overflow-hidden">
      {/* 背景渐变 */}
      <div className="fixed inset-0 hero-gradient" />
      
      {/* 动态背景粒子效果 */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-dvit-gray-950/20 to-transparent" />
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <PageLayout>
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-md w-full space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <motion.div 
                className="mx-auto flex items-center justify-center h-16 w-16 rounded-full glass-effect bg-red-500/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              <h2 className="mt-6 text-center text-3xl font-bold text-white">
                验证失败
              </h2>
              <motion.div 
                className="mt-4 glass-effect border border-red-400/20 rounded-lg p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => openModal('register')}
                  className="block w-full button-secondary"
                >
                  重新注册
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="block w-full button-primary"
                >
                  返回主页
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    </main>
  );
}