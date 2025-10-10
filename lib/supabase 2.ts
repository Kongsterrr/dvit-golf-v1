import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('缺少 Supabase 配置信息。请检查环境变量 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
}

// 创建 Supabase 客户端（服务端使用）
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 订单数据类型定义
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  customization?: {
    faceDeck?: string;
    weightSystem?: string;
  };
}

export interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  faceDeck: string;
  weightSystem: string;
  totalPrice: number;
  paymentIntentId: string;
  orderDate?: string;
  shippingAddress?: any;
  billingAddress?: any;
  currency?: string;
  orderItems?: OrderItem[];
}

// 保存订单到数据库
export async function saveOrderToDatabase(orderData: OrderData) {
  try {
    console.log('🔄 开始保存订单到数据库...', { orderId: orderData.orderId });

    // 准备订单数据 - 让数据库自动生成UUID，不使用传入的orderId
    const orderRecord = {
      stripe_payment_intent_id: orderData.paymentIntentId,
      customer_email: orderData.customerEmail,
      customer_name: orderData.customerName,
      total_amount: orderData.totalPrice,
      currency: orderData.currency || 'usd',
      status: 'completed',
      shipping_address: orderData.shippingAddress || {},
      billing_address: orderData.billingAddress || {},
      order_items: {
        faceDeck: orderData.faceDeck,
        weightSystem: orderData.weightSystem
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 插入订单记录
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderRecord)
      .select()
      .single();

    if (orderError) {
      console.error('❌ 订单插入失败:', orderError);
      throw new Error(`订单插入失败: ${orderError.message}`);
    }

    console.log('✅ 订单保存成功:', order.id);

    // 准备订单项数据 - 使用数据库生成的订单ID
    const orderItemsToInsert = [];
    
    // 如果有新的orderItems结构，使用它
    if (orderData.orderItems && orderData.orderItems.length > 0) {
      orderData.orderItems.forEach(item => {
        orderItemsToInsert.push({
          order_id: order.id,
          quantity: item.quantity,
          unit_price: Math.round(item.price * 100), // 转换为分
          total_price: Math.round(item.price * item.quantity * 100), // 转换为分
          product_snapshot: {
            name: item.name,
            customization: item.customization || {}
          },
          created_at: new Date().toISOString()
        });
      });
    } else {
      // 向后兼容：使用旧的faceDeck和weightSystem结构
      // 添加面板配置
      if (orderData.faceDeck && orderData.faceDeck !== 'standard') {
        orderItemsToInsert.push({
          order_id: order.id,
          quantity: 1,
          unit_price: 0, // 暂时设为0，后续可以从产品表获取
          total_price: 0,
          product_snapshot: {
            type: 'face_deck',
            configuration: orderData.faceDeck
          },
          created_at: new Date().toISOString()
        });
      }

      // 添加重量系统配置
      if (orderData.weightSystem && orderData.weightSystem !== 'standard') {
        orderItemsToInsert.push({
          order_id: order.id,
          quantity: 1,
          unit_price: 0, // 暂时设为0，后续可以从产品表获取
          total_price: 0,
          product_snapshot: {
            type: 'weight_system',
            configuration: orderData.weightSystem
          },
          created_at: new Date().toISOString()
        });
      }
    }

    // 插入订单项（如果有配置项）
    if (orderItemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) {
        console.error('❌ 订单项插入失败:', itemsError);
        // 不抛出错误，因为主订单已经保存成功
        console.warn('⚠️ 订单项保存失败，但主订单已保存');
      } else {
        console.log('✅ 订单项保存成功:', orderItemsToInsert.length, '项');
      }
    }

    // 记录邮件日志 - 使用数据库生成的订单ID
    try {
      await supabase
        .from('email_logs')
        .insert({
          recipient_email: orderData.customerEmail,
          email_type: 'order_confirmation',
          order_id: order.id,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      console.log('✅ 邮件日志记录成功');
    } catch (emailLogError) {
      console.warn('⚠️ 邮件日志记录失败:', emailLogError);
    }

    return {
      success: true,
      orderId: order.id,
      message: '订单保存成功'
    };

  } catch (error) {
    console.error('❌ 保存订单到数据库失败:', error);
    throw error;
  }
}

// 获取订单详情
export async function getOrderById(orderId: string) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      throw new Error(`获取订单失败: ${error.message}`);
    }

    return order;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    throw error;
  }
}

// 更新订单状态
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`更新订单状态失败: ${error.message}`);
    }

    console.log('✅ 订单状态更新成功:', { orderId, status });
    return data;
  } catch (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }
}