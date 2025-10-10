'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, User, Phone, Mail, Package, CreditCard, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import PageLayout from '../../components/PageLayout';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function ShippingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items } = useCart();
  
  const [orderConfiguration, setOrderConfiguration] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});

  // 从localStorage加载订单配置
  useEffect(() => {
    const savedOrderConfig = localStorage.getItem('orderConfiguration');
    if (savedOrderConfig) {
      setOrderConfiguration(JSON.parse(savedOrderConfig));
    } else {
      router.push('/customize');
    }
  }, [router]);

  // 如果用户已登录，自动填充信息
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      setShippingAddress(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<ShippingAddress> = {};

    if (!shippingAddress.firstName.trim()) {
      newErrors.firstName = '请输入名字';
    }
    if (!shippingAddress.lastName.trim()) {
      newErrors.lastName = '请输入姓氏';
    }
    if (!shippingAddress.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!shippingAddress.phone.trim()) {
      newErrors.phone = '请输入电话号码';
    }
    if (!shippingAddress.address.trim()) {
      newErrors.address = '请输入地址';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = '请输入城市';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = '请输入州/省';
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = '请输入邮政编码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      router.push('/payment');
    }
  };

  // 计算购物车总价
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (!orderConfiguration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dvit-dark via-dvit-dark to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dvit-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dvit-white">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            
            <h1 className="text-3xl md:text-4xl font-bold text-dvit-white mb-2 mt-8">
              配送信息
            </h1>
            <p className="text-dvit-gray">
              请填写您的配送地址信息
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 左侧：配送表单 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-dvit-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                配送地址
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 名字 */}
                  <div>
                    <label className="block text-sm font-medium text-dvit-white mb-2">
                      名字 *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dvit-gray" size={18} />
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                          errors.firstName ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                        }`}
                        placeholder="请输入名字"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  {/* 姓氏 */}
                  <div>
                    <label className="block text-sm font-medium text-dvit-white mb-2">
                      姓氏 *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dvit-gray" size={18} />
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                          errors.lastName ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                        }`}
                        placeholder="请输入姓氏"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                    )}
                  </div>

                  {/* 邮箱 */}
                  <div>
                    <label className="block text-sm font-medium text-dvit-white mb-2">
                      邮箱 *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dvit-gray" size={18} />
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                          errors.email ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                        }`}
                        placeholder="请输入邮箱地址"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* 电话 */}
                  <div>
                    <label className="block text-sm font-medium text-dvit-white mb-2">
                      电话 *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dvit-gray" size={18} />
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                          errors.phone ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                        }`}
                        placeholder="请输入电话号码"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* 地址 */}
                <div>
                  <label className="block text-sm font-medium text-dvit-white mb-2">
                    地址 *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dvit-gray" size={18} />
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                        errors.address ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                      }`}
                      placeholder="请输入详细地址"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-400">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 城市 */}
                  <div>
                    <label className="block text-sm font-medium text-dvit-white mb-2">
                      城市 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                        errors.city ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                      }`}
                      placeholder="请输入城市"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                    )}
                  </div>

                  {/* 州/省 */}
                  <div>
                    <label className="block text-sm font-medium text-dvit-white mb-2">
                      州/省 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                        errors.state ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                      }`}
                      placeholder="请输入州/省"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-400">{errors.state}</p>
                    )}
                  </div>

                  {/* 邮政编码 */}
                  <div>
                    <label className="block text-sm font-medium text-dvit-white mb-2">
                      邮政编码 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:ring-2 focus:ring-dvit-accent focus:border-transparent transition-all duration-300 text-dvit-white placeholder-dvit-gray ${
                        errors.zipCode ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                      }`}
                      placeholder="请输入邮政编码"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-400">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* 提交按钮 */}
                <motion.button
                  type="submit"
                  className="w-full bg-dvit-accent hover:bg-dvit-accent/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  继续支付
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            </motion.div>

            {/* 右侧：订单摘要 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-dvit-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                订单摘要
              </h2>
              
              <div className="space-y-4">
                {/* 显示购物车商品 */}
                {items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <div className="w-16 h-16 bg-gradient-to-br from-dvit-accent to-blue-500 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-dvit-white">{item.name}</h3>
                      <p className="text-sm text-dvit-gray">数量: {item.quantity}</p>
                      {item.customization && (
                        <div className="text-xs text-dvit-gray mt-1">
                          {item.customization.faceDesign && (
                            <span className="block">面板: {item.customization.faceDesign}</span>
                          )}
                          {item.customization.weightSystem && (
                            <span className="block">配重: {item.customization.weightSystem}</span>
                          )}
                        </div>
                      )}
                      {item.description && (
                        <p className="text-xs text-dvit-gray mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-dvit-accent">${(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-dvit-gray">${item.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="flex justify-between items-center text-sm text-dvit-gray mb-2">
                  <span>商品总计 ({items.reduce((total, item) => total + item.quantity, 0)} 件)</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-dvit-gray mb-2">
                  <span>运费</span>
                  <span className="text-green-400">免费</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-dvit-white pt-2 border-t border-white/20">
                  <span>总计</span>
                  <span className="text-dvit-accent">${totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}