'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Check, User, Mail, Phone, MapPin, CreditCard, Shield, Truck } from 'lucide-react'

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization: {
    [key: string]: any;
    faceDesign?: string;
    weightSystem?: string;
  };
}

interface OrderSubmissionProps {
  faceDeck: string
  weightSystem: string
  totalPrice: number
  cartItems: CartItem[]
  onSubmit: (orderData: any) => void
}

export default function OrderSubmission({ faceDeck, weightSystem, totalPrice, cartItems, onSubmit }: OrderSubmissionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'credit-card'
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const orderData = {
      ...formData,
      configuration: {
        faceDeck,
        weightSystem
      },
      totalPrice,
      orderDate: new Date().toISOString(),
      orderId: `DG-${Date.now()}`
    }
    
    onSubmit(orderData)
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const isFormValid = formData.name && formData.email && formData.phone && formData.address

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-4">订单提交成功！</h3>
        <p className="text-gray-300 mb-6">
          感谢您的订购！我们将在24小时内与您联系确认订单详情。
        </p>
        
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-400 mb-2">订单号</p>
          <p className="text-lg font-mono text-white">DG-{Date.now()}</p>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>7-14天发货</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>质量保证</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
    >
      <h3 className="text-2xl font-bold text-white mb-6">完成订单</h3>
      
      {/* 配置确认 */}
      <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
        <h4 className="text-lg font-semibold text-white mb-4">配置确认</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Face Deck材质</span>
            <span className="text-white font-medium">{faceDeck}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">配重系统</span>
            <span className="text-white font-medium">{weightSystem}</span>
          </div>
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">总价</span>
              <span className="text-blue-400">${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 订单表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 个人信息 */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            个人信息
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                姓名 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
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
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
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
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="请输入邮箱地址"
              required
            />
          </div>
        </div>

        {/* 收货地址 */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            收货地址
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                详细地址 *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="请输入详细收货地址"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  城市
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
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
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="请输入邮政编码"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 支付方式 */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            支付方式
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-xl border border-white/10 cursor-pointer hover:bg-gray-800/50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="credit-card"
                checked={formData.paymentMethod === 'credit-card'}
                onChange={handleInputChange}
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
                checked={formData.paymentMethod === 'bank-transfer'}
                onChange={handleInputChange}
                className="text-blue-500"
              />
              <span className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">¥</span>
              <span className="text-white">银行转账</span>
            </label>
          </div>
        </div>

        {/* 提交按钮 */}
        <motion.button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
            isFormValid && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              提交中...
            </div>
          ) : (
            `确认订单 - $${totalPrice.toLocaleString()}`
          )}
        </motion.button>
      </form>

      {/* 安全提示 */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-center gap-2 text-blue-400 text-sm">
          <Shield className="w-4 h-4" />
          <span>您的个人信息将被安全加密处理，我们承诺不会泄露给第三方</span>
        </div>
      </div>
    </motion.div>
  )
}