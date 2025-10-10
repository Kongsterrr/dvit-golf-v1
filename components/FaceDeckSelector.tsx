'use client';

import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import { Configuration } from '../app/customize/page';

interface FaceDeckOption {
  material: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  popular?: boolean;
  stripe_product_id?: string;
  stripe_price_id?: string;
}



interface FaceDeckSelectorProps {
  selectedFaceDeck: Configuration['faceDeck'];
  onSelect: (faceDeck: Configuration['faceDeck']) => void;
  productData?: any[];
  isLoading?: boolean;
}

export default function FaceDeckSelector({ 
  selectedFaceDeck, 
  onSelect, 
  productData = [],
  isLoading = false 
}: FaceDeckSelectorProps) {
  
  // 如果有产品数据，使用API数据；否则使用默认数据
  const faceDeckOptions: FaceDeckOption[] = productData.length > 0 
    ? productData.map(product => ({
        material: product.subcategory,
        name: product.name,
        price: product.base_price / 100, // 转换为美元
        description: product.description || '',
        features: product.features ? JSON.parse(product.features) : [],
        image: product.image_url || `/images/face-deck-${product.subcategory.replace('_', '-')}.jpg`,
        popular: product.is_popular || false,
        stripe_product_id: product.stripe_product_id,
        stripe_price_id: product.stripe_price_id,
      }))
    : [
        {
          material: 'aluminum_6061',
          name: '6061铝合金',
          price: 0,
          description: '轻量化设计，优异的耐腐蚀性能',
          features: ['轻量化', '耐腐蚀', '成本效益', '经典选择'],
          image: '/images/face-deck-aluminum.jpg',
          popular: true,
        },
        {
          material: 'copper_alloy',
          name: '铜合金',
          price: 150,
          description: '经典材质，提供优异的手感和反馈',
          features: ['经典手感', '优异反馈', '传统工艺', '温润质感'],
          image: '/images/face-deck-copper.jpg',
        },
        {
          material: 'stainless_steel_303',
          name: '303不锈钢',
          price: 120,
          description: '坚固耐用，精密加工表面',
          features: ['坚固耐用', '精密加工', '抗磨损', '专业级'],
          image: '/images/face-deck-steel.jpg',
        },
        {
          material: 'polymer',
          name: '聚合物',
          price: 80,
          description: '创新材料，减震降噪',
          features: ['减震降噪', '创新材料', '轻量化', '舒适手感'],
          image: '/images/face-deck-polymer.jpg',
        },
      ];

  const handleSelect = (option: FaceDeckOption) => {
    onSelect({
      material: option.material,
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
          <h2 className="text-2xl font-bold mb-2">选择面板材质</h2>
          <p className="text-dvit-gray">正在加载产品数据...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          <h2 className="text-2xl font-bold mb-2">Face Deck 材质</h2>
          <p className="text-dvit-gray">选择您偏好的推杆面材质，影响手感和性能</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-dvit-accent">
          <Info className="w-4 h-4" />
          <span>4种选择</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faceDeckOptions.map((option, index) => (
          <motion.div
            key={option.material}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedFaceDeck?.material === option.material
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
            {/* 热门标签 */}
            {option.popular && (
              <div className="absolute -top-2 -right-2 bg-dvit-accent text-dvit-black text-xs font-bold px-2 py-1 rounded-full">
                热门
              </div>
            )}

            {/* 选中状态 */}
            {selectedFaceDeck?.material === option.material && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-dvit-accent rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-dvit-black" />
              </div>
            )}

            {/* 材质图片占位符 */}
            <div className="w-full h-32 bg-gradient-to-br from-white/10 to-white/5 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-4xl font-bold text-white/20">
                {option.name.charAt(0)}
              </div>
            </div>

            {/* 材质信息 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{option.name}</h3>
                <span className="text-dvit-accent font-bold">
                  {option.price === 0 ? '标准' : `+$${option.price}`}
                </span>
              </div>

              <p className="text-sm text-dvit-gray">{option.description}</p>

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

      {/* 选择提示 */}
      {!selectedFaceDeck && (
        <motion.div 
          className="mt-6 p-4 bg-dvit-accent/10 border border-dvit-accent/30 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-dvit-accent">
            💡 请选择一种Face Deck材质以继续配置
          </p>
        </motion.div>
      )}
    </div>
  );
}