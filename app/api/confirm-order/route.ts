import { NextRequest, NextResponse } from 'next/server';

// 订单项接口
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  customization?: {
    faceDeck?: string;
    weightSystem?: string;
  };
}

// 请求体接口
interface ConfirmOrderRequest {
  customerName: string;
  customerEmail: string;
  orderId: string;
  totalPrice: number;
  orderDate?: string;
  orderItems?: OrderItem[];
  faceDeck?: string;
  weightSystem?: string;
  skipOrderCreation?: boolean; // 新增：是否跳过订单创建，只发送邮件
  paymentIntentId?: string; // 新增：支付意图ID
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmOrderRequest = await request.json();
    
    // 验证必需字段
    const { customerName, customerEmail, orderId, totalPrice } = body;
    
    if (!customerName || !customerEmail || !orderId || !totalPrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少必需的订单信息' 
        },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '邮箱格式不正确' 
        },
        { status: 400 }
      );
    }

    // 验证价格
    if (totalPrice <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '订单金额必须大于0' 
        },
        { status: 400 }
      );
    }

    console.log('📋 处理订单确认请求:', {
      orderId,
      customerEmail,
      itemCount: body.orderItems?.length || 1,
      totalPrice
    });

    // 直接创建Supabase客户端
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ 缺少Supabase环境变量');
      return NextResponse.json({
        success: false,
        error: '服务器配置错误',
        details: process.env.NODE_ENV === 'development' ? 'Missing Supabase environment variables' : undefined
      }, { status: 500 });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // 检查是否已存在相同的订单（基于paymentIntentId或customerEmail+totalPrice组合）
    let existingOrder = null;
    
    // 首先尝试通过paymentIntentId查找
    if (body.paymentIntentId) {
      const { data: orderByPaymentIntent, error: checkError1 } = await supabaseAdmin
        .from('orders')
        .select('id, status, created_at')
        .eq('stripe_payment_intent_id', body.paymentIntentId)
        .single();
        
      if (!checkError1 || checkError1.code !== 'PGRST116') {
        existingOrder = orderByPaymentIntent;
      }
    }
    
    // 如果没有找到，再尝试通过客户邮箱和金额查找（防止重复提交）
    if (!existingOrder) {
      const { data: orderByEmailAmount, error: checkError2 } = await supabaseAdmin
        .from('orders')
        .select('id, status, created_at')
        .eq('customer_email', customerEmail)
        .eq('total_amount', totalPrice)
        .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10分钟内
        .single();
        
      if (!checkError2 || checkError2.code !== 'PGRST116') {
        existingOrder = orderByEmailAmount;
      }
    }
    
    // 如果设置了skipOrderCreation，跳过订单创建和重复检查，直接发送邮件
    if (body.skipOrderCreation) {
      console.log('📧 跳过订单创建，仅发送确认邮件');
      
      // 发送确认邮件
      try {
        const { sendOrderConfirmationEmail } = await import('../../../lib/email');
        
        const orderData = {
          orderId: orderId, // 使用传入的orderId
          customerName,
          customerEmail,
          totalPrice,
          orderItems: body.orderItems || [{
            name: 'Dvit Golf Modular Putter',
            quantity: 1,
            price: totalPrice,
            customization: {
              faceDeck: body.faceDeck,
              weightSystem: body.weightSystem
            }
          }],
          orderDate: body.orderDate || new Date().toISOString()
        };

        await sendOrderConfirmationEmail(orderData);
        console.log('✅ 确认邮件发送成功');

        return NextResponse.json({
          success: true,
          orderId: orderId,
          message: '确认邮件已发送',
          emailOnly: true
        });
      } catch (emailError) {
        console.error('❌ 邮件发送失败:', emailError);
        return NextResponse.json({
          success: false,
          error: '邮件发送失败',
          details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        }, { status: 500 });
      }
    }

    if (existingOrder) {
      console.log('🔄 发现重复订单，检查邮件发送状态:', existingOrder.id);
      
      // 检查该订单是否已发送确认邮件
      try {
        const { sendOrderConfirmationEmail } = await import('../../../lib/email');
        
        const orderData = {
          orderId: existingOrder.id,
          customerName,
          customerEmail,
          totalPrice,
          orderItems: body.orderItems || [{
            name: 'Dvit Golf Modular Putter',
            quantity: 1,
            price: totalPrice,
            customization: {
              faceDeck: body.faceDeck,
              weightSystem: body.weightSystem
            }
          }],
          orderDate: body.orderDate || new Date().toISOString(),
          faceDeck: body.faceDeck,
          weightSystem: body.weightSystem
        };
        
        // sendOrderConfirmationEmail 内部会检查是否已发送过邮件
        await sendOrderConfirmationEmail(orderData);
        console.log('✅ 重复订单的邮件检查和发送完成');
        
      } catch (emailError) {
        console.error('⚠️ 重复订单邮件处理失败:', emailError);
        // 不因为邮件发送失败而让整个请求失败
      }
      
      return NextResponse.json({
        success: true,
        dbOrderId: existingOrder.id,
        originalOrderId: orderId,
        message: '订单已存在，已检查邮件发送状态',
        duplicate: true
      });
    }
    
    // 生成UUID格式的订单ID
    let provisionalId: string | null = null;
    if (!body.paymentIntentId) {
      const { randomUUID } = await import('crypto');
      provisionalId = randomUUID();
    }
    
    // 准备订单数据
    const orderData_db = {
      id: provisionalId || undefined,
      stripe_payment_intent_id: body.paymentIntentId || null,
      customer_email: customerEmail,
      customer_name: customerName,
      total_amount: totalPrice,
      currency: 'USD',
      status: 'processing',
      order_items: body.orderItems || [{
        name: 'Dvit Golf Modular Putter',
        quantity: 1,
        price: totalPrice,
        customization: {
          faceDeck: body.faceDeck,
          weightSystem: body.weightSystem
        }
      }],
      metadata: {
        faceDeck: body.faceDeck,
        weightSystem: body.weightSystem,
        orderDate: body.orderDate || new Date().toISOString()
      }
    };

    // 插入/更新订单（基于 PI 幂等）
    const { data: orderRecord, error: orderError } = await supabaseAdmin
      .from('orders')
      .upsert([orderData_db], { onConflict: 'stripe_payment_intent_id' })
      .select()
      .single();

    if (orderError) {
      console.error('❌ 订单保存到数据库失败:', orderError);
      return NextResponse.json({
        success: false,
        error: '订单保存失败',
        details: process.env.NODE_ENV === 'development' ? orderError.message : undefined
      }, { status: 500 });
    }

    console.log('✅ 订单已保存到数据库:', orderRecord.id);
    
    // 发送确认邮件
    try {
      const { sendOrderConfirmationEmail } = await import('../../../lib/email');
      
      const orderData = {
        orderId: orderRecord.id,
        customerName,
        customerEmail,
        totalPrice,
        orderItems: body.orderItems || [{
          name: 'Dvit Golf Modular Putter',
          quantity: 1,
          price: totalPrice,
          customization: {
            faceDeck: body.faceDeck,
            weightSystem: body.weightSystem
          }
        }],
        orderDate: body.orderDate || new Date().toISOString(),
        faceDeck: body.faceDeck,
        weightSystem: body.weightSystem
      };
      
      await sendOrderConfirmationEmail(orderData);
      console.log('✅ 确认邮件已发送');
      
    } catch (emailError) {
      console.error('⚠️ 邮件发送失败，但订单已保存:', emailError);
      // 不因为邮件发送失败而让整个请求失败
    }
    
    return NextResponse.json({
      success: true,
      message: '订单确认成功，已保存到数据库并发送确认邮件',
      orderId: orderRecord.id,
      originalOrderId: orderId,
    });

  } catch (error) {
    console.error('❌ 订单确认处理失败:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// 处理 GET 请求（健康检查）
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Confirm Order API 运行正常',
    timestamp: new Date().toISOString()
  });
}