import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

// GET /api/orders - 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    const supabase = supabaseAdmin;

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // 根据邮箱筛选
    if (email) {
      query = query.eq('customer_email', email);
    }

    // 根据订单ID筛选
    if (orderId) {
      query = query.eq('id', orderId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('❌ 查询订单失败:', error);
      return NextResponse.json({
        success: false,
        error: '查询订单失败',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    });

  } catch (error) {
    console.error('❌ 订单查询API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// POST /api/orders - 创建新订单（可选，主要通过confirm-order创建）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      customerName,
      customerEmail,
      totalAmount,
      orderItems,
      metadata
    } = body;

    // 验证必需字段
    if (!customerName || !customerEmail || !totalAmount) {
      return NextResponse.json({
        success: false,
        error: '缺少必需字段'
      }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // 生成订单ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderData = {
      id: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      total_amount: totalAmount,
      currency: 'USD',
      status: 'pending',
      order_items: orderItems || [],
      metadata: metadata || {}
    };

    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('❌ 创建订单失败:', error);
      return NextResponse.json({
        success: false,
        error: '创建订单失败',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order,
      orderId: order.id
    });

  } catch (error) {
    console.error('❌ 创建订单API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}