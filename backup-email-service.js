// 备用邮件发送服务 - 直接使用nodemailer发送验证邮件
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 生成验证链接
function generateVerificationLink(userId, email) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const token = Buffer.from(JSON.stringify({ userId, email, timestamp: Date.now() })).toString('base64');
  return `${baseUrl}/api/auth/verify-custom-email?token=${token}`;
}

// 发送验证邮件
async function sendVerificationEmail(email, verificationLink) {
  const mailOptions = {
    from: `"Dvit Golf" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '验证您的Dvit Golf账户',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f8f9fa; }
          .button { 
            display: inline-block; 
            background: #3182ce; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏌️ Dvit Golf</h1>
            <p>欢迎加入我们的高尔夫社区</p>
          </div>
          
          <div class="content">
            <h2>验证您的邮箱地址</h2>
            <p>感谢您注册Dvit Golf账户！</p>
            <p>为了确保账户安全，请点击下面的按钮验证您的邮箱地址：</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">验证邮箱</a>
            </div>
            
            <p>如果按钮无法点击，请复制以下链接到浏览器中打开：</p>
            <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 5px;">
              ${verificationLink}
            </p>
            
            <p><strong>注意：</strong>此验证链接将在24小时后过期。</p>
          </div>
          
          <div class="footer">
            <p>如果您没有注册Dvit Golf账户，请忽略此邮件。</p>
            <p>© 2024 Dvit Golf. 保留所有权利。</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ 验证邮件发送成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ 验证邮件发送失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 手动发送验证邮件给未验证用户
async function sendVerificationToUnverifiedUsers() {
  console.log('📧 备用邮件发送服务\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // 获取未验证的用户
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ 获取用户列表失败:', usersError.message);
      return;
    }
    
    const unverifiedUsers = users.users.filter(user => !user.email_confirmed_at);
    
    console.log(`📊 找到 ${unverifiedUsers.length} 个未验证用户\n`);
    
    if (unverifiedUsers.length === 0) {
      console.log('✅ 所有用户都已验证！');
      return;
    }
    
    // 为每个未验证用户发送邮件
    for (let i = 0; i < Math.min(unverifiedUsers.length, 5); i++) { // 限制一次最多发送5封
      const user = unverifiedUsers[i];
      console.log(`📧 正在为用户发送验证邮件: ${user.email}`);
      
      const verificationLink = generateVerificationLink(user.id, user.email);
      const result = await sendVerificationEmail(user.email, verificationLink);
      
      if (result.success) {
        console.log(`   ✅ 发送成功 (ID: ${result.messageId})`);
      } else {
        console.log(`   ❌ 发送失败: ${result.error}`);
      }
      
      // 等待1秒避免发送过快
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (unverifiedUsers.length > 5) {
      console.log(`\n⚠️  还有 ${unverifiedUsers.length - 5} 个用户未处理，请再次运行脚本`);
    }
    
  } catch (error) {
    console.error('❌ 处理过程中发生错误:', error.message);
  }
}

// 测试单个邮件发送
async function testSingleEmail() {
  console.log('🧪 测试单个邮件发送\n');
  
  const testEmail = process.env.SMTP_USER; // 发送给自己测试
  const testLink = generateVerificationLink('test-user-id', testEmail);
  
  console.log('📧 测试邮箱:', testEmail);
  console.log('🔗 验证链接:', testLink);
  console.log('');
  
  const result = await sendVerificationEmail(testEmail, testLink);
  
  if (result.success) {
    console.log('✅ 测试邮件发送成功！');
    console.log('📬 请检查邮箱收件箱');
  } else {
    console.log('❌ 测试邮件发送失败');
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await testSingleEmail();
  } else if (args.includes('--send-to-unverified')) {
    await sendVerificationToUnverifiedUsers();
  } else {
    console.log('📧 备用邮件发送服务\n');
    console.log('使用方法:');
    console.log('  node backup-email-service.js --test                # 测试邮件发送');
    console.log('  node backup-email-service.js --send-to-unverified  # 为未验证用户发送邮件');
    console.log('');
    console.log('💡 建议先运行测试命令确保邮件发送正常');
  }
}

// 运行主函数
main();