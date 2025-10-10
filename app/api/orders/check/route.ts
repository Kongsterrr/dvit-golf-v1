import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: '缺少支付意图ID' },
        { status: 400 }
      );
    }

    // 检查是否存在相同的支付意图ID的订单
    const { data: existingOrder, error } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('检查订单失败:', error);
      return NextResponse.json(
        { error: '数据库查询失败' },
        { status: 500 }
      );
    }

    if (existingOrder) {
      return NextResponse.json({
        exists: true,
        orderId: existingOrder.id,
        status: existingOrder.status,
        createdAt: existingOrder.created_at
      });
    } else {
      return NextResponse.json({
        exists: false
      });
    }

  } catch (error) {
    console.error('检查订单异常:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}