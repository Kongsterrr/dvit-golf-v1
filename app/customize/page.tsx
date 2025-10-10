'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Share2, ShoppingCart, ArrowRight, User, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageLayout from '../../components/PageLayout';
import FaceDeckSelector from '../../components/FaceDeckSelector';
import WeightSystemSelector from '../../components/WeightSystemSelector';
import ConfigurationPreview from '../../components/ConfigurationPreview';
import PriceCalculator from '../../components/PriceCalculator';
import { useCart } from '../../contexts/CartContext';

export interface Configuration {
  faceDeck: {
    material: string;
    name: string;
    price: number;
    description: string;
    stripe_product_id?: string;
    stripe_price_id?: string;
  } | null;
  weightSystem: {
    type: string;
    name: string;
    price: number;
    description: string;
    stripe_product_id?: string;
    stripe_price_id?: string;
  } | null;
}

interface ProductData {
  putter: any;
  faceDecks: any[];
  weightSystems: any[];
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export default function CustomizePage() {
  const [currentStep, setCurrentStep] = useState<'configure' | 'personal-info' | 'payment'>('configure');
  const [configuration, setConfiguration] = useState<Configuration>({
    faceDeck: null,
    weightSystem: null,
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '中国'
  });
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { addItem, openCart } = useCart();
  const router = useRouter();

  // ... existing code ...
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.success) {
          setProductData(data.products);
          
          // 设置默认配置
          const defaultFaceDeck = data.products.faceDecks.find((fd: any) => fd.is_default);
          const defaultWeightSystem = data.products.weightSystems.find((ws: any) => ws.is_default);
          
          if (defaultFaceDeck) {
            setConfiguration(prev => ({
              ...prev,
              faceDeck: {
                material: defaultFaceDeck.subcategory,
                name: defaultFaceDeck.name,
                price: defaultFaceDeck.base_price / 100, // 转换为美元
                description: defaultFaceDeck.description || '',
                stripe_product_id: defaultFaceDeck.stripe_product_id,
                stripe_price_id: defaultFaceDeck.stripe_price_id,
              }
            }));
          }
          
          if (defaultWeightSystem) {
            setConfiguration(prev => ({
              ...prev,
              weightSystem: {
                type: defaultWeightSystem.subcategory,
                name: defaultWeightSystem.name,
                price: defaultWeightSystem.base_price / 100, // 转换为美元
                description: defaultWeightSystem.description || '',
                stripe_product_id: defaultWeightSystem.stripe_product_id,
                stripe_price_id: defaultWeightSystem.stripe_price_id,
              }
            }));
          }
        }
      } catch (error) {
        console.error('加载产品数据失败:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const updateFaceDeck = (faceDeck: Configuration['faceDeck']) => {
    setConfiguration(prev => ({ ...prev, faceDeck }));
  };

  const updateWeightSystem = (weightSystem: Configuration['weightSystem']) => {
    setConfiguration(prev => ({ ...prev, weightSystem }));
  };

  const getTotalPrice = () => {
    if (!productData) return 0;
    
    const basePutterPrice = productData.putter ? productData.putter.base_price / 100 : 0;
    const faceDeckPrice = configuration.faceDeck?.price || 0;
    const weightSystemPrice = configuration.weightSystem?.price || 0;
    return basePutterPrice + faceDeckPrice + weightSystemPrice;
  };

  const handleSaveConfiguration = () => {
    alert('配置已保存！');
  };

  const handleAddToCart = () => {
    if (!isConfigurationComplete()) {
      alert('请先完成配置选择！');
      return;
    }

    const cartItem = {
      id: `custom-putter-${Date.now()}`,
      name: '定制推杆',
      price: getTotalPrice(),
      image: '/images/putter-preview.jpg',
      description: `${configuration.faceDeck?.name} + ${configuration.weightSystem?.name}`,
      customization: {
        faceDesign: configuration.faceDeck?.name,
        weightSystem: configuration.weightSystem?.name,
      }
    };

    addItem(cartItem);
    openCart();
  };

  const handleProceedToPersonalInfo = () => {
    if (!isConfigurationComplete()) {
      alert('请先完成配置选择！');
      return;
    }
    
    // 保存配置到localStorage
    const orderConfiguration = {
      faceDeck: configuration.faceDeck,
      weightSystem: configuration.weightSystem,
      totalPrice: getTotalPrice(),
      orderDate: new Date().toISOString(),
      orderId: `DG-${Date.now()}`
    };
    
    localStorage.setItem('orderConfiguration', JSON.stringify(orderConfiguration));
    
    // 跳转到shipping页面
    router.push('/shipping');
  };

  const handlePersonalInfoSubmit = () => {
    if (!isPersonalInfoComplete()) {
      alert('请填写完整的个人信息和收货地址！');
      return;
    }
    setCurrentStep('payment');
  };

  const handleBackToConfiguration = () => {
    setCurrentStep('configure');
  };

  const handleBackToPersonalInfo = () => {
    setCurrentStep('personal-info');
  };

  const isConfigurationComplete = () => {
    return configuration.faceDeck && configuration.weightSystem;
  };

  const isPersonalInfoComplete = () => {
    return personalInfo.name && personalInfo.email && personalInfo.phone && personalInfo.address;
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalSubmit = async () => {
    try {
      // 这里将处理最终的订单提交
      const orderData = {
        configuration,
        personalInfo,
        totalPrice: getTotalPrice(),
        orderDate: new Date().toISOString(),
        orderId: `DG-${Date.now()}`
      };

      console.log('订单数据:', orderData);
      
      // 跳转到支付成功页面
      router.push('/payment/success');
    } catch (error) {
      console.error('订单提交失败:', error);
      alert('订单提交失败，请重试！');
    }
  };

  return (
    <PageLayout className="text-dvit-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-3">
        {currentStep === 'configure' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div 
                className="bg-white/5 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">配置进度</h2>
                  <span className="text-sm text-dvit-gray">
                    {(configuration.faceDeck ? 1 : 0) + (configuration.weightSystem ? 1 : 0)}/2 完成
                  </span>
                </div>
                <div className="flex space-x-2">
                  <div className={`flex-1 h-2 rounded-full ${configuration.faceDeck ? 'bg-dvit-accent' : 'bg-white/20'}`} />
                  <div className={`flex-1 h-2 rounded-full ${configuration.weightSystem ? 'bg-dvit-accent' : 'bg-white/20'}`} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <FaceDeckSelector 
                  selectedFaceDeck={configuration.faceDeck}
                  onSelect={updateFaceDeck}
                  productData={productData?.faceDecks || []}
                  isLoading={isLoadingProducts}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <WeightSystemSelector 
                  selectedWeightSystem={configuration.weightSystem}
                  onSelect={updateWeightSystem}
                  productData={productData?.weightSystems || []}
                  isLoading={isLoadingProducts}
                />
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <ConfigurationPreview configuration={configuration} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <PriceCalculator 
                  configuration={configuration}
                  totalPrice={getTotalPrice()}
                />
              </motion.div>

              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {/* <button
                  onClick={handleSaveConfiguration}
                  disabled={!isConfigurationComplete()}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isConfigurationComplete()
                      ? 'bg-dvit-accent hover:bg-dvit-accent/90 text-dvit-black'
                      : 'bg-white/10 text-dvit-gray cursor-not-allowed'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  <span>保存配置</span>
                </button> */}
                
                <button
                  onClick={handleAddToCart}
                  disabled={!isConfigurationComplete()}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isConfigurationComplete()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 text-dvit-gray cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>加入购物车</span>
                </button>
                
                {/* <button
                  onClick={handleProceedToPersonalInfo}
                  disabled={!isConfigurationComplete()}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isConfigurationComplete()
                      ? 'bg-white text-dvit-black hover:bg-white/90'
                      : 'bg-white/10 text-dvit-gray cursor-not-allowed'
                  }`}
                >
                  <span>立即购买</span>
                  <ArrowRight className="w-5 h-5" />
                </button> */}
              </motion.div>
            </div>
          </div>
        )}

        {currentStep === 'personal-info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">个人信息与收货地址</h2>
              
              {/* 个人信息 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  个人信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      姓名 *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="请输入您的姓名"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      手机号 *
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="请输入手机号"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    邮箱 *
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="请输入邮箱地址"
                    required
                  />
                </div>
              </div>

              {/* 收货地址 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  收货地址
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      详细地址 *
                    </label>
                    <textarea
                      value={personalInfo.address}
                      onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="请输入详细收货地址"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        城市
                      </label>
                      <input
                        type="text"
                        value={personalInfo.city}
                        onChange={(e) => handlePersonalInfoChange('city', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="请输入城市"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        邮政编码
                      </label>
                      <input
                        type="text"
                        value={personalInfo.zipCode}
                        onChange={(e) => handlePersonalInfoChange('zipCode', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="邮政编码"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        国家/地区
                      </label>
                      <select
                        value={personalInfo.country}
                        onChange={(e) => handlePersonalInfoChange('country', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="中国">中国</option>
                        <option value="美国">美国</option>
                        <option value="加拿大">加拿大</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex space-x-4">
                <button
                  onClick={handleBackToConfiguration}
                  className="flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  返回配置
                </button>
                <button
                  onClick={handlePersonalInfoSubmit}
                  disabled={!isPersonalInfoComplete()}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isPersonalInfoComplete()
                      ? 'bg-white text-dvit-black hover:bg-white/90'
                      : 'bg-white/10 text-dvit-gray cursor-not-allowed'
                  }`}
                >
                  <span>下一步：付款</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ConfigurationPreview configuration={configuration} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <PriceCalculator 
                  configuration={configuration}
                  totalPrice={getTotalPrice()}
                />
              </motion.div>
            </div>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">付款信息</h2>
              
              {/* 订单确认 */}
              <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">订单确认</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Face Deck材质</span>
                    <span className="text-white font-medium">{configuration.faceDeck?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">配重系统</span>
                    <span className="text-white font-medium">{configuration.weightSystem?.name}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">总价</span>
                      <span className="text-blue-400">${getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 收货信息确认 */}
              <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">收货信息</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-white">{personalInfo.name} | {personalInfo.phone}</p>
                  <p className="text-gray-300">{personalInfo.email}</p>
                  <p className="text-gray-300">{personalInfo.address}</p>
                  <p className="text-gray-300">{personalInfo.city} {personalInfo.zipCode} {personalInfo.country}</p>
                </div>
              </div>

              {/* 付款方式 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  付款方式
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl border border-white/10 cursor-pointer hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit-card"
                      defaultChecked
                      className="text-blue-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-white">信用卡支付</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl border border-white/10 cursor-pointer hover:bg-gray-800/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank-transfer"
                      className="text-blue-500"
                    />
                    <span className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">¥</span>
                    <span className="text-white">银行转账</span>
                  </label>
                </div>
              </div>

              {/* 按钮 */}
              <div className="flex space-x-4">
                <button
                  onClick={handleBackToPersonalInfo}
                  className="flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 bg-gray-700 hover:bg-gray-600 text-white"
                >
                  返回信息填写
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  确认支付 - ${getTotalPrice().toLocaleString()}
                </button>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ConfigurationPreview configuration={configuration} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <PriceCalculator 
                  configuration={configuration}
                  totalPrice={getTotalPrice()}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}