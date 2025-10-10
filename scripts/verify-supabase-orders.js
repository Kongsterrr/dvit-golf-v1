/**
 * Supabase订单验证脚本
 * 验证订单是否正确保存到数据库
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const verifySupabaseOrders = async () => {
  console.log('🔍 开始验证Supabase订单数据...\n');

  try {
    // 初始化Supabase客户端
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 获取最近的订单
    console.log('📝 查询最近的订单记录...');
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`查询订单失败: ${error.message}`);
    }

    console.log(`✅ 找到 ${orders.length} 个订单记录\n`);

    // 显示订单详情
    orders.forEach((order, index) => {
      console.log(`📦 订单 ${index + 1}:`);
      console.log(`   - ID: ${order.id}`);
      console.log(`   - Stripe Payment Intent: ${order.stripe_payment_intent_id}`);
      console.log(`   - 客户邮箱: ${order.customer_email}`);
      console.log(`   - 客户姓名: ${order.customer_name}`);
      console.log(`   - 总金额: $${(order.total_amount / 100).toFixed(2)}`);
      console.log(`   - 货币: ${order.currency}`);
      console.log(`   - 状态: ${order.status}`);
      console.log(`   - 创建时间: ${new Date(order.created_at).toLocaleString()}`);
      
      if (order.shipping_address) {
        const addr = order.shipping_address;
        console.log(`   - 收货地址: ${addr.line1}, ${addr.city}, ${addr.state} ${addr.postal_code}`);
      }
      
      if (order.order_items) {
        console.log(`   - 订单项: ${JSON.stringify(order.order_items, null, 2)}`);
      }
      
      console.log('');
    });

    // 验证数据完整性
    console.log('🔍 验证数据完整性...');
    let validOrders = 0;
    let issues = [];

    orders.forEach((order, index) => {
      const orderNum = index + 1;
      let isValid = true;

      // 检查必需字段
      if (!order.stripe_payment_intent_id) {
        issues.push(`订单 ${orderNum}: 缺少 Stripe Payment Intent ID`);
        isValid = false;
      }

      if (!order.customer_email) {
        issues.push(`订单 ${orderNum}: 缺少客户邮箱`);
        isValid = false;
      }

      if (!order.total_amount || order.total_amount <= 0) {
        issues.push(`订单 ${orderNum}: 无效的订单金额`);
        isValid = false;
      }

      if (!order.currency) {
        issues.push(`订单 ${orderNum}: 缺少货币信息`);
        isValid = false;
      }

      if (isValid) {
        validOrders++;
      }
    });

    console.log(`✅ 有效订单: ${validOrders}/${orders.length}`);
    
    if (issues.length > 0) {
      console.log('\n⚠️  发现的问题:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ 所有订单数据完整');
    }

    // 统计信息
    console.log('\n📊 统计信息:');
    const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    console.log(`   - 总订单数: ${orders.length}`);
    console.log(`   - 总金额: $${(totalAmount / 100).toFixed(2)}`);
    console.log(`   - 平均订单金额: $${orders.length > 0 ? (totalAmount / orders.length / 100).toFixed(2) : '0.00'}`);

    const statusCounts = orders.reduce((counts, order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
      return counts;
    }, {});

    console.log('   - 订单状态分布:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     * ${status}: ${count}`);
    });

    return {
      success: true,
      totalOrders: orders.length,
      validOrders,
      issues,
      orders: orders.map(order => ({
        id: order.id,
        paymentIntentId: order.stripe_payment_intent_id,
        amount: order.total_amount,
        status: order.status,
        createdAt: order.created_at
      }))
    };

  } catch (error) {
    console.error('❌ Supabase验证失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// 运行验证
if (require.main === module) {
  verifySupabaseOrders().then(result => {
    if (result.success) {
      console.log('\n✅ Supabase验证完成');
      process.exit(0);
    } else {
      console.log('\n❌ Supabase验证失败');
      process.exit(1);
    }
  });
}

module.exports = { verifySupabaseOrders };