import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 获取所有产品数据
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('category, sort_order');

    if (error) {
      console.error('获取产品数据失败:', error);
      return NextResponse.json(
        { error: '获取产品数据失败' },
        { status: 500 }
      );
    }

    // 按类别组织产品数据
    const organizedProducts = {
      putter: products.find(p => p.category === 'putter'),
      faceDecks: products.filter(p => p.category === 'face_deck'),
      weightSystems: products.filter(p => p.category === 'weight_system'),
    };

    return NextResponse.json({
      success: true,
      products: organizedProducts,
      allProducts: products,
    });

  } catch (error) {
    console.error('产品API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}