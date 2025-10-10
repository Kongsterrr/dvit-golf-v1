'use client';

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onAuthSuccess?: (user: any) => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onAuthSuccess 
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // 重新发送验证邮件相关状态
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  // 邮箱未验证状态
  const [showEmailNotVerified, setShowEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // 倒计时功能
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // 重置表单当模式改变时
  useEffect(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccessMessage('');
    setIsRegistered(false);
    setRegisteredEmail('');
    setResendMessage('');
    setResendError('');
    setCountdown(0);
    setShowEmailNotVerified(false);
    setUnverifiedEmail('');
  }, [mode]);

  // 关闭弹窗时重置状态
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
      setSuccessMessage('');
      setIsLoading(false);
      setIsRegistered(false);
      setRegisteredEmail('');
      setIsResending(false);
      setResendMessage('');
      setResendError('');
      setCountdown(0);
      setShowEmailNotVerified(false);
      setUnverifiedEmail('');
    }
  }, [isOpen]);

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      newErrors.password = '密码至少需要8个字符';
    }

    // 注册模式下的额外验证
    if (mode === 'register') {
      if (!formData.name) {
        newErrors.name = '请输入姓名';
      } else if (formData.name.length < 2) {
        newErrors.name = '姓名至少需要2个字符';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // 检查是否是邮箱未验证错误
        if (mode === 'login' && response.status === 403 && data.code === 'EMAIL_NOT_VERIFIED') {
          setShowEmailNotVerified(true);
          setUnverifiedEmail(formData.email);
          setErrors({});
          return;
        }
        setErrors({ general: data.error || '操作失败，请重试' });
        return;
      }

      if (mode === 'login') {
        // 登录成功
        setSuccessMessage('登录成功！');
        setTimeout(() => {
          onClose();
        }, 1500);
        if (onAuthSuccess) {
          onAuthSuccess(data.user);
        }
      } else {
        // 注册成功
        setSuccessMessage('注册成功！请检查您的邮箱并点击验证链接完成注册。');
        setIsRegistered(true);
        setRegisteredEmail(formData.email);
        setCountdown(60); // 设置60秒倒计时
      }
    } catch (error) {
      setErrors({ general: '网络错误，请检查您的网络连接' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleResendVerification = async () => {
    if (countdown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setResendMessage('');
    setResendError('');

    // 确定要发送验证邮件的邮箱地址
    const emailToSend = showEmailNotVerified ? unverifiedEmail : registeredEmail;

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('验证邮件已重新发送！请检查您的邮箱。');
        setCountdown(60); // 重新设置60秒倒计时
      } else {
        setResendError(data.error || '重新发送失败，请稍后重试');
      }
    } catch (error) {
      console.error('重新发送验证邮件错误:', error);
      setResendError('网络错误，请检查您的网络连接');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* 背景遮罩 - 使用网站的深色主题 */}
          <motion.div 
            className="absolute inset-0 bg-dvit-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 弹窗内容 - 使用玻璃效果和深色主题 */}
          <motion.div 
            className="relative w-full max-w-md glass-effect bg-dvit-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors z-10 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {/* 头部 */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-white mb-2 font-sf-pro">
                {mode === 'login' ? '登录账户' : '创建账户'}
              </h2>
              <p className="text-white/70 font-sf-pro">
                {mode === 'login' 
                  ? '欢迎回来！请登录您的账户' 
                  : '加入我们，开始您的高尔夫之旅'
                }
              </p>
            </div>

            {/* 成功消息 */}
            {successMessage && (
              <motion.div 
                className="mx-6 mb-4 space-y-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <span className="text-green-300 text-sm font-sf-pro">{successMessage}</span>
                </div>
                
                {/* 重新发送验证邮件功能 */}
                {isRegistered && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={handleResendVerification}
                        disabled={countdown > 0 || isResending}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors font-sf-pro ${
                          countdown > 0 || isResending
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : 'bg-dvit-accent text-white hover:bg-blue-600'
                        }`}
                      >
                        {isResending ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>发送中...</span>
                          </div>
                        ) : countdown > 0 ? (
                          `重新发送 (${countdown}s)`
                        ) : (
                          '重新发送验证邮件'
                        )}
                      </button>
                    </div>
                    
                    {/* 重新发送状态消息 */}
                    {resendMessage && (
                      <p className="text-green-300 text-sm font-sf-pro text-center">{resendMessage}</p>
                    )}
                    {resendError && (
                      <p className="text-red-400 text-sm font-sf-pro text-center">{resendError}</p>
                    )}
                    
                    {/* 登录链接 - 只在注册模式下显示 */}
                    {mode === 'register' && (
                      <div className="text-center">
                        <button
                          onClick={() => setMode('login')}
                          className="text-dvit-accent hover:text-blue-400 text-sm font-medium font-sf-pro"
                        >
                          已有账号？立即登录
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 邮箱未验证提示 */}
            {showEmailNotVerified && (
              <motion.div 
                className="mx-6 mb-4 space-y-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
                    <span className="text-yellow-300 font-medium font-sf-pro">您的邮箱尚未验证，请先完成验证</span>
                  </div>
                  <p className="text-yellow-200/80 text-sm font-sf-pro mb-4">
                    为了保障您的账户安全，请先验证您的邮箱地址：{unverifiedEmail}
                  </p>
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={countdown > 0 || isResending}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors font-sf-pro ${
                        countdown > 0 || isResending
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-dvit-accent text-white hover:bg-blue-600'
                      }`}
                    >
                      {isResending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>发送中...</span>
                        </div>
                      ) : countdown > 0 ? (
                        `重新发送验证邮件 (${countdown}s)`
                      ) : (
                        '重新发送验证邮件'
                      )}
                    </button>
                    
                    {/* 重新发送状态消息 */}
                    {resendMessage && (
                      <p className="text-green-300 text-sm font-sf-pro text-center">{resendMessage}</p>
                    )}
                    {resendError && (
                      <p className="text-red-400 text-sm font-sf-pro text-center">{resendError}</p>
                    )}
                    
                    {/* 返回登录按钮 */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailNotVerified(false);
                        setUnverifiedEmail('');
                        setResendMessage('');
                        setResendError('');
                      }}
                      className="text-white/70 hover:text-white text-sm font-sf-pro text-center transition-colors"
                    >
                      返回登录
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 表单 */}
            {!showEmailNotVerified && (
              <form onSubmit={handleSubmit} className="px-6 pb-6">
              {/* 通用错误消息 */}
              {errors.general && (
                <motion.div 
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm font-sf-pro">{errors.general}</span>
                </motion.div>
              )}

              {/* 姓名字段（仅注册时显示） */}
              {mode === 'register' && (
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2 font-sf-pro">
                    姓名
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-white placeholder-white/40 font-sf-pro ${
                        errors.name ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                      }`}
                      placeholder="请输入您的姓名"
                    />
                  </div>
                  {errors.name && (
                    <motion.p 
                      className="mt-1 text-sm text-red-400 font-sf-pro"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* 邮箱字段 */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2 font-sf-pro">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-white placeholder-white/40 font-sf-pro ${
                      errors.email ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder="请输入您的邮箱地址"
                  />
                </div>
                {errors.email && (
                  <motion.p 
                    className="mt-1 text-sm text-red-400 font-sf-pro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* 密码字段 */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2 font-sf-pro">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-white placeholder-white/40 font-sf-pro ${
                      errors.password ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                    }`}
                    placeholder={mode === 'login' ? '请输入密码' : '请输入至少8位密码'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p 
                    className="mt-1 text-sm text-red-400 font-sf-pro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* 确认密码字段（仅注册时显示） */}
              {mode === 'register' && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2 font-sf-pro">
                    确认密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-white placeholder-white/40 font-sf-pro ${
                        errors.confirmPassword ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                      }`}
                      placeholder="请再次输入密码"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p 
                      className="mt-1 text-sm text-red-400 font-sf-pro"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* 提交按钮 */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full button-primary font-sf-pro disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'login' ? '登录中...' : '注册中...'}
                  </div>
                ) : (
                  mode === 'login' ? '登录' : '注册'
                )}
              </motion.button>

              {/* 模式切换 */}
              <div className="mt-6 text-center">
                <p className="text-white/70 font-sf-pro">
                  {mode === 'login' ? '还没有账户？' : '已有账户？'}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="ml-1 text-dvit-accent hover:text-blue-400 font-medium transition-colors font-sf-pro"
                  >
                    {mode === 'login' ? '立即注册' : '立即登录'}
                  </button>
                </p>
              </div>
            </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}