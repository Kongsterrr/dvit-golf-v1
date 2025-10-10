require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

async function verifyDataConsistency() {
  console.log('🔍 验证Supabase和Stripe数据一致性...\n');

  try {
    // 获取Supabase订单数据
    const { data: orders, error: supabaseError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (supabaseError) {
      throw new Error(`Supabase查询失败: ${supabaseError.message}`);
    }

    // 获取Stripe Payment Intents
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 20,
      created: {
        gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // 最近30天
      }
    });

    console.log(`📊 数据概览:`);
    console.log(`   - Supabase订单数: ${orders.length}`);
    console.log(`   - Stripe Payment Intent数: ${paymentIntents.data.length}\n`);

    // 检查有Payment Intent ID的订单
    const ordersWithPI = orders.filter(order => order.stripe_payment_intent_id);
    console.log(`🔗 有Stripe Payment Intent ID的订单: ${ordersWithPI.length}/${orders.length}\n`);

    // 验证每个有Payment Intent ID的订单
    const consistencyResults = [];
    
    for (const order of ordersWithPI) {
      console.log(`🔍 验证订单 ${order.id}:`);
      console.log(`   - Stripe PI ID: ${order.stripe_payment_intent_id}`);
      
      try {
        // 从Stripe获取对应的Payment Intent
        const pi = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        
        // 检查金额一致性
        const supabaseAmount = Math.round(parseFloat(order.total_amount) * 100); // 转换为分
        const stripeAmount = pi.amount;
        const amountMatch = supabaseAmount === stripeAmount;
        
        // 检查货币一致性
        const currencyMatch = order.currency.toLowerCase() === pi.currency.toLowerCase();
        
        // 检查客户邮箱一致性
        const emailMatch = order.customer_email === (pi.receipt_email || pi.metadata?.customerEmail);
        
        const result = {
          orderId: order.id,
          paymentIntentId: order.stripe_payment_intent_id,
          amountMatch,
          currencyMatch,
          emailMatch,
          supabaseAmount: supabaseAmount / 100,
          stripeAmount: stripeAmount / 100,
          supabaseCurrency: order.currency,
          stripeCurrency: pi.currency,
          supabaseEmail: order.customer_email,
          stripeEmail: pi.receipt_email || pi.metadata?.customerEmail,
          stripeStatus: pi.status,
          orderStatus: order.status
        };
        
        consistencyResults.push(result);
        
        console.log(`   ✅ 找到对应的Payment Intent`);
        console.log(`   - 金额匹配: ${amountMatch ? '✅' : '❌'} (Supabase: $${result.supabaseAmount}, Stripe: $${result.stripeAmount})`);
        console.log(`   - 货币匹配: ${currencyMatch ? '✅' : '❌'} (Supabase: ${result.supabaseCurrency}, Stripe: ${result.stripeCurrency})`);
        console.log(`   - 邮箱匹配: ${emailMatch ? '✅' : '❌'} (Supabase: ${result.supabaseEmail}, Stripe: ${result.stripeEmail})`);
        console.log(`   - Stripe状态: ${result.stripeStatus}`);
        console.log(`   - 订单状态: ${result.orderStatus}`);
        
      } catch (stripeError) {
        console.log(`   ❌ 无法找到对应的Payment Intent: ${stripeError.message}`);
        consistencyResults.push({
          orderId: order.id,
          paymentIntentId: order.stripe_payment_intent_id,
          error: stripeError.message
        });
      }
      
      console.log('');
    }

    // 生成一致性报告
    console.log('📋 一致性报告:');
    const validResults = consistencyResults.filter(r => !r.error);
    const amountMatches = validResults.filter(r => r.amountMatch).length;
    const currencyMatches = validResults.filter(r => r.currencyMatch).length;
    const emailMatches = validResults.filter(r => r.emailMatch).length;
    
    console.log(`   - 成功验证的订单: ${validResults.length}/${consistencyResults.length}`);
    console.log(`   - 金额一致性: ${amountMatches}/${validResults.length} (${((amountMatches/validResults.length)*100).toFixed(1)}%)`);
    console.log(`   - 货币一致性: ${currencyMatches}/${validResults.length} (${((currencyMatches/validResults.length)*100).toFixed(1)}%)`);
    console.log(`   - 邮箱一致性: ${emailMatches}/${validResults.length} (${((emailMatches/validResults.length)*100).toFixed(1)}%)`);

    // 检查孤立的Payment Intents（在Stripe中存在但在Supabase中没有对应订单）
    console.log('\n🔍 检查孤立的Payment Intents...');
    const supabasePaymentIntentIds = new Set(ordersWithPI.map(o => o.stripe_payment_intent_id));
    const orphanedPIs = paymentIntents.data.filter(pi => !supabasePaymentIntentIds.has(pi.id));
    
    console.log(`   - 孤立的Payment Intents: ${orphanedPIs.length}/${paymentIntents.data.length}`);
    
    if (orphanedPIs.length > 0) {
      console.log('   孤立的Payment Intent列表:');
      orphanedPIs.forEach(pi => {
        console.log(`     * ${pi.id} - $${(pi.amount/100).toFixed(2)} ${pi.currency.toUpperCase()} - ${pi.status}`);
      });
    }

    console.log('\n✅ 数据一致性检查完成');

  } catch (error) {
    console.error('❌ 数据一致性检查失败:', error.message);
  }
}

verifyDataConsistency();