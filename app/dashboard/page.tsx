'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PageLayout from '../../components/PageLayout'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  order_items: {
    product_name: string
    quantity: number
    price: number
  }[]
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }
    
    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            price
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '待处理',
      'confirmed': '已确认',
      'processing': '处理中',
      'shipped': '已发货',
      'delivered': '已送达',
      'cancelled': '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-600',
      'confirmed': 'bg-blue-600',
      'processing': 'bg-purple-600',
      'shipped': 'bg-green-600',
      'delivered': 'bg-green-700',
      'cancelled': 'bg-red-600'
    }
    return colorMap[status] || 'bg-gray-600'
  }

  if (authLoading || loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">加载中...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!user) {
    return null
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
            <h1 className="text-4xl md:text-6xl font-bold mb-8">
              欢迎回来，<span className="text-blue-400">{user.name}</span>
            </h1>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-blue-400">总订单数</h3>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-blue-400">待处理订单</h3>
                <p className="text-3xl font-bold">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-blue-400">总消费金额</h3>
                <p className="text-3xl font-bold">
                  ¥{orders.reduce((sum, order) => sum + order.total_amount, 0)}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-blue-400">我的订单</h2>
            
            {orders.length === 0 ? (
              <div className="bg-gray-900 p-8 rounded-lg text-center">
                <p className="text-gray-400 mb-4">您还没有任何订单</p>
                <button
                  onClick={() => router.push('/customize')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  开始定制
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-900 p-6 rounded-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-2">
                          订单 #{order.id.slice(-8)}
                        </h3>
                        <p className="text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-xl font-bold text-blue-400">
                          ¥{order.total_amount}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="font-medium mb-2">订单详情:</h4>
                      <div className="space-y-2">
                        {order.order_items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between text-sm text-gray-300">
                            <span>{item.product_name} x {item.quantity}</span>
                            <span>¥{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </PageLayout>
  )
}