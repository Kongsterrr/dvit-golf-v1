'use client';

import { motion } from 'framer-motion';
import { Calculator, Tag, TrendingUp } from 'lucide-react';
import { Configuration } from '../app/customize/page';

interface PriceCalculatorProps {
  configuration: Configuration;
  totalPrice: number;
}

export default function PriceCalculator({ configuration, totalPrice }: PriceCalculatorProps) {
  const basePutterPrice = 899;
  const faceDeckPrice = configuration.faceDeck?.price || 0;
  const weightSystemPrice = configuration.weightSystem?.price || 0;

  const priceItems = [
    {
      name: '基础推杆',
      price: basePutterPrice,
      included: true,
      description: '包含推杆杆身、握把等基础组件',
    },
    {
      name: configuration.faceDeck?.name || 'Face Deck',
      price: faceDeckPrice,
      included: !!configuration.faceDeck,
      description: configuration.faceDeck?.description || '选择Face Deck材质',
    },
    {
      name: configuration.weightSystem?.name || '配重系统',
      price: weightSystemPrice,
      included: !!configuration.weightSystem,
      description: configuration.weightSystem?.description || '选择配重系统',
    },
  ];

  const savings = 0; // 可以根据组合优惠计算
  const finalPrice = totalPrice - savings;

  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="w-5 h-5 text-dvit-accent" />
        <h3 className="text-xl font-semibold">价格明细</h3>
      </div>

      {/* 价格分解 */}
      <div className="space-y-3 mb-6">
        {priceItems.map((item, index) => (
          <motion.div
            key={item.name}
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
              item.included 
                ? 'bg-white/10 border border-white/20' 
                : 'bg-white/5 border border-white/10 opacity-60'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex-1">
              <p className={`font-medium ${item.included ? 'text-dvit-white' : 'text-dvit-gray'}`}>
                {item.name}
              </p>
              <p className="text-xs text-dvit-gray mt-1">
                {item.description}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${item.included ? 'text-dvit-white' : 'text-dvit-gray'}`}>
                {item.price === 0 ? '标准' : `$${item.price.toLocaleString()}`}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 优惠信息 */}
      {savings > 0 && (
        <motion.div 
          className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">组合优惠</span>
          </div>
          <span className="text-sm font-semibold text-green-400">
            -${savings.toLocaleString()}
          </span>
        </motion.div>
      )}

      {/* 总价 */}
      <div className="border-t border-white/20 pt-4">
        <motion.div 
          className="flex items-center justify-between mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="text-lg font-semibold">总计</span>
          <div className="text-right">
            {savings > 0 && (
              <p className="text-sm text-dvit-gray line-through">
                ${totalPrice.toLocaleString()}
              </p>
            )}
            <motion.p 
              className="text-2xl font-bold text-dvit-accent"
              key={finalPrice}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${finalPrice.toLocaleString()}
            </motion.p>
          </div>
        </motion.div>

        {/* 价格趋势提示 */}
        <motion.div 
          className="flex items-center space-x-2 text-xs text-dvit-gray"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <TrendingUp className="w-3 h-3" />
          <span>价格包含所有配置和组装服务</span>
        </motion.div>
      </div>

      {/* 付款方式提示 */}
      {/* <motion.div 
        className="mt-6 p-4 bg-dvit-accent/10 border border-dvit-accent/30 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-dvit-accent rounded-full" />
          <span className="text-sm font-medium text-dvit-accent">支付方式</span>
        </div>
        <div className="text-xs text-dvit-gray space-y-1">
          <p>• 支持微信支付、支付宝、银行卡</p>
          <p>• 可选择分期付款（3/6/12期）</p>
          <p>• 企业客户支持对公转账</p>
        </div>
      </motion.div> */}

      {/* 价格保护 */}
      {/* <motion.div 
        className="mt-4 p-3 bg-white/5 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-2 h-2 bg-dvit-gold rounded-full" />
          <span className="text-sm font-medium text-dvit-gold">价格保护</span>
        </div>
        <p className="text-xs text-dvit-gray">
          下单后30天内如有降价，自动退还差价
        </p>
      </motion.div> */}
    </div>
  );
}