import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { 
  validatePaymentRequest, 
  generateOrderId, 
  formatAmountForStripe 
} from '../../../lib/payment-validation';
import {
  checkRateLimit,
  generateClientIdentifier,
  validateRequestHeaders,
  isConnectionSecure,
  createSecureErrorResponse,
  sanitizeForLogging
} from '../../../lib/payment-security';

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 安全检查：连接安全性
    if (!isConnectionSecure(request)) {
      console.warn(`[${requestId}] 不安全的连接尝试`);
      return createSecureErrorResponse('需要安全连接', 400);
    }

    // 安全检查：请求头验证
    const headerValidation = validateRequestHeaders(request);
    if (!headerValidation.valid) {
      console.warn(`[${requestId}] 请求头验证失败:`, headerValidation.errors);
      return createSecureErrorResponse('请求格式不正确', 400);
    }

    // 安全检查：频率限制
    const clientId = generateClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId);
    if (!rateLimit.allowed) {
      console.warn(`[${requestId}] 频率限制触发:`, { clientId, resetTime: rateLimit.resetTime });
      return createSecureErrorResponse('请求过于频繁，请稍后再试', 429);
    }

    console.log(`[${requestId}] 开始处理支付意图创建请求`);
    
    // 检查Stripe密钥配置
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isDemoMode = !stripeSecretKey || stripeSecretKey === 'sk_test_51234567890abcdef';
    
    if (isDemoMode) {
      // 演示模式：返回模拟的支付意图，不包含clientSecret
      console.log(`[${requestId}] 运行在演示模式下 - Stripe密钥未配置`);
      return NextResponse.json({
        demoMode: true,
        paymentIntentId: 'pi_demo_1234567890',
        message: '演示模式：无需真实支付处理'
      });
    }

    const body = await request.json();
    const { amount, currency = 'usd', orderData } = body;
    
    console.log(`[${requestId}] 请求参数:`, sanitizeForLogging({
      amount,
      currency,
      customerName: orderData?.customerName,
      customerEmail: orderData?.customerEmail,
      clientId
    }));

    // 使用验证函数进行综合验证
    const validation = validatePaymentRequest(amount, orderData);
    
    if (!validation.isValid) {
      console.log(`[${requestId}] 验证失败:`, validation.errors);
      return NextResponse.json(
        { error: validation.errors[0] || '请求参数验证失败' },
        { status: 400 }
      );
    }

    // 记录警告信息
    if (validation.warnings.length > 0) {
      console.warn(`[${requestId}] 验证警告:`, validation.warnings);
    }

    // 生成订单ID
    const orderId = generateOrderId();
    
    // 创建支付意图
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: formatAmountForStripe(amount), // 使用格式化函数转换为分
        currency: currency || 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone || '',
          streetAddress: orderData.shippingAddress?.address || '',
          city: orderData.shippingAddress?.city || '',
          state: orderData.shippingAddress?.state || '',
          zipCode: orderData.shippingAddress?.zipCode || '',
          country: orderData.shippingAddress?.country || 'US',
          faceDeck: JSON.stringify(orderData.faceDeck),
          weightSystem: JSON.stringify(orderData.weightSystem),
          originalAmount: amount.toString(),
        },
        receipt_email: orderData.customerEmail,
        description: `Dvit Golf 定制推杆 - ${typeof orderData.faceDeck === 'object' && orderData.faceDeck?.name ? orderData.faceDeck.name : orderData.faceDeck} - ${typeof orderData.weightSystem === 'object' && orderData.weightSystem?.name ? orderData.weightSystem.name : orderData.weightSystem}`,
      });
    } catch (stripeError: any) {
      console.error(`[${requestId}] Stripe API 错误:`, stripeError);
      
      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json(
          { error: '支付卡信息有误，请检查后重试' },
          { status: 400 }
        );
      } else if (stripeError.type === 'StripeRateLimitError') {
        return NextResponse.json(
          { error: '请求过于频繁，请稍后重试' },
          { status: 429 }
        );
      } else if (stripeError.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: '请求参数有误，请检查订单信息' },
          { status: 400 }
        );
      } else if (stripeError.type === 'StripeAPIError') {
        return NextResponse.json(
          { error: '支付服务暂时不可用，请稍后重试' },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          { error: '创建支付意图失败，请重试' },
          { status: 500 }
        );
      }
    }

    console.log(`[${requestId}] 支付意图创建成功:`, {
      paymentIntentId: paymentIntent.id,
      orderId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customerEmail: orderData.customerEmail,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency,
    });
  } catch (error: any) {
    console.error(`[${requestId}] 创建支付意图失败:`, error);
    
    const errorResponse = {
      error: '创建支付意图失败，请重试',
      details: {
        requestId,
        timestamp: new Date().toISOString(),
        errorType: error.name || 'UnknownError',
        message: error.message || '未知错误'
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}