import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      console.error('❌ Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🔔 Stripe webhook received:', event.type);

    // 处理不同的事件类型
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook处理错误:', error);
    return NextResponse.json(
      { error: 'Webhook处理失败' },
      { status: 500 }
    );
  }
}

// 处理支付成功
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('✅ 支付成功:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.orderId;
    
    if (!orderId) {
      console.error('❌ Payment Intent缺少orderId metadata');
      return;
    }

    // 更新订单状态为已支付
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('❌ 更新订单状态失败:', error);
      return;
    }

    console.log('✅ 订单状态已更新为已支付:', order.id);

    // 这里可以添加其他业务逻辑，比如：
    // - 发送支付确认邮件
    // - 通知库存系统
    // - 启动生产流程等

  } catch (error) {
    console.error('❌ 处理支付成功事件失败:', error);
  }
}

// 处理支付失败
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('❌ 支付失败:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.orderId;
    
    if (!orderId) {
      console.error('❌ Payment Intent缺少orderId metadata');
      return;
    }

    // 更新订单状态为支付失败
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'payment_failed',
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('❌ 更新订单状态失败:', error);
      return;
    }

    console.log('✅ 订单状态已更新为支付失败:', orderId);

  } catch (error) {
    console.error('❌ 处理支付失败事件失败:', error);
  }
}

// 处理支付取消
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('🚫 支付取消:', paymentIntent.id);

    const orderId = paymentIntent.metadata?.orderId;
    
    if (!orderId) {
      console.error('❌ Payment Intent缺少orderId metadata');
      return;
    }

    // 更新订单状态为已取消
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('❌ 更新订单状态失败:', error);
      return;
    }

    console.log('✅ 订单状态已更新为已取消:', orderId);

  } catch (error) {
    console.error('❌ 处理支付取消事件失败:', error);
  }
}