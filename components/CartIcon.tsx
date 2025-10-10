'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartIcon() {
  const { totalItems, toggleCart } = useCart();

  return (
    <motion.button
      onClick={toggleCart}
      className="relative p-2 text-dvit-gray-300 hover:text-white hover:bg-dvit-gray-700 rounded-full transition-all duration-200 group"
      title="购物车"
      whileHover={{ 
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
    >
      <motion.div
        animate={totalItems > 0 ? { 
          rotate: [0, -10, 10, -5, 5, 0],
          transition: { duration: 0.5, ease: "easeInOut" }
        } : {}}
      >
        <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
      </motion.div>
      
      {/* 商品数量徽章 */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                type: "spring", 
                stiffness: 500, 
                damping: 15,
                delay: 0.1
              }
            }}
            exit={{ 
              scale: 0, 
              opacity: 0,
              transition: { duration: 0.2 }
            }}
            key={totalItems}
            className="absolute -top-1 -right-1 bg-dvit-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
          >
            <motion.span
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              {totalItems > 99 ? '99+' : totalItems}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}