'use client';

import { motion } from 'framer-motion';
import { Check, Info, Zap, Target } from 'lucide-react';
import { Configuration } from '../app/customize/page';

interface WeightSystemOption {
  type: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  specs: {
    weight: string;
    balance: string;
    stability: string;
  };
  icon: React.ReactNode;
  recommended?: boolean;
  stripe_product_id?: string;
  stripe_price_id?: string;
}



interface WeightSystemSelectorProps {
  selectedWeightSystem: Configuration['weightSystem'];
  onSelect: (weightSystem: Configuration['weightSystem']) => void;
  productData?: any[];
  isLoading?: boolean;
}

export default function WeightSystemSelector({ 
  selectedWeightSystem, 
  onSelect,
  productData = [],
  isLoading = false 
}: WeightSystemSelectorProps) {
  
  // 如果有产品数据，使用API数据；否则使用默认数据
  const weightSystemOptions: WeightSystemOption[] = productData.length > 0 
    ? productData.map(product => ({
        type: product.subcategory,
        name: product.name,
        price: product.base_price / 100, // 转换为美元
        description: product.description || '',
        features: product.features ? JSON.parse(product.features) : [],
        specs: product.specs ? JSON.parse(product.specs) : {
          weight: '350g',
          balance: '平衡型',
          stability: '★★★★☆',
        },
        icon: product.subcategory === 'long_wing' ? <Target className="w-6 h-6" /> : <Zap className="w-6 h-6" />,
        recommended: product.is_popular || false,
        stripe_product_id: product.stripe_product_id,
        stripe_price_id: product.stripe_price_id,
      }))
    : [
        {
          type: 'long_wing',
          name: 'Long Wing',
          price: 0,
          description: '长翼设计，提供更大的惯性矩和稳定性',
          features: ['高稳定性', '大惯性矩', '直线性好', '适合长推'],
          specs: {
            weight: '350g',
            balance: '高稳定',
            stability: '★★★★★',
          },
          icon: <Target className="w-6 h-6" />,
          recommended: true,
        },
        {
          type: 'short_wing',
          name: 'Short Wing',
          price: 50,
          description: '短翼设计，提供更好的操控性和手感',
          features: ['高操控性', '灵活手感', '精准控制', '适合短推'],
          specs: {
            weight: '320g',
            balance: '平衡型',
            stability: '★★★★☆',
          },
          icon: <Zap className="w-6 h-6" />,
        },
      ];

  const handleSelect = (option: WeightSystemOption) => {
    onSelect({
      type: option.type,
      name: option.name,
      price: option.price,
      description: option.description,
      stripe_product_id: option.stripe_product_id,
      stripe_price_id: option.stripe_price_id,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">选择配重系统</h2>
          <p className="text-dvit-gray">正在加载产品数据...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">配重系统</h2>
          <p className="text-dvit-gray">选择适合您推杆风格的配重系统</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-dvit-accent">
          <Info className="w-4 h-4" />
          <span>2种选择</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {weightSystemOptions.map((option, index) => (
          <motion.div
            key={option.type}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedWeightSystem?.type === option.type
                ? 'border-dvit-accent bg-dvit-accent/10'
                : 'border-white/20 hover:border-white/40 bg-white/5'
            }`}
            onClick={() => handleSelect(option)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 推荐标签 */}
            {option.recommended && (
              <div className="absolute -top-2 -right-2 bg-dvit-gold text-dvit-black text-xs font-bold px-2 py-1 rounded-full">
                推荐
              </div>
            )}

            {/* 选中状态 */}
            {selectedWeightSystem?.type === option.type && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-dvit-accent rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-dvit-black" />
              </div>
            )}

            {/* 图标和标题 */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-dvit-accent/20 rounded-lg text-dvit-accent">
                {option.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{option.name}</h3>
                <span className="text-dvit-accent font-bold">+${option.price}</span>
              </div>
            </div>

            {/* 描述 */}
            <p className="text-sm text-dvit-gray mb-4">{option.description}</p>

            {/* 规格参数 */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-dvit-gray">重量:</span>
                <span className="text-dvit-white">{option.specs.weight}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dvit-gray">平衡性:</span>
                <span className="text-dvit-white">{option.specs.balance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dvit-gray">稳定性:</span>
                <span className="text-dvit-accent">{option.specs.stability}</span>
              </div>
            </div>

            {/* 特性标签 */}
            <div className="flex flex-wrap gap-2">
              {option.features.map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-white/10 text-xs rounded-full text-dvit-white"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* 悬停效果 */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-dvit-accent/0 to-dvit-accent/5 opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      {/* 对比表格 */}
      <motion.div 
        className="mt-8 bg-white/5 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4">配重系统对比</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 text-dvit-gray">特性</th>
                <th className="text-center py-2">Long Wing</th>
                <th className="text-center py-2">Short Wing</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              <tr className="border-b border-white/10">
                <td className="py-2 text-dvit-gray">稳定性</td>
                <td className="text-center py-2 text-green-400">★★★★★</td>
                <td className="text-center py-2 text-yellow-400">★★★★☆</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2 text-dvit-gray">操控性</td>
                <td className="text-center py-2 text-yellow-400">★★★☆☆</td>
                <td className="text-center py-2 text-green-400">★★★★★</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2 text-dvit-gray">适用距离</td>
                <td className="text-center py-2">长距离推杆</td>
                <td className="text-center py-2">短距离推杆</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 选择提示 */}
      {!selectedWeightSystem && (
        <motion.div 
          className="mt-6 p-4 bg-dvit-accent/10 border border-dvit-accent/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-dvit-accent">
            💡 请选择一种配重系统以完成配置
          </p>
        </motion.div>
      )}
    </div>
  );
}