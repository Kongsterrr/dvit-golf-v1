import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// 邮件配置接口
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// 订单项接口
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  customization?: {
    faceDeck?: string;
    weightSystem?: string;
  };
}

// 订单数据接口
interface OrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  totalPrice: number;
  orderDate?: string;
  // 多商品支持
  orderItems?: OrderItem[];
  // 单商品兼容性
  faceDeck?: string;
  weightSystem?: string;
}

// 创建邮件传输器
function createTransporter() {
  const emailConfig: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransport(emailConfig);
}

// 生成订单确认邮件内容（支持多商品）
export function generateOrderConfirmationEmail(orderData: OrderData): { html: string; text: string } {
  const { 
    customerName, 
    orderId, 
    totalPrice, 
    orderDate = new Date().toLocaleDateString('zh-CN'),
    orderItems,
    faceDeck,
    weightSystem 
  } = orderData;

  // HTML 邮件模板
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>订单确认 - DVIT GOLF</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); 
          color: #fff; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 300; 
          letter-spacing: 2px;
        }
        .header h2 { 
          margin: 10px 0 0 0; 
          font-size: 16px; 
          font-weight: 400; 
          opacity: 0.9;
        }
        .content { 
          padding: 30px 20px; 
          background: #ffffff; 
        }
        .greeting { 
          font-size: 18px; 
          margin-bottom: 20px; 
          color: #2c3e50;
        }
        .order-details { 
          background: #f8f9fa; 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #3498db;
        }
        .order-details h4 { 
          margin: 0 0 20px 0; 
          color: #2c3e50; 
          font-size: 20px;
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 12px; 
          padding-bottom: 8px; 
          border-bottom: 1px solid #ecf0f1;
        }
        .detail-row:last-child { 
          border-bottom: none; 
          margin-bottom: 0;
        }
        .detail-label { 
          font-weight: 600; 
          color: #34495e;
        }
        .detail-value { 
          color: #2c3e50;
        }
        .price { 
          font-size: 20px; 
          font-weight: bold; 
          color: #e74c3c; 
        }
        .item-group {
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .item-group:last-child {
          margin-bottom: 0;
        }
        .next-steps { 
          background: #e8f5e8; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 25px 0;
        }
        .next-steps h4 { 
          color: #27ae60; 
          margin: 0 0 15px 0;
        }
        .step { 
          margin-bottom: 10px; 
          padding-left: 20px; 
          position: relative;
        }
        .step::before { 
          content: "✓"; 
          position: absolute; 
          left: 0; 
          color: #27ae60; 
          font-weight: bold;
        }
        .footer { 
          text-align: center; 
          padding: 30px 20px; 
          background: #34495e; 
          color: #ecf0f1; 
          font-size: 14px;
        }
        .footer a { 
          color: #3498db; 
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DVIT GOLF</h1>
          <h2>订单确认通知</h2>
        </div>
        <div class="content">
          <div class="greeting">
            亲爱的 ${customerName}，
          </div>
          <p>感谢您选择DVIT GOLF！您的定制推杆订单已成功确认并开始处理。</p>
          
          <div class="order-details">
            <h4>📋 订单详情</h4>
            <div class="detail-row">
              <span class="detail-label">订单编号</span>
              <span class="detail-value">${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">下单时间</span>
              <span class="detail-value">${orderDate}</span>
            </div>
            
            ${orderItems && orderItems.length > 0 ? 
              // 多商品显示
              orderItems.map((item, index) => `
                <div class="item-group">
                  <div class="detail-row">
                    <span class="detail-label">商品 ${index + 1}</span>
                    <span class="detail-value">${item.name} × ${item.quantity}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">单价</span>
                    <span class="detail-value">${item.price.toLocaleString()}</span>
                  </div>
                  ${item.customization ? `
                    <div class="detail-row">
                      <span class="detail-label">定制配置</span>
                      <span class="detail-value">${item.customization.faceDeck || ''} ${item.customization.weightSystem || ''}</span>
                    </div>
                  ` : ''}
                </div>
              `).join('')
              :
              // 单商品显示（向后兼容）
              `
                <div class="detail-row">
                  <span class="detail-label">面板类型</span>
                  <span class="detail-value">${faceDeck || '标准配置'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">配重系统</span>
                  <span class="detail-value">${weightSystem || '标准配置'}</span>
                </div>
              `
            }
            
            <div class="detail-row">
              <span class="detail-label">支付金额</span>
              <span class="detail-value price">${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div class="next-steps">
            <h4>🚀 接下来的步骤</h4>
            <div class="step">订单确认邮件已发送（当前步骤）</div>
            <div class="step">开始定制生产（1-2个工作日内）</div>
            <div class="step">质量检测与包装</div>
            <div class="step">安排发货（预计7-10个工作日）</div>
            <div class="step">物流跟踪信息将通过邮件发送</div>
          </div>

          <p>如有任何疑问，请随时联系我们的客服团队。</p>
          <p>再次感谢您的信任与支持！</p>
          
          <p style="margin-top: 30px;">
            <strong>DVIT GOLF团队</strong>
          </p>
        </div>
        <div class="footer">
          <p><strong>DVIT GOLF</strong> - 专业定制推杆品牌</p>
          <p>客服邮箱：<a href="mailto:support@dvitgolf.com">support@dvitgolf.com</a></p>
          <p>官方网站：<a href="https://dvitgolf.com">www.dvitgolf.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 文本版本邮件
  const text = `
DVIT GOLF - 订单确认通知

亲爱的 ${customerName}，

感谢您选择DVIT GOLF！您的定制推杆订单已成功确认并开始处理。

订单详情：
订单编号：${orderId}
下单时间：${orderDate}

${orderItems && orderItems.length > 0 ? 
  // 多商品文本显示
  orderItems.map((item, index) => `
商品 ${index + 1}：${item.name} × ${item.quantity}
单价：$${item.price.toLocaleString()}
${item.customization ? `定制配置：${item.customization.faceDeck || ''} ${item.customization.weightSystem || ''}` : ''}
  `).join('\n')
  :
  // 单商品文本显示（向后兼容）
  `
面板类型：${faceDeck || '标准配置'}
配重系统：${weightSystem || '标准配置'}
  `
}

支付金额：$${totalPrice.toLocaleString()}

接下来的步骤：
✓ 订单确认邮件已发送（当前步骤）
✓ 开始定制生产（1-2个工作日内）
✓ 质量检测与包装
✓ 安排发货（预计7-10个工作日）
✓ 物流跟踪信息将通过邮件发送

如有任何疑问，请随时联系我们的客服团队。
再次感谢您的信任与支持！

DVIT GOLF团队

客服邮箱：support@dvitgolf.com
官方网站：www.dvitgolf.com
  `;

  return { html, text };
}

// 发送订单确认邮件
// 创建Supabase客户端
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Supabase配置缺失，无法记录邮件发送状态');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// 检查邮件是否已经发送过
async function checkEmailAlreadySent(orderId: string, email: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    // 首先按 order_id 精确匹配检查是否已发送
    const { data: orderData, error: orderError } = await supabase
      .from('email_logs')
      .select('id, subject, sent_at, order_id')
      .eq('email_type', 'order_confirmation')
      .eq('order_id', orderId)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })
      .limit(1);

    if (orderError) {
      console.error('❌ 按订单ID检查邮件发送状态失败:', orderError);
    } else if (orderData && orderData.length > 0) {
      console.log(`📧 发现该订单已发送邮件: ${orderData[0].subject} (${orderData[0].sent_at})`);
      return true;
    }

    // 如果按订单ID没找到，再检查最近10分钟内是否已经发送过订单确认邮件给这个邮箱
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('email_logs')
      .select('id, subject, sent_at')
      .eq('email_type', 'order_confirmation')
      .eq('recipient_email', email)
      .eq('status', 'sent')
      .gte('sent_at', tenMinutesAgo)
      .order('sent_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ 检查邮件发送状态失败:', error);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`📧 发现最近发送的邮件: ${data[0].subject} (${data[0].sent_at})`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ 检查邮件发送状态异常:', error);
    return false;
  }
}

// 记录邮件发送状态
async function logEmailSent(
  orderId: string, 
  email: string, 
  emailType: string, 
  messageId: string | null, 
  status: string = 'sent'
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

     const { error } = await supabase
      .from('email_logs')
      .upsert({
        order_id: orderId,
        email_type: emailType,
        recipient_email: email,
        subject: `订单确认 - ${orderId} - DVIT GOLF`,
        status: status,
        template_id: 'order_confirmation',
        sent_at: status === 'sent' ? new Date().toISOString() : null
      }, { onConflict: 'order_id,email_type', ignoreDuplicates: false });

    if (error) {
      console.error('❌ 记录邮件发送状态失败:', error);
    } else {
      console.log(`📝 邮件发送状态已记录: ${status} (订单ID: ${orderId})`);
    }
  } catch (error) {
    console.error('❌ 记录邮件发送状态异常:', error);
  }
}

export async function sendOrderConfirmationEmail(orderData: OrderData): Promise<boolean> {
  try {
    // 检查是否配置了邮件服务
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 邮件服务未配置，跳过发送邮件');
      return true; // 返回 true 以免阻塞订单流程
    }

    // 检查是否已经发送过邮件（防止重复发送）
    const alreadySent = await checkEmailAlreadySent(orderData.orderId, orderData.customerEmail);
    if (alreadySent) {
      console.log(`📧 订单 ${orderData.orderId} 的确认邮件已发送过，跳过重复发送`);
      return true;
    }

    const transporter = createTransporter();
    const { html, text } = generateOrderConfirmationEmail(orderData);

    const mailOptions = {
      from: `"DVIT GOLF" <${process.env.SMTP_USER}>`,
      to: orderData.customerEmail,
      subject: `订单确认 - ${orderData.orderId} - DVIT GOLF`,
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 订单确认邮件发送成功:', result.messageId);
    
    // 记录邮件发送状态
    await logEmailSent(orderData.orderId, orderData.customerEmail, 'order_confirmation', result.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ 发送订单确认邮件失败:', error);
    
    // 记录邮件发送失败状态
    await logEmailSent(orderData.orderId, orderData.customerEmail, 'order_confirmation', null, 'failed');
    
    return false;
  }
}

// 生成邮箱验证邮件
export function generateVerificationEmail(verificationUrl: string, userName: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>邮箱验证 - DVIT GOLF</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">欢迎加入 DVIT GOLF！</h2>
        <p>亲爱的 ${userName}，</p>
        <p>感谢您注册 DVIT GOLF 账户。请点击下面的链接验证您的邮箱地址：</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            验证邮箱
          </a>
        </p>
        <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>此链接将在24小时后失效。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          DVIT GOLF 团队<br>
          如有疑问，请联系：support@dvitgolf.com
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
欢迎加入 DVIT GOLF！

亲爱的 ${userName}，

感谢您注册 DVIT GOLF 账户。请访问以下链接验证您的邮箱地址：

${verificationUrl}

此链接将在24小时后失效。

如有疑问，请联系：support@dvitgolf.com

DVIT GOLF 团队
  `;

  return { html, text };
}

// 发送邮箱验证邮件
export async function sendVerificationEmail(email: string, verificationUrl: string, userName: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 邮件服务未配置，跳过发送验证邮件');
      return true;
    }

    const transporter = createTransporter();
    const { html, text } = generateVerificationEmail(verificationUrl, userName);

    const mailOptions = {
      from: `"DVIT GOLF" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '邮箱验证 - DVIT GOLF',
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 验证邮件发送成功:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ 发送验证邮件失败:', error);
    return false;
  }
}

// 生成密码重置邮件
export function generatePasswordResetEmail(resetUrl: string, userName: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>密码重置 - DVIT GOLF</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">密码重置请求</h2>
        <p>亲爱的 ${userName}，</p>
        <p>我们收到了您的密码重置请求。请点击下面的链接重置您的密码：</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            重置密码
          </a>
        </p>
        <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>此链接将在1小时后失效。如果您没有请求密码重置，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          DVIT GOLF 团队<br>
          如有疑问，请联系：support@dvitgolf.com
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
密码重置请求

亲爱的 ${userName}，

我们收到了您的密码重置请求。请访问以下链接重置您的密码：

${resetUrl}

此链接将在1小时后失效。如果您没有请求密码重置，请忽略此邮件。

如有疑问，请联系：support@dvitgolf.com

DVIT GOLF 团队
  `;

  return { html, text };
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email: string, resetUrl: string, userName: string): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 邮件服务未配置，跳过发送密码重置邮件');
      return true;
    }

    const transporter = createTransporter();
    const { html, text } = generatePasswordResetEmail(resetUrl, userName);

    const mailOptions = {
      from: `"DVIT GOLF" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '密码重置 - DVIT GOLF',
      html,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 密码重置邮件发送成功:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ 发送密码重置邮件失败:', error);
    return false;
  }
}