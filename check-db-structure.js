const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkTables() {
  console.log('🔍 检查数据库表结构...');
  
  // 检查users表
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (usersError) {
    console.log('❌ users表错误:', usersError.message);
  } else {
    console.log('✅ users表存在，示例数据:', users);
  }
  
  // 检查auth.users表
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 5 });
    if (authError) {
      console.log('❌ auth.users错误:', authError.message);
    } else {
      console.log('✅ auth.users表存在，用户数量:', authUsers.users.length);
      if (authUsers.users.length > 0) {
        console.log('最新用户:');
        authUsers.users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} - 验证状态: ${!!user.email_confirmed_at}`);
        });
      }
    }
  } catch (e) {
    console.log('❌ auth.users检查失败:', e.message);
  }
}

checkTables().catch(console.error);