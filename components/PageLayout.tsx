'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  showParticles?: boolean
}

export default function PageLayout({ 
  children, 
  className = '', 
  showParticles = false 
}: PageLayoutProps) {
  return (
    <main className={`relative min-h-screen bg-dvit-black overflow-hidden ${className}`}>
      {/* 背景渐变 */}
      <div className="fixed inset-0 hero-gradient" />
      
      {/* 动态背景粒子效果 (可选) */}
      {showParticles && (
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-dvit-gray-950/20 to-transparent" />
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* 导航条 */}
      <Navigation />

      {/* 主要内容 */}
      <div className="relative z-10 pt-12">
        {children}
      </div>
    </main>
  )
}