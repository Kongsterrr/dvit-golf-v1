'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import PageLayout from '../../components/PageLayout';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft, 
  CreditCard,
  Package,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsLoading(true);
    router.push('/payment');
  };

  if (items.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <ShoppingBag className="w-16 h-16 text-dvit-gray mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-dvit-white mb-4">购物车为空</h1>
              <p className="text-dvit-gray mb-6">您还没有添加任何商品到购物车</p>
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 bg-dvit-accent hover:bg-dvit-accent/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>去购物</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/products"
            className="flex items-center space-x-2 text-dvit-gray hover:text-dvit-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>继续购物</span>
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-dvit-white mb-4 flex items-center justify-center gap-3">
              <ShoppingCart className="w-8 h-8" />
              购物车
            </h1>
            <p className="text-dvit-gray">共 {totalItems} 件商品</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 商品列表 */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
              >
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        {/* 商品图片 */}
                        <div className="w-20 h-20 bg-gradient-to-br from-dvit-accent to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-10 h-10 text-white" />
                        </div>

                        {/* 商品信息 */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-dvit-white text-lg">{item.name}</h3>
                          <p className="text-dvit-gray text-sm">单价: ${item.price.toLocaleString()}</p>
                          {item.customization && (
                            <div className="text-xs text-dvit-gray mt-1">
                              {item.customization.faceDeck && (
                                <span className="block">面板: {(() => {
                                  const faceDeck = item.customization?.faceDeck;
                                  if (typeof faceDeck === 'object' && faceDeck && 'name' in faceDeck) {
                                    return (faceDeck as any).name;
                                  }
                                  return String(faceDeck || '');
                                })()}</span>
                              )}
                              {item.customization.weightSystem && (
                                <span className="block">配重: {(() => {
                                  const weightSystem = item.customization?.weightSystem;
                                  if (typeof weightSystem === 'object' && weightSystem && 'name' in weightSystem) {
                                    return (weightSystem as any).name;
                                  }
                                  return String(weightSystem || '');
                                })()}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 数量控制 */}
                        <div className="flex items-center space-x-3">
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-dvit-white transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          
                          <span className="text-dvit-white font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          
                          <motion.button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-dvit-white transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>

                        {/* 小计和删除 */}
                        <div className="text-right">
                          <p className="font-semibold text-dvit-accent text-lg">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                          <motion.button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 mt-2 p-1"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* 清空购物车按钮 */}
                <motion.button
                  onClick={clearCart}
                  className="w-full mt-6 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors border border-red-500/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  清空购物车
                </motion.button>
              </motion.div>
            </div>

            {/* 订单摘要 */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-8"
              >
                <h2 className="text-xl font-semibold text-dvit-white mb-4">订单摘要</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-dvit-gray">
                    <span>商品总计 ({totalItems} 件)</span>
                    <span>${totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-dvit-gray">
                    <span>运费</span>
                    <span className="text-green-400">免费</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between text-lg font-bold text-dvit-white">
                      <span>总计</span>
                      <span className="text-dvit-accent">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-dvit-accent hover:bg-dvit-accent/90 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>去结算</span>
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-dvit-gray text-center mt-4">
                  支持多种支付方式，安全可靠
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}