'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Package, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function CartPanel() {
  const { 
    items, 
    isOpen, 
    totalAmount, 
    totalItems,
    closeCart, 
    updateQuantity, 
    removeItem,
    clearCart 
  } = useCart();
  const router = useRouter();
  const { user } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 组件挂载状态管理
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 检查是否需要显示滚动条
  useEffect(() => {
    const checkScrollbar = () => {
      if (listRef.current) {
        const { scrollHeight, clientHeight } = listRef.current;
        setShowScrollbar(scrollHeight > clientHeight);
      }
    };

    if (isOpen && items.length > 0) {
      setTimeout(checkScrollbar, 100);
    }
  }, [isOpen, items.length, showScrollbar]);

  // 键盘事件监听 - ESC 键关闭弹窗
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCloseCart();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 防抖关闭处理函数
  const handleCloseCart = () => {
    if (isClosing) return;
    
    setIsClosing(true);
    setTimeout(() => {
      closeCart();
      setIsClosing(false);
    }, 100);
  };

  // 处理遮罩点击关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    // 确保点击的是遮罩本身，而不是其子元素
    if (e.target === e.currentTarget) {
      handleCloseCart();
    }
  };

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // 处理ESC键关闭
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCloseCart();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleCloseCart]);

  const handleCheckout = () => {
    handleCloseCart();
    router.push('/shipping');
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };



  // 如果未挂载，不渲染任何内容（避免 SSR 问题）
  if (!isMounted) {
    return null;
  }

  const cartContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
          onClick={handleOverlayClick}
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
        >
          {/* 购物车面板 - 使用玻璃拟态效果 */}
          <motion.div 
            className="h-screen w-96 glass-effect border-l border-white/20 flex flex-col max-w-[90vw] relative overflow-hidden"
            initial={{ 
              x: '100%', 
              opacity: 0,
              scale: 0.95
            }}
            animate={{ 
              x: 0, 
              opacity: 1,
              scale: 1
            }}
            exit={{ 
              x: '100%', 
              opacity: 0,
              scale: 0.95
            }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 0.8,
              duration: 0.4
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: 'pan-y' }}
          >
            {/* 背景装饰渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-dvit-accent/5 via-transparent to-dvit-gold/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dvit-accent to-transparent" />
            
            {/* 头部 - 深色主题优化 */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0 z-10 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gradient">
                购物车 ({totalItems})
              </h2>
              <button
                onClick={handleCloseCart}
                className="group relative p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-dvit-accent/20 hover:scale-105 active:scale-95"
                aria-label="关闭购物车"
              >
                <X className="w-5 h-5 text-dvit-gray-300 group-hover:text-white transition-colors duration-200" />
                {/* 工具提示 */}
                <div className="absolute -bottom-8 right-0 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-white/20">
                  关闭 (ESC)
                </div>
              </button>
            </div>

            {/* 商品列表 - 深色主题优化 */}
            <div 
              ref={listRef}
              className={`flex-1 overflow-y-auto p-4 min-h-0 ${showScrollbar ? 'cart-scrollbar' : 'scrollbar-hide'}`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(107, 114, 128, 0.5) transparent'
              }}
            >
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-dvit-gray-400 py-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                  >
                    <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-br from-dvit-accent/20 to-dvit-gold/20 rounded-full blur-xl" />
                  </motion.div>
                  <p className="text-lg font-medium text-white/80">购物车为空</p>
                  <p className="text-sm text-center px-4 text-dvit-gray-400">快去添加一些商品吧！</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: { 
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 300,
                            damping: 20
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          y: -20, 
                          scale: 0.95,
                          transition: { duration: 0.2 }
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { type: "spring", stiffness: 400, damping: 10 }
                        }}
                        className="flex items-start space-x-3 p-4 glass-effect rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-dvit-accent/10 min-h-[110px] relative overflow-hidden"
                      >
                        {/* 背景装饰 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dvit-accent/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* 商品图片 */}
                        <div className="w-16 h-16 bg-gradient-to-br from-dvit-gray-800 to-dvit-gray-900 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg border border-white/10 relative">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-7 h-7 text-dvit-gray-400" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>

                        {/* 商品信息 */}
                        <div className="flex-1 min-w-0 space-y-1 py-0.5 relative z-10">
                          <h3 className="font-semibold text-white text-base leading-tight">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-dvit-gray-300 leading-relaxed line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          {item.customization && (
                            <div className="text-xs text-dvit-gray-400 space-y-0.5 glass-effect rounded-md p-2 border border-white/10">
                              {item.customization.faceDeck && (
                                <div className="flex items-center">
                                  <span className="font-medium text-dvit-gray-300">杆面:</span>
                                  <span className="ml-1 truncate text-dvit-accent">{typeof item.customization.faceDeck === 'object' && item.customization.faceDeck !== null && (item.customization.faceDeck as any)?.name ? (item.customization.faceDeck as any).name : item.customization.faceDeck}</span>
                                </div>
                              )}
                              {item.customization.weightSystem && (
                                <div className="flex items-center">
                                  <span className="font-medium text-dvit-gray-300">配重:</span>
                                  <span className="ml-1 truncate text-dvit-gold">{typeof item.customization.weightSystem === 'object' && item.customization.weightSystem !== null && (item.customization.weightSystem as any)?.name ? (item.customization.weightSystem as any).name : item.customization.weightSystem}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-base text-white font-bold accent-gradient">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* 数量控制和删除按钮 */}
                        <div className="flex flex-col items-end space-y-2 flex-shrink-0 py-0.5 relative z-10">
                          {/* 数量控制 */}
                          <div className="flex items-center space-x-2 glass-effect rounded-lg border border-white/20 p-1">
                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-dvit-accent/20"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </motion.button>
                            <motion.span 
                              className="w-10 text-center font-semibold text-lg text-white"
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 10 }}
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-dvit-accent/20"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </motion.button>
                          </div>
                          {/* 删除按钮 */}
                          <motion.button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* 滚动提示 */}
                  {items.length > 3 && (
                    <div className="text-center py-2 text-xs text-dvit-gray-500 border-t border-white/10 mt-4">
                      <p>向上滚动查看更多商品</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 底部结账区域 - 深色主题优化 */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-4 backdrop-blur-xl bg-black/20 sticky bottom-0 flex-shrink-0 relative">
                {/* 背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-t from-dvit-accent/10 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-xl font-semibold text-gradient">
                    总计: ${totalAmount.toFixed(2)}
                  </span>
                  <span className="text-sm text-dvit-gray-400">
                    共 {totalItems} 件商品
                  </span>
                </div>
                
                <div className="space-y-3 relative z-10">
                  <motion.button
                    onClick={handleCheckout}
                    className="w-full button-primary flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:shadow-dvit-accent/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>立即结账</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={clearCart}
                    className="w-full button-secondary text-dvit-gray-300 hover:text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    清空购物车
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 使用 createPortal 将弹窗挂载到 document.body
  return createPortal(cartContent, document.body);
}