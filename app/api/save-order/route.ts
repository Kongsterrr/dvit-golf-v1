import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validatePaymentRequest } from '../../../lib/payment-validation';
import { logSecurityEvent } from '../../../lib/payment-security';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientId = request.headers.get('x-client-id') || 'unknown';
  
  try {
    // 记录请求开始
    logSecurityEvent('order_save_request', {
      clientId,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    const body = await request.json();
    const { 
      paymentIntentId, 
      orderData, 
      shippingAddress, 
      billingAddress,
      totalAmount,
      currency = 'USD'
    } = body;

    // 验证必需字段
    if (!paymentIntentId) {
      logSecurityEvent('order_save_validation_failed', {
        clientId,
        error: 'Missing payment intent ID',
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: '支付意图ID不能为空' },
        { status: 400 }
      );
    }

    if (!orderData) {
      logSecurityEvent('order_save_validation_failed', {
        clientId,
        error: 'Missing order data',
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: '订单数据不能为空' },
        { status: 400 }
      );
    }

    // 验证订单数据
    const validation = validatePaymentRequest(totalAmount, orderData);
    if (!validation.isValid) {
      logSecurityEvent('order_save_validation_failed', {
        clientId,
        error: 'Order validation failed',
        validationErrors: validation.errors,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: validation.errors[0] || '订单数据验证失败' },
        { status: 400 }
      );
    }

    // 检查是否已存在相同的支付意图ID
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('检查现有订单失败:', checkError);
      logSecurityEvent('order_save_database_error', {
        clientId,
        error: 'Failed to check existing order',
        details: checkError.message,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: '数据库查询失败' },
        { status: 500 }
      );
    }

    if (existingOrder) {
      logSecurityEvent('order_save_duplicate_attempt', {
        clientId,
        paymentIntentId,
        existingOrderId: existingOrder.id,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          success: true, 
          orderId: existingOrder.id,
          message: '订单已存在',
          duplicate: true
        },
        { status: 200 }
      );
    }

    // 准备订单数据
    const orderRecord = {
      stripe_payment_intent_id: paymentIntentId,
      total_amount: totalAmount,
      currency: currency.toUpperCase(),
      status: 'completed',
      customer_email: orderData.customerEmail,
      customer_name: orderData.customerName,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      order_items: {
        faceDeck: orderData.faceDeck,
        weightSystem: orderData.weightSystem,
        totalPrice: totalAmount
      },
      metadata: {
        customerPhone: orderData.customerPhone,
        paymentMethod: 'stripe',
        processedAt: new Date().toISOString(),
        clientId: clientId
      }
    };

    // 保存订单到数据库
    const { data: savedOrder, error: saveError } = await supabase
      .from('orders')
      .insert(orderRecord)
      .select()
      .single();

    if (saveError) {
      console.error('保存订单失败:', saveError);
      logSecurityEvent('order_save_failed', {
        clientId,
        paymentIntentId,
        error: saveError.message,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: '保存订单失败: ' + saveError.message },
        { status: 500 }
      );
    }

    // 记录成功保存
    const processingTime = Date.now() - startTime;
    logSecurityEvent('order_save_success', {
      clientId,
      orderId: savedOrder.id,
      paymentIntentId,
      processingTime,
      timestamp: new Date().toISOString()
    });

    console.log('订单保存成功:', {
      orderId: savedOrder.id,
      paymentIntentId,
      customerEmail: orderData.customerEmail,
      totalAmount,
      processingTime
    });

    return NextResponse.json({
      success: true,
      orderId: savedOrder.id,
      message: '订单保存成功',
      processingTime
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('保存订单异常:', error);
    
    logSecurityEvent('order_save_exception', {
      clientId,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}