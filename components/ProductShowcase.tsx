'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Zap, Settings, Award, Sparkles } from 'lucide-react'

const products = [
  {
    id: 'base',
    name: 'Dvit Modular Putter',
    category: '基础推杆',
    price: '$899',
    description: '高端模块化推杆，支持多种定制选项',
    features: ['精密CNC加工', '航空级铝合金', '人体工学设计'],
    icon: <Award className="w-6 h-6" />,
    gradient: 'from-dvit-accent to-blue-600'
  },
  {
    id: 'face_deck',
    name: 'Face Deck 系列',
    category: '击球面板',
    price: '$0 - $150',
    description: '多种材质选择，打造独特击球感受',
    features: ['6061铝合金', '铜合金', '303不锈钢', '聚合物'],
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-dvit-gold to-yellow-500'
  },
  {
    id: 'weight_system',
    name: '配重系统',
    category: '平衡调节',
    price: '$0 - $50',
    description: '精确调节推杆平衡点和惯性矩',
    features: ['Long Wing设计', 'Short Wing设计', '可调节重量'],
    icon: <Settings className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-500'
  }
]

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState(0)

  return (
    <section id="product-showcase" className="relative py-32 section-padding">
      <div className="container-max">
        {/* 标题 */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            模块化设计
          </h2>
          <p className="text-xl text-dvit-gray-300 max-w-2xl mx-auto">
            每个组件都经过精心设计，让您打造独一无二的推杆
          </p>
        </motion.div>

        {/* 产品网格 */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className={`relative group cursor-pointer ${
                selectedProduct === index ? 'scale-105' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedProduct(index)}
            >
              <div className="glass-effect rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/10">
                {/* 图标和标题 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${product.gradient}`}>
                    {product.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="text-dvit-gray-400 text-sm">
                      {product.category}
                    </p>
                  </div>
                </div>

                {/* 价格 */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-dvit-accent">
                    {product.price}
                  </span>
                </div>

                {/* 描述 */}
                <p className="text-dvit-gray-300 mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* 特性列表 */}
                <div className="space-y-2">
                  {product.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-dvit-gray-400"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.2 + featureIndex * 0.1 
                      }}
                      viewport={{ once: true }}
                    >
                      <Zap className="w-4 h-4 text-dvit-accent" />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {/* 选中指示器 */}
                {selectedProduct === index && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-dvit-accent"
                    layoutId="selectedProduct"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 详细展示区域 */}
        <motion.div
          className="glass-effect rounded-3xl p-8 md:p-12"
          key={selectedProduct}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 产品详情 */}
            <div>
              <motion.h3
                className="text-3xl font-bold text-white mb-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {products[selectedProduct].name}
              </motion.h3>
              
              <motion.p
                className="text-lg text-dvit-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {products[selectedProduct].description}
              </motion.p>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {products[selectedProduct].features.map((feature, index) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-dvit-accent rounded-full" />
                    <span className="text-dvit-gray-300">{feature}</span>
                  </div>
                ))}
              </motion.div>

              <motion.button
                className="button-primary mt-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                了解更多
              </motion.button>
            </div>

            {/* 3D展示区域 */}
            <motion.div
              className="relative h-96 glass-effect rounded-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className={`w-48 h-48 rounded-full bg-gradient-to-br ${products[selectedProduct].gradient} opacity-20`}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-4xl font-bold text-white/60"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    3D
                  </motion.div>
                </div>
              </div>
              
              {/* 装饰元素 */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-dvit-accent rounded-full animate-pulse" />
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-dvit-gold rounded-full animate-pulse" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}