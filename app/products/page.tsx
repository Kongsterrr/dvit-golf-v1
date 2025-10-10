'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
import { useCart } from '../../contexts/CartContext'
import { ShoppingCart, Plus } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  subcategory?: string
  base_price: number
  description: string
  is_default: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { addItem, openCart } = useCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, base_price, category, subcategory, is_default')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('获取产品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { key: 'all', name: '全部产品' },
    { key: 'putter', name: '推杆主体' },
    { key: 'face_deck', name: '面板系统' },
    { key: 'weight_system', name: '配重系统' }
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)

  const formatPrice = (price: number) => {
    return price === 0 ? '免费' : `$${price}`
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: '/placeholder-product.jpg'
    })
    openCart()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>加载产品中...</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <main>
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">
              产品<span className="text-blue-400">系列</span>
            </h1>
            
            <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
              探索我们的模块化推杆系统，每个组件都经过精心设计，为您提供最佳的高尔夫体验
            </p>

            {/* 分类筛选 */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* 产品网格 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      {product.is_default && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          默认
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 mb-4 capitalize">
                      {(product.subcategory || product.category).replace('_', ' ')}
                    </p>
                    
                    {product.description && (
                      <p className="text-gray-300 mb-4 text-sm">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-400">
                        {formatPrice(product.base_price)}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          加入购物车
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">该分类下暂无产品</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </PageLayout>
  )
}