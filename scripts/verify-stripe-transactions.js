require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function verifyStripeTransactions() {
  console.log('🔍 验证Stripe交易记录...\n');

  try {
    // 获取最近的Payment Intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 10,
      created: {
        gte: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60) // 最近7天
      }
    });

    console.log(`📊 找到 ${paymentIntents.data.length} 个Payment Intent记录:\n`);

    paymentIntents.data.forEach((pi, index) => {
      console.log(`💳 Payment Intent ${index + 1}:`);
      console.log(`   - ID: ${pi.id}`);
      console.log(`   - 金额: $${(pi.amount / 100).toFixed(2)} ${pi.currency.toUpperCase()}`);
      console.log(`   - 状态: ${pi.status}`);
      console.log(`   - 客户邮箱: ${pi.receipt_email || '未设置'}`);
      console.log(`   - 创建时间: ${new Date(pi.created * 1000).toLocaleString('zh-CN')}`);
      console.log(`   - 描述: ${pi.description || '无描述'}`);
      
      if (pi.metadata && Object.keys(pi.metadata).length > 0) {
        console.log(`   - 元数据: ${JSON.stringify(pi.metadata, null, 2)}`);
      }
      
      if (pi.charges && pi.charges.data.length > 0) {
        const charge = pi.charges.data[0];
        console.log(`   - 收费状态: ${charge.status}`);
        console.log(`   - 收费ID: ${charge.id}`);
      }
      console.log('');
    });

    // 统计信息
    const successfulPayments = paymentIntents.data.filter(pi => pi.status === 'succeeded');
    const totalAmount = successfulPayments.reduce((sum, pi) => sum + pi.amount, 0);

    console.log('📈 统计信息:');
    console.log(`   - 总Payment Intent数: ${paymentIntents.data.length}`);
    console.log(`   - 成功支付数: ${successfulPayments.length}`);
    console.log(`   - 成功支付总金额: $${(totalAmount / 100).toFixed(2)}`);
    
    if (successfulPayments.length > 0) {
      console.log(`   - 平均支付金额: $${(totalAmount / successfulPayments.length / 100).toFixed(2)}`);
    }

    // 状态分布
    const statusCounts = {};
    paymentIntents.data.forEach(pi => {
      statusCounts[pi.status] = (statusCounts[pi.status] || 0) + 1;
    });

    console.log('   - 状态分布:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     * ${status}: ${count}`);
    });

    console.log('\n✅ Stripe验证完成');

  } catch (error) {
    console.error('❌ Stripe验证失败:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('🔑 认证错误: 请检查STRIPE_SECRET_KEY是否正确设置');
    } else if (error.type === 'StripeConnectionError') {
      console.error('🌐 连接错误: 请检查网络连接');
    }
  }
}

verifyStripeTransactions();