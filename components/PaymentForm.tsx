'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { validateClientPaymentRequest, validatePaymentIntentStatus } from '../lib/payment-validation';
import { CreditCard, Smartphone, Shield, CheckCircle, Lock, AlertCircle } from 'lucide-react';
import { LoadingButtonContent } from './LoadingSpinner';

interface PaymentFormProps {
  totalPrice: number;
  onPaymentSuccess: (paymentIntentId?: string) => void;
  orderData?: any;
  clientSecret?: string;
  onCreatePaymentIntent?: (orderData: any) => Promise<{ success: boolean; clientSecret?: string; error?: string; demoMode?: boolean }>;
  isCreatingPaymentIntent?: boolean;
}

export default function PaymentForm({ 
  totalPrice, 
  onPaymentSuccess, 
  orderData,
  clientSecret,
  onCreatePaymentIntent,
  isCreatingPaymentIntent = false
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('info');
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  // 统一的盒子样式（与 payment/page.tsx 一致）
  const box = 'bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6';

  // 状态消息在统一盒子基础上细分边框/背景
  const statusBox = {
    error: `${box} border-red-500/30 bg-red-500/10`,
    success: `${box} border-green-500/30 bg-green-500/10`,
    info: `${box} border-dvit-blue/30 bg-dvit-blue/10`,
  } as const;

  useEffect(() => {
    setIsPaymentReady(!!stripe && !!elements && !!clientSecret);
  }, [stripe, elements, clientSecret]);
  
  useEffect(() => {
    if (orderData?.customerName) {
      setCardholderName(orderData.customerName);
    }
  }, [orderData]);

  const validatePayment = () => {
    const validation = validateClientPaymentRequest(totalPrice, orderData);
    if (!validation.isValid) {
      setMessage(validation.errors[0] || '支付验证失败');
      setMessageType('error');
      return false;
    }
    if (!stripe || !elements || !clientSecret) {
      setMessage('支付系统未准备就绪');
      setMessageType('error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validatePayment()) {
      return;
    }

    setIsLoading(true);
    setMessage('正在验证支付信息...');
    setMessageType('info');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);

      setMessage('正在处理支付...');

      // 在支付确认前保存订单信息到localStorage，防止重定向时丢失
      if (orderData) {
        try {
          localStorage.setItem('customerName', orderData.customerName || '');
          localStorage.setItem('customerEmail', orderData.customerEmail || '');
          localStorage.setItem('orderTotal', totalPrice.toString());
          
          // 保存订单项信息
          const orderItems = [{
            name: "DVIT定制推杆",
            price: totalPrice,
            quantity: 1,
            customization: orderData.orderConfiguration || {}
          }];
          localStorage.setItem('orderItems', JSON.stringify(orderItems));
          
          console.log('订单信息已保存到localStorage，防止重定向时丢失');
        } catch (storageError) {
          console.warn('保存订单信息到localStorage失败:', storageError);
        }
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        let errorMessage = '支付失败，请重试';
        switch (error.type) {
          case 'card_error':
            errorMessage = error.message || '银行卡信息有误，请检查后重试';
            break;
          case 'validation_error':
            errorMessage = '请检查支付信息是否完整';
            break;
          case 'invalid_request_error':
            errorMessage = '支付请求无效，请重新尝试';
            break;
          case 'api_connection_error':
            errorMessage = '网络连接失败，请检查网络后重试';
            break;
          case 'api_error':
            errorMessage = '支付服务暂时不可用，请稍后重试';
            break;
          case 'authentication_error':
            errorMessage = '支付认证失败，请重试';
            break;
          case 'rate_limit_error':
            errorMessage = '请求过于频繁，请稍后重试';
            break;
          default:
            errorMessage = error.message || '支付过程中发生未知错误';
        }
        setMessage(errorMessage);
        setMessageType('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        if (!validatePaymentIntentStatus(paymentIntent.status)) {
          setMessage('支付状态异常，请联系客服');
          setMessageType('error');
          return;
        }
        const expectedAmount = Math.round(totalPrice * 100);
        if (paymentIntent.amount !== expectedAmount) {
          console.warn('支付金额不匹配:', {
            expected: expectedAmount,
            actual: paymentIntent.amount,
            paymentIntentId: paymentIntent.id
          });
        }
        setMessage('支付成功！您的订单已成功支付！');
        setMessageType('success');
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        setMessage('支付正在处理中，请稍候...');
        setMessageType('info');
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        setMessage('支付需要额外验证，请按照提示完成验证');
        setMessageType('info');
      } else {
        setMessage('支付状态未知，请联系客服');
        setMessageType('error');
      }
    } catch (err: any) {
      const errorMessage = err.message || '支付过程中发生错误，请重试';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 支付方式选择（保持原样式不变） */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-dvit-accent to-dvit-blue rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
            <h3 className="text-xl font-semibold text-dvit-white">选择支付方式</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-6 border-2 rounded-2xl flex items-center justify-center space-x-4 transition-all duration-300 group ${
                paymentMethod === 'card'
                  ? 'border-dvit-accent bg-gradient-to-br from-dvit-accent/20 to-dvit-blue/10 text-dvit-accent backdrop-blur-sm shadow-lg shadow-dvit-accent/20'
                  : 'border-white/20 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <CreditCard className={`h-6 w-6 transition-transform duration-300 ${paymentMethod === 'card' ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="font-medium text-lg">信用卡</span>
              {paymentMethod === 'card' && <CheckCircle className="h-5 w-5 text-dvit-accent" />}
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setPaymentMethod('mobile')}
              className={`p-6 border-2 rounded-2xl flex items-center justify-center space-x-4 transition-all duration-300 group ${
                paymentMethod === 'mobile'
                  ? 'border-dvit-accent bg-gradient-to-br from-dvit-accent/20 to-dvit-blue/10 text-dvit-accent backdrop-blur-sm shadow-lg shadow-dvit-accent/20'
                  : 'border-white/20 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Smartphone className={`h-6 w-6 transition-transform duration-300 ${paymentMethod === 'mobile' ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="font-medium text-lg">移动支付</span>
              {paymentMethod === 'mobile' && <CheckCircle className="h-5 w-5 text-dvit-accent" />}
            </motion.button>
          </div>
        </motion.div>

        {/* 支付信息 */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-dvit-accent to-dvit-blue rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
            <h3 className="text-xl font-semibold text-dvit-white">支付信息</h3>
          </div>
          
          {/* 测试环境提示 —— 统一为与页面一致的卡片风格 */}
          <motion.div 
            className={box}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-6 w-6 text-dvit-accent" />
              <span className="text-dvit-accent font-semibold text-lg">Stripe 测试环境</span>
            </div>
            <p className="text-dvit-gray text-base mb-4 leading-relaxed">
              使用以下测试卡号进行支付测试，不会产生真实费用：
            </p>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-white/90">
                  <span className="font-semibold text-white block mb-1">卡号：</span>
                  <span className="font-mono text-dvit-accent">4242 4242 4242 4242</span>
                </div>
                <div className="text-white/90">
                  <span className="font-semibold text-white block mb-1">有效期：</span>
                  <span>任意未来日期</span>
                </div>
                <div className="text-white/90">
                  <span className="font-semibold text-white block mb-1">CVC：</span>
                  <span>任意3位数字</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* PaymentElement 容器 —— 统一为页面卡片风格 */}
          <motion.div 
            className={box}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
          >
            <PaymentElement 
              options={{
                layout: 'tabs',
                paymentMethodOrder: paymentMethod === 'card' ? ['card'] : ['alipay', 'wechat_pay'],
                defaultValues: {
                  billingDetails: {
                    name: cardholderName || orderData?.customerName || '',
                    email: orderData?.customerEmail || '',
                  }
                },
                fields: {
                  billingDetails: {
                    name: 'auto',
                    email: 'auto',
                  }
                }
              }}
            />
          </motion.div>
        </motion.div>

        {/* 账单地址 */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-dvit-accent to-dvit-blue rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
            <h3 className="text-xl font-semibold text-dvit-white">账单地址</h3>
          </div>
          {/* AddressElement 容器 —— 统一为页面卡片风格 */}
          <motion.div 
            className={box}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
          >
            <AddressElement 
              options={{
                mode: 'billing',
                allowedCountries: ['US', 'CN'],
              }}
            />
          </motion.div>
        </motion.div>

        {/* 状态消息显示 —— 基于统一盒子样式 */}
        {message && (
          <motion.div 
            className={statusBox[messageType]}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              {messageType === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              {messageType === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
              {messageType === 'info' && <Lock className="h-5 w-5 flex-shrink-0" />}
              <p className="text-base font-medium font-sf-pro leading-relaxed">
                {message}
              </p>
            </div>
          </motion.div>
        )}

        {/* 安全提示（保持简单文本，不用卡片） */}
        <motion.div 
          className="flex items-center justify-center space-x-3 text-base text-white/60 font-sf-pro py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Shield className="h-5 w-5" />
          <span>您的支付信息通过 SSL 加密保护</span>
        </motion.div>

        {/* 提交按钮 */}
        <motion.button
          type="submit"
          disabled={!isPaymentReady || isLoading}
          className="w-full bg-gradient-to-r from-dvit-accent to-dvit-blue text-white py-6 px-8 rounded-2xl font-semibold text-xl hover:from-dvit-accent/90 hover:to-dvit-blue/90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl shadow-dvit-accent/25 hover:shadow-2xl hover:shadow-dvit-accent/40 border border-dvit-accent/20"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {isLoading ? (
            <LoadingButtonContent
              isLoading={true}
              loadingText="处理支付中..."
            />
          ) : (
            <>
              <CreditCard className="h-6 w-6" />
              <span>支付 ${totalPrice.toLocaleString()}</span>
              <div className="ml-auto">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
