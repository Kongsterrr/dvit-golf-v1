'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import PageLayout from '../components/PageLayout'
import HeroSection from '../components/HeroSection'
import ProductShowcase from '../components/ProductShowcase'
import FeatureSection from '../components/FeatureSection'
import CTASection from '../components/CTASection'

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <>
      <PageLayout showParticles={true}>
        <HeroSection />
        <ProductShowcase />
        <FeatureSection />
        <CTASection />
      </PageLayout>

      {/* 滚动指示器 */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          className="flex flex-col items-center text-white/60 cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => {
            document.getElementById('product-showcase')?.scrollIntoView({ 
              behavior: 'smooth' 
            })
          }}
        >
          <span className="text-sm font-light mb-2">探索更多</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </>
  )
}