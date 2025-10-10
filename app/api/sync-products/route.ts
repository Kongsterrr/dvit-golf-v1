import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 开始同步产品数据...');

    // 产品数据
    const products = [
      // 1. 基础产品 - Dvit Modular Putter
      {
        stripe_product_id: 'prod_TC1tVw61VJFBX5',
        stripe_price_id: 'price_1SFdpl6LJHHneEe1HREAKHbM',
        name: 'Dvit Modular Putter',
        description: '高端模块化高尔夫推杆，支持多种材质和配重系统定制',
        category: 'putter',
        subcategory: 'base',
        base_price: 89900,
        is_default: true,
        is_active: true,
        sort_order: 1,
        metadata: { stripe_created: 1759854830, type: 'base_product' }
      },
      // 2. Face Deck - 6061铝合金 (默认选项，免费)
      {
        stripe_product_id: 'prod_TC1ti9WNHjBTQF',
        stripe_price_id: 'price_1SFdpv6LJHHneEe166IPPBJv',
        name: 'Face Deck - 6061铝合金',
        description: '6061铝合金Face Deck，轻量化设计，优异的手感',
        category: 'face_deck',
        subcategory: 'aluminum',
        base_price: 0,
        is_default: true,
        is_active: true,
        sort_order: 2,
        metadata: { stripe_created: 1759854838, material: '6061_aluminum', weight: 'light', feel: 'excellent' }
      },
      // 3. Face Deck - 铜合金 (+$150)
      {
        stripe_product_id: 'prod_TC1tbUBf8DcjCk',
        stripe_price_id: 'price_1SFdq56LJHHneEe1xpVvEJry',
        name: 'Face Deck - 铜合金',
        description: '铜合金Face Deck，经典材质，卓越的击球感受',
        category: 'face_deck',
        subcategory: 'copper',
        base_price: 15000,
        is_default: false,
        is_active: true,
        sort_order: 3,
        metadata: { stripe_created: 1759854847, material: 'copper_alloy', weight: 'medium', feel: 'classic' }
      },
      // 4. Face Deck - 303不锈钢 (+$120)
      {
        stripe_product_id: 'prod_TC1tqw8ceOuvs0',
        stripe_price_id: 'price_1SFdqD6LJHHneEe1Lzh6f5Vu',
        name: 'Face Deck - 303不锈钢',
        description: '303不锈钢Face Deck，耐用性强，专业级选择',
        category: 'face_deck',
        subcategory: 'stainless_steel',
        base_price: 12000,
        is_default: false,
        is_active: true,
        sort_order: 4,
        metadata: { stripe_created: 1759854857, material: '303_stainless_steel', weight: 'medium', durability: 'high' }
      },
      // 5. Face Deck - 聚合物 (+$80)
      {
        stripe_product_id: 'prod_TC1uKY3ZYyFruH',
        stripe_price_id: 'price_1SFdqL6LJHHneEe1ikMMBEX1',
        name: 'Face Deck - 聚合物',
        description: '聚合物Face Deck，创新材质，独特的击球体验',
        category: 'face_deck',
        subcategory: 'polymer',
        base_price: 8000,
        is_default: false,
        is_active: true,
        sort_order: 5,
        metadata: { stripe_created: 1759854865, material: 'polymer', weight: 'light', innovation: 'high' }
      },
      // 6. 配重系统 - Long Wing (默认选项，免费)
      {
        stripe_product_id: 'prod_TC1uBfM8eAQCR6',
        stripe_price_id: 'price_1SFdqU6LJHHneEe1xHi5akIw',
        name: '配重系统 - Long Wing',
        description: 'Long Wing配重系统，提供更大的稳定性和惯性矩',
        category: 'weight_system',
        subcategory: 'long_wing',
        base_price: 0,
        is_default: true,
        is_active: true,
        sort_order: 6,
        metadata: { stripe_created: 1759854874, wing_type: 'long', stability: 'high', moi: 'high' }
      },
      // 7. 配重系统 - Short Wing (+$50)
      {
        stripe_product_id: 'prod_TC1uxe6VcQ5oCd',
        stripe_price_id: 'price_1SFdqc6LJHHneEe1y7pViXw2',
        name: '配重系统 - Short Wing',
        description: 'Short Wing配重系统，更灵活的操控性和精准度',
        category: 'weight_system',
        subcategory: 'short_wing',
        base_price: 5000,
        is_default: false,
        is_active: true,
        sort_order: 7,
        metadata: { stripe_created: 1759854882, wing_type: 'short', control: 'high', precision: 'high' }
      }
    ];

    // 使用 upsert 插入或更新产品数据
    const { data, error } = await supabaseAdmin
      .from('products')
      .upsert(products, { 
        onConflict: 'stripe_product_id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ 产品同步失败:', error);
      return NextResponse.json({
        success: false,
        error: '产品同步失败',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ 产品同步成功，共同步', data?.length || 0, '个产品');

    // 获取同步后的产品数据进行验证
    const { data: allProducts, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('category, sort_order');

    if (fetchError) {
      console.error('❌ 获取产品数据失败:', fetchError);
    }

    return NextResponse.json({
      success: true,
      message: '产品数据同步成功',
      syncedCount: data?.length || 0,
      products: allProducts || []
    });

  } catch (error) {
    console.error('❌ 产品同步API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// GET 方法用于检查产品同步状态
export async function GET() {
  try {
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('category, sort_order');

    if (error) {
      return NextResponse.json({
        success: false,
        error: '获取产品数据失败',
        details: error.message
      }, { status: 500 });
    }

    const productsByCategory = {
      putter: products.filter(p => p.category === 'putter'),
      face_deck: products.filter(p => p.category === 'face_deck'),
      weight_system: products.filter(p => p.category === 'weight_system')
    };

    return NextResponse.json({
      success: true,
      totalProducts: products.length,
      productsByCategory,
      allProducts: products
    });

  } catch (error) {
    console.error('❌ 获取产品状态错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}