'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PaymentSuccessProps {
  orderId?: string;
  paymentIntentId?: string;
  orderTotal?: number;
  customerEmail?: string;
}

export default function PaymentSuccess({ 
  orderId = 'DVIT-' + Date.now(), 
  paymentIntentId,
  orderTotal = 0,
  customerEmail = ''
}: PaymentSuccessProps) {
  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 成功图标 */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="relative">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <motion.div
              className="absolute inset-0 w-24 h-24 border-2 border-green-400/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

        {/* 标题和描述 */}
        <motion.h1 
          className="text-4xl md:text-5xl font-bold mb-4 font-sf-pro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          支付成功！
        </motion.h1>
        
        <motion.p 
          className="text-xl text-white/70 mb-8 font-sf-pro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          感谢您的购买，您的订单已确认
        </motion.p>

        {/* 订单信息卡片 */}
        <motion.div 
          className="glass-effect bg-white/5 border border-white/10 rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2 text-dvit-accent font-sf-pro">订单编号</h3>
              <p className="text-white/90 font-mono">{orderId}</p>
            </div>
            {paymentIntentId && (
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2 text-dvit-accent font-sf-pro">支付ID</h3>
                <p className="text-white/90 font-mono text-sm">{paymentIntentId}</p>
              </div>
            )}
            {orderTotal > 0 && (
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-2 text-dvit-accent font-sf-pro">订单金额</h3>
                <p className="text-white/90 text-xl font-semibold">${orderTotal.toLocaleString()}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* 下一步信息 */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex flex-col items-center p-6 glass-effect bg-white/5 border border-white/10 rounded-xl">
            <Mail className="w-8 h-8 text-dvit-accent mb-3" />
            <h4 className="font-semibold mb-2 font-sf-pro">确认邮件</h4>
            <p className="text-sm text-white/70 text-center font-sf-pro">
              订单确认邮件已发送至您的邮箱
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 glass-effect bg-white/5 border border-white/10 rounded-xl">
            <Package className="w-8 h-8 text-dvit-accent mb-3" />
            <h4 className="font-semibold mb-2 font-sf-pro">生产制作</h4>
            <p className="text-sm text-white/70 text-center font-sf-pro">
              我们将开始为您定制专属推杆
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 glass-effect bg-white/5 border border-white/10 rounded-xl">
            <Truck className="w-8 h-8 text-dvit-accent mb-3" />
            <h4 className="font-semibold mb-2 font-sf-pro">配送发货</h4>
            <p className="text-sm text-white/70 text-center font-sf-pro">
              预计7-14个工作日内发货
            </p>
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link 
            href="/orders" 
            className="button-primary inline-flex items-center justify-center gap-2 font-sf-pro"
          >
            查看订单详情
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link 
            href="/" 
            className="button-secondary inline-flex items-center justify-center gap-2 font-sf-pro"
          >
            返回首页
          </Link>
        </motion.div>

        {/* 客服信息 */}
        <motion.div 
          className="mt-12 p-6 glass-effect bg-white/5 border border-white/10 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h4 className="font-semibold mb-2 font-sf-pro">需要帮助？</h4>
          <p className="text-white/70 mb-4 font-sf-pro">
            如有任何问题，请随时联系我们的客服团队
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@dvitgolf.com" 
              className="text-dvit-accent hover:text-blue-400 transition-colors font-sf-pro"
            >
              support@dvitgolf.com
            </a>
            <span className="hidden sm:inline text-white/30">|</span>
            <a 
              href="tel:+86-400-123-4567" 
              className="text-dvit-accent hover:text-blue-400 transition-colors font-sf-pro"
            >
              400-123-4567
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}