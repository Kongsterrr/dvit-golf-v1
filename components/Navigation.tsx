'use client';

import { motion } from 'framer-motion';
import { User, LogOut, Settings, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import CartIcon from './CartIcon';
import CartPanel from './CartPanel';

export default function Navigation() {
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: any) => {
    // 无论用户邮箱是否验证，都更新用户状态以显示头像
    if (userData) {
      // 从localStorage获取tokens（AuthModal已经保存了）
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      // 如果有token，说明用户已成功登录
      if (accessToken && refreshToken) {
        login(userData, { access_token: accessToken, refresh_token: refreshToken });
        
        // 关闭认证弹窗
        setIsAuthModalOpen(false);
        
        // 如果邮箱已验证，跳转到主页
        if (userData.email_verified) {
          router.push('/');
        }
      } else {
        // 即使没有token，也要更新用户状态以显示头像
        login(userData, { access_token: '', refresh_token: '' });
        setIsAuthModalOpen(false);
      }
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 bg-dvit-black/80 backdrop-blur-xl border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-dvit-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-semibold text-white">Dvit Golf</span>
          </Link>

          {/* 中间导航链接 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/customize" 
              className="text-dvit-gray-300 hover:text-white transition-colors"
            >
              定制推杆
            </Link>
            <Link 
              href="/products" 
              className="text-dvit-gray-300 hover:text-white transition-colors"
            >
              产品展示
            </Link>
            <Link 
              href="/about" 
              className="text-dvit-gray-300 hover:text-white transition-colors"
            >
              关于我们
            </Link>
          </div>

          {/* 右侧用户区域 */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="p-2 text-dvit-gray-300 hover:text-white hover:bg-dvit-gray-700 rounded-full transition-all duration-200 group"
                  title={`已登录: ${user.name && user.name.trim() ? user.name : user.email.split('@')[0]}`}
                >
                  <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>

                {/* 下拉菜单 */}
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-[60]"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      用户仪表板
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      我的订单
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      登出
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={() => openAuthModal('login')}
                  className="p-2 text-dvit-gray-300 hover:text-white hover:bg-dvit-gray-700 rounded-full transition-all duration-200 group"
                  title="登录 / 注册"
                >
                  <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
            
            {/* 购物车图标 */}
            <CartIcon />
          </div>
        </div>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* 认证弹窗 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 购物车面板 */}
      <CartPanel />
    </motion.nav>
  );
}