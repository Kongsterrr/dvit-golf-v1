'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function HeroSection() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative py-20 md:py-32 flex items-center justify-center section-padding">
      <div className="container-max text-center">
        {/* 主标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.h1 
            className="hero-title font-bold text-gradient mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            重新定义
            <br />
            <span className="accent-gradient">高尔夫推杆</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-dvit-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            体验前所未有的模块化设计。每一个细节都为您的完美一击而生。
          </motion.p>
        </motion.div>

        {/* 产品预览区域 */}
        <motion.div
          className="relative mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          {/* 3D产品展示占位符 */}
          <div className="relative w-full max-w-2xl mx-auto h-96 glass-effect rounded-3xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-64 h-64 bg-gradient-to-br from-dvit-accent/20 to-dvit-gold/20 rounded-full"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-6xl font-bold text-white/80"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  DVIT
                </motion.div>
              </div>
            </div>
            
            {/* 光效 */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-dvit-accent to-transparent" />
          </div>

          {/* 浮动元素 */}
          <motion.div
            className="absolute -top-4 -right-4 w-8 h-8 bg-dvit-gold rounded-full opacity-60"
            animate={{ 
              y: [0, -20, 0],
              x: [0, 10, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-6 h-6 bg-dvit-accent rounded-full opacity-40"
            animate={{ 
              y: [0, 15, 0],
              x: [0, -8, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </motion.div>

        {/* 行动按钮 */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Link href="/customize">
            <motion.button
              className="button-primary group flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              开始定制
              <motion.div
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
          </Link>

          <motion.button
            className="button-secondary group flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" />
            观看介绍
          </motion.button>
        </motion.div>

        {/* 特性标签 */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {['模块化设计', '精密工艺', '个性定制', '专业级品质'].map((feature, index) => (
            <motion.div
              key={feature}
              className="glass-effect px-4 py-2 rounded-full text-sm font-medium"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {feature}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}