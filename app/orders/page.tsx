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
  shipping_address: string
  order_items: {
    id: string
    product_name: string
    quantity: number
    price: number
    customization_details: any
  }[]
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
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
            id,
            product_name,
            quantity,
            price,
            customization_details
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>加载订单中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <PageLayout className="text-white">
      <main>
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-8">
              我的<span className="text-blue-400">订单</span>
            </h1>
            
            {orders.length === 0 ? (
              <div className="bg-gray-900 p-12 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">暂无订单</h2>
                <p className="text-gray-400 mb-6">您还没有任何订单记录</p>
                <button
                  onClick={() => router.push('/customize')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
                >
                  开始定制推杆
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
                    className="bg-gray-900 rounded-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold mb-2">
                            订单号: #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-gray-400 mb-2">
                            下单时间: {formatDate(order.created_at)}
                          </p>
                          {order.shipping_address && (
                            <p className="text-gray-400 text-sm">
                              配送地址: {order.shipping_address}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-start lg:items-end gap-3 mt-4 lg:mt-0">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-2xl font-bold text-blue-400">
                            ${order.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-6">
                        <h4 className="font-bold mb-4 text-blue-400">订单商品</h4>
                        <div className="space-y-4">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium">{item.product_name}</h5>
                                <span className="text-blue-400 font-bold">
                                  ${(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">
                                数量: {item.quantity}
                              </p>
                              {item.customization_details && (
                                <div className="text-sm text-gray-300">
                                  <p className="font-medium mb-1">定制详情:</p>
                                  <pre className="bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(item.customization_details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          {selectedOrder?.id === order.id ? '收起详情' : '查看详情'}
                        </button>
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