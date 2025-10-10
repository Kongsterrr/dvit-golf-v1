'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  customization?: {
    faceDesign?: string;
    weightSystem?: string;
    [key: string]: any;
  };
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // 从localStorage恢复购物车数据
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        setItems(cartData);
      } catch (error) {
        console.error('解析购物车数据失败:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // 保存购物车数据到localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // 计算总商品数量
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // 计算总金额
  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // 添加商品到购物车
  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // 如果商品已存在，增加数量
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 如果是新商品，添加到购物车
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };

  // 从购物车移除商品
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // 更新商品数量
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // 清空购物车
  const clearCart = () => {
    setItems([]);
  };

  // 切换购物车显示状态
  const toggleCart = () => {
    setIsOpen(prev => !prev);
  };

  // 打开购物车
  const openCart = () => {
    setIsOpen(true);
  };

  // 关闭购物车
  const closeCart = () => {
    setIsOpen(false);
  };

  const value: CartContextType = {
    items,
    isOpen,
    totalItems,
    totalAmount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}