import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供有效的认证令牌' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // 使用Supabase验证JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 获取用户订单
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_snapshot
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('获取订单失败:', ordersError);
      return NextResponse.json(
        { error: '获取订单失败' },
        { status: 500 }
      );
    }

    // 格式化订单数据
    const formattedOrders = orders?.map(order => ({
      id: order.id,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      items: order.order_items || []
    })) || [];

    return NextResponse.json({
      orders: formattedOrders
    });

  } catch (error) {
    console.error('获取用户订单时发生错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}