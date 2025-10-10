'use client'

import { motion } from 'framer-motion'
import { Cpu, Palette, Target, Zap, Shield, Sparkles } from 'lucide-react'

const features = [
  {
    icon: <Cpu className="w-8 h-8" />,
    title: '精密工程',
    description: '采用CNC精密加工技术，确保每个组件的完美配合',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 0
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: '个性定制',
    description: '多种材质和配色选择，打造独一无二的专属推杆',
    gradient: 'from-purple-500 to-pink-500',
    delay: 0.1
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: '精准控制',
    description: '优化的重心设计和平衡系统，提升推杆精准度',
    gradient: 'from-green-500 to-emerald-500',
    delay: 0.2
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: '快速组装',
    description: '模块化设计让组装和调整变得简单快捷',
    gradient: 'from-yellow-500 to-orange-500',
    delay: 0.3
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: '耐用材质',
    description: '航空级铝合金和优质钢材，确保长久使用',
    gradient: 'from-gray-500 to-slate-600',
    delay: 0.4
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: '专业级别',
    description: '符合专业比赛标准，满足各级别球手需求',
    gradient: 'from-dvit-accent to-blue-600',
    delay: 0.5
  }
]

export default function FeatureSection() {
  return (
    <section className="relative py-32 section-padding overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dvit-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dvit-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container-max relative">
        {/* 标题 */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gradient mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            为什么选择 Dvit
          </motion.h2>
          <motion.p
            className="text-xl text-dvit-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            突破传统推杆设计局限，为每位高尔夫爱好者提供专业级的定制体验
          </motion.p>
        </motion.div>

        {/* 特性网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="glass-effect rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/10 relative overflow-hidden">
                {/* 背景渐变 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* 图标 */}
                <motion.div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </motion.div>

                {/* 标题 */}
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-dvit-accent transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* 描述 */}
                <p className="text-dvit-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* 装饰元素 */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-dvit-accent rounded-full opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: feature.delay + 0.5 }}
                  viewport={{ once: true }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="button-primary text-lg px-8 py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            探索全部特性
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}