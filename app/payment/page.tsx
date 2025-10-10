'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, CreditCard, Shield, CheckCircle, User, Mail, Phone, MapPin, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PageLayout from '../../components/PageLayout';
import OrderSubmission from '../../components/OrderSubmission';
import StripeProvider from '../../components/StripeProvider';
import PaymentForm from '../../components/PaymentForm';

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart, items } = useCart();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [orderConfiguration, setOrderConfiguration] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentError, setPaymentError] = useState<string>('');

  // 计算购物车总价
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const isValidAmount = totalPrice > 0;

  // 从localStorage加载数据
  useEffect(() => {
    try {
      const savedOrderConfig = localStorage.getItem('orderConfiguration');
      const savedShippingAddress = localStorage.getItem('shippingAddress');
      
      if (savedOrderConfig) {
        const parsedOrderConfig = JSON.parse(savedOrderConfig);
        setOrderConfiguration(parsedOrderConfig);
      } else {
        // 如果没有订单配置，重定向到配置页面
        router.push('/customize');
        return;
      }

      if (savedShippingAddress) {
        const parsedShippingAddress = JSON.parse(savedShippingAddress);
        setShippingAddress(parsedShippingAddress);
        
        // 设置客户信息
        setCustomerInfo({
          name: `${parsedShippingAddress.firstName} ${parsedShippingAddress.lastName}`,
          email: parsedShippingAddress.email,
          phone: parsedShippingAddress.phone || ''
        });
      }
    } catch (error) {
      console.error('加载订单数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // 自动创建支付意图
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!orderConfiguration || !customerInfo.name || !customerInfo.email) {
        return;
      }

      // 验证支付金额
      if (!isValidAmount) {
        setPaymentError('支付金额无效，请确保已选择产品配置');
        return;
      }

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'PaymentPage/1.0',
          },
          body: JSON.stringify({
            amount: totalPrice,
            currency: 'usd',
            orderData: {
              customerName: customerInfo.name,
              customerEmail: customerInfo.email,
              customerPhone: customerInfo.phone,
              faceDeck: orderConfiguration?.faceDeck,
              weightSystem: orderConfiguration?.weightSystem,
              shippingAddress: shippingAddress ? {
                address: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country || 'US'
              } : undefined,
              totalPrice: totalPrice
            }
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: 创建支付意图失败`);
        }

        if (data.demoMode) {
          console.log('演示模式：', data.message);
          // 在演示模式下，我们仍然设置一个假的clientSecret来显示表单
          setClientSecret('demo_client_secret');
          return;
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        } else {
          throw new Error(data.error || '创建支付意图失败');
        }
      } catch (error) {
        console.error('创建支付意图失败:', error);
        const errorMessage = error instanceof Error ? error.message : '创建支付意图失败';
        setPaymentError(errorMessage);
      }
    };

    createPaymentIntent();
  }, [orderConfiguration, customerInfo, totalPrice, isValidAmount, shippingAddress]);

  // 处理支付成功
  const handlePaymentSuccess = async (paymentIntentId?: string) => {
    console.log('支付成功，支付意图ID:', paymentIntentId);
    
    if (!paymentIntentId) {
      console.error('支付意图ID为空');
      alert('支付成功但无法保存订单信息，请联系客服');
      return;
    }

    try {
      // 保存订单到数据库
      const saveResponse = await fetch('/api/save-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PaymentPage/1.0',
        },
        body: JSON.stringify({
          paymentIntentId,
          orderData: {
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            faceDeck: orderConfiguration?.faceDeck,
            weightSystem: orderConfiguration?.weightSystem,
          },
          shippingAddress,
          billingAddress: shippingAddress, // 使用相同地址作为账单地址
          totalAmount: totalPrice,
          currency: 'USD'
        }),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || '保存订单失败');
      }

      console.log('订单保存成功:', saveResult);
      
      // 将订单ID和客户信息保存到localStorage，以便在成功页面显示
      localStorage.setItem('lastOrderId', saveResult.orderId);
      localStorage.setItem('lastPaymentIntentId', paymentIntentId);
      localStorage.setItem('customerName', customerInfo.name);
      localStorage.setItem('customerEmail', customerInfo.email);
      localStorage.setItem('orderTotal', totalPrice.toString());
      
    } catch (error) {
      console.error('保存订单失败:', error);
      // 即使保存失败，也不阻止用户看到成功页面
      // 但会记录错误信息
      alert('支付成功，但保存订单信息时出现问题，请联系客服确认订单状态');
    }
    
    // 保存订单项到localStorage，供成功页面使用
    const orderItems = [{
      id: 'dvit-custom-putter',
      name: 'DVIT定制推杆',
      price: totalPrice,
      quantity: 1,
      customization: {
        faceDeck: orderConfiguration?.faceDeck,
        weightSystem: orderConfiguration?.weightSystem,
      }
    }];
    localStorage.setItem('orderItems', JSON.stringify(orderItems));
    
    // 清空购物车
    clearCart();
    
    // 跳转到成功页面
    const successUrl = paymentIntentId 
      ? `/payment/success?payment_intent=${paymentIntentId}`
      : '/payment/success';
    router.push(successUrl);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dvit-dark via-dvit-dark/95 to-dvit-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-dvit-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dvit-gray">加载支付信息...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-dvit-white mb-2 mt-12">
              安全支付
            </h1>
            <p className="text-dvit-gray">
              使用安全的支付方式完成您的订单
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 左侧：支付表单 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-dvit-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                支付信息
              </h2>

              {/* 客户信息显示 */}
              {customerInfo.name && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-sm font-medium text-dvit-white mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    客户信息
                  </h3>
                  <div className="space-y-1 text-sm text-dvit-gray">
                    <p className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      {customerInfo.name}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {customerInfo.email}
                    </p>
                    {customerInfo.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {customerInfo.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 配送地址显示 */}
              {shippingAddress && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-sm font-medium text-dvit-white mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    配送地址
                  </h3>
                  <div className="text-sm text-dvit-gray">
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                    <p>{shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* 错误显示 */}
              {paymentError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <span className="text-red-300 font-medium">支付错误</span>
                  </div>
                  <p className="text-red-300 text-sm mt-1">{paymentError}</p>
                  <button
                    onClick={() => setPaymentError('')}
                    className="text-red-400 text-sm underline mt-2"
                  >
                    关闭
                  </button>
                </div>
              )}

              {/* 支付表单 - 直接显示，无需按钮触发 */}
              {clientSecret && customerInfo.name && customerInfo.email ? (
                <StripeProvider clientSecret={clientSecret} amount={totalPrice}>
                  <PaymentForm
                    totalPrice={totalPrice}
                    orderData={{
                      customerName: customerInfo.name,
                      customerEmail: customerInfo.email,
                      customerPhone: customerInfo.phone,
                      faceDeck: orderConfiguration?.faceDeck,
                      weightSystem: orderConfiguration?.weightSystem,
                      shippingAddress: shippingAddress
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                    clientSecret={clientSecret}
                  />
                </StripeProvider>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-dvit-blue/10 border border-dvit-blue/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-dvit-blue" />
                      <span className="text-dvit-blue font-medium">正在准备支付</span>
                    </div>
                    <p className="text-dvit-blue/80 text-sm mt-1">
                      正在创建安全的支付会话，请稍候...
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-dvit-accent border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
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
                  <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg border border-white/10">
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