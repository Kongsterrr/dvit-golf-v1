'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, Users, Award } from 'lucide-react'

const stats = [
  { icon: <Users className="w-6 h-6" />, value: '10,000+', label: '满意客户' },
  { icon: <Star className="w-6 h-6" />, value: '4.9/5', label: '用户评分' },
  { icon: <Award className="w-6 h-6" />, value: '50+', label: '专业认证' }
]

export default function CTASection() {
  return (
    <section className="relative py-32 section-padding overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-dvit-black via-dvit-gray-900 to-dvit-black" />
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 60% 40%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container-max relative">
        {/* 主要CTA区域 */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            准备好定制您的
            <span className="text-gradient block mt-2">
              专属推杆了吗？
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-dvit-gray-300 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            加入数千名专业球手的行列，体验模块化推杆带来的精准控制和个性表达
          </motion.p>

          {/* 按钮组 */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="button-primary text-lg px-8 py-4 flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              开始定制
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
            
            <motion.button
              className="button-secondary text-lg px-8 py-4 flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              观看演示
            </motion.button>
          </motion.div>
        </motion.div>

        {/* 统计数据 */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="glass-effect rounded-2xl p-8 transition-all duration-300 hover:bg-white/10">
                <motion.div
                  className="inline-flex p-4 rounded-xl bg-gradient-to-r from-dvit-accent to-blue-600 mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </motion.div>
                
                <motion.div
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-dvit-gray-400">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 底部信息 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          viewport={{ once: true }}
        >
          <div className="glass-effect rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-4">
                  专业支持团队
                </h3>
                <p className="text-dvit-gray-300 mb-6">
                  我们的专家团队将为您提供一对一的定制咨询服务，确保您获得最适合的推杆配置。
                </p>
                <div className="flex items-center gap-4 text-sm text-dvit-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    在线客服
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    专业咨询
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    售后保障
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <motion.div
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-dvit-accent to-blue-600 opacity-20"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-sm text-dvit-gray-400">专业服务</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}