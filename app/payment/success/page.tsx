'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentSuccess from '../../../components/PaymentSuccess';
import { motion } from 'framer-motion';
import PageLayout from '../../../components/PageLayout';
import { useCart } from '../../../contexts/CartContext';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const confirmOrder = async () => {
      // 从URL参数或localStorage获取paymentIntentId
      const urlPaymentIntentId = searchParams.get('payment_intent');
      const storedPaymentIntentId = localStorage.getItem('lastPaymentIntentId');
      const paymentIntentId = urlPaymentIntentId || storedPaymentIntentId;

      if (!paymentIntentId) {
        setError('未找到支付信息');
        setLoading(false);
        return;
      }

      try {
        // 从localStorage获取订单信息
        const orderItems = localStorage.getItem('orderItems');
        const customerName = localStorage.getItem('customerName');
        const customerEmail = localStorage.getItem('customerEmail');
        const orderTotal = localStorage.getItem('orderTotal');
        const lastOrderId = localStorage.getItem('lastOrderId');

        // 如果localStorage中缺少信息，尝试从数据库获取
        if (!customerName || !customerEmail || !orderTotal) {
          console.log('localStorage信息不完整，尝试从数据库获取订单信息...');
          
          try {
            const dbResponse = await fetch(`/api/orders/by-payment-intent?paymentIntentId=${paymentIntentId}`);
            const dbResult = await dbResponse.json();
            
            if (dbResult.success && dbResult.order) {
              // 从数据库获取到订单信息，直接设置orderData
              setOrderData({
                id: dbResult.order.id,
                orderNumber: dbResult.order.orderNumber,
                customerName: dbResult.order.customerName,
                customerEmail: dbResult.order.customerEmail,
                totalAmount: dbResult.order.totalAmount,
                currency: dbResult.order.currency,
                orderItems: dbResult.order.orderItems,
                shippingAddress: dbResult.order.shippingAddress,
                orderConfiguration: dbResult.order.orderConfiguration,
                paymentIntentId: dbResult.order.paymentIntentId,
                status: dbResult.order.status,
                createdAt: dbResult.order.createdAt
              });
              
              // // 清理localStorage
              // localStorage.removeItem('orderItems');
              // localStorage.removeItem('lastOrderId');
              // localStorage.removeItem('lastPaymentIntentId');
              // localStorage.removeItem('customerName');
              // localStorage.removeItem('customerEmail');
              // localStorage.removeItem('orderTotal');
              
              // // 清空购物车
              // clearCart();
              
              // setLoading(false);
              // return;
            } else {
              console.error('无法从数据库获取订单信息:', dbResult.error);
              setError('订单信息不完整，请重新下单');
              setLoading(false);
              return;
            }
          } catch (dbError) {
            console.error('数据库查询失败:', dbError);
            setError('订单信息不完整，请重新下单');
            setLoading(false);
            return;
          }
        }

        // 首先检查订单是否已存在（通过lastOrderId或paymentIntentId）
        let existingOrderId = lastOrderId;
        
        if (!existingOrderId) {
          // 如果没有lastOrderId，尝试通过paymentIntentId查找现有订单
          const checkResponse = await fetch(`/api/orders/check?paymentIntentId=${paymentIntentId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (checkResponse.ok) {
            const checkResult = await checkResponse.json();
            if (checkResult.exists) {
              existingOrderId = checkResult.orderId;
              console.log('找到现有订单:', existingOrderId);
            }
          }
        }

        // 统一调用 confirm-order API，让服务端处理所有去重逻辑
        const response = await fetch('/api/confirm-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName,
            customerEmail,
            orderId: existingOrderId || paymentIntentId, // 使用现有订单ID或paymentIntentId
            paymentIntentId,
            totalPrice: parseFloat(orderTotal),
            orderItems: orderItems ? JSON.parse(orderItems) : []
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setOrderData({
            orderId: result.dbOrderId || result.originalOrderId || result.orderId,
            paymentIntentId: paymentIntentId,
            totalAmount: parseFloat(orderTotal),
            customerEmail: customerEmail
          });
          
          if (result.duplicate) {
            console.log('订单已存在，服务端已处理去重:', result.dbOrderId);
          } else if (result.emailOnly) {
            console.log('仅发送确认邮件:', result.orderId);
          } else {
            console.log('新订单创建成功:', result.dbOrderId);
          }
          try { clearCart(); } catch {}
          ['orderItems','lastOrderId','lastPaymentIntentId','customerName','customerEmail','orderTotal'].forEach(k=>localStorage.removeItem(k));
          
        } else {
          setError(result.error || '确认订单失败');
        }

        // // 清理localStorage中的临时数据
        // localStorage.removeItem('orderItems');
        // localStorage.removeItem('lastOrderId');
        // localStorage.removeItem('lastPaymentIntentId');
        // localStorage.removeItem('customerName');
        // localStorage.removeItem('customerEmail');
        // localStorage.removeItem('orderTotal');
        
      } catch (error) {
        console.error('确认订单失败:', error);
        setError('确认订单失败，请联系客服');
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [searchParams]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-dvit-accent/30 border-t-dvit-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dvit-white">正在确认订单...</p>
        </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold text-red-400 mb-2">订单确认失败</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-dvit-accent hover:bg-dvit-accent/90 text-dvit-black font-semibold py-2 px-6 rounded-xl transition-all duration-300"
          >
            返回首页
          </a>
        </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <PageLayout>
      <PaymentSuccess 
        orderId={orderData?.orderId} 
        paymentIntentId={orderData?.paymentIntentId}
        orderTotal={orderData?.totalAmount} 
        customerEmail={orderData?.customerEmail} 
      />
    </PageLayout>
  );
}