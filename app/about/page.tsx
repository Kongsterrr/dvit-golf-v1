'use client'

import { motion } from 'framer-motion'
import PageLayout from '../../components/PageLayout'

export default function AboutPage() {
  return (
    <PageLayout className="text-white">
      <main>
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
              关于 <span className="text-blue-400">Dvit Golf</span>
            </h1>
            
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-blue-400">我们的使命</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Dvit Golf 致力于为高尔夫爱好者提供最先进的模块化推杆系统。我们相信每位球手都应该拥有完全适合自己的装备，这就是为什么我们开发了革命性的可定制推杆系统。
                </p>
                <p className="text-gray-300 leading-relaxed">
                  通过精密的工程设计和创新的材料科学，我们让每位球手都能根据自己的打球风格和偏好，打造独一无二的推杆。
                </p>
              </div>
              
              <div className="bg-gray-900 p-8 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-blue-400">核心价值</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    创新设计
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    精密制造
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    个性定制
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    卓越品质
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-8 text-blue-400">技术优势</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">模块化设计</h3>
                  <p className="text-gray-300">
                    可更换的面板和配重系统，让您随时调整推杆特性
                  </p>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">精密材料</h3>
                  <p className="text-gray-300">
                    采用航空级铝合金、不锈钢等高品质材料制造
                  </p>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">个性定制</h3>
                  <p className="text-gray-300">
                    根据您的打球习惯和偏好，打造专属的推杆配置
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </PageLayout>
  )
}