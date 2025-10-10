import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId || !email) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数：orderId 和 email'
      }, { status: 400 });
    }

    // 检查邮件是否已经发送过
    const { data, error } = await supabaseAdmin
      .from('email_logs')
      .select('id, subject, created_at, status')
      .eq('email_type', 'order_confirmation')
      .eq('recipient_email', email)
      .eq('status', 'sent')
      .ilike('subject', `%${orderId}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ 检查邮件发送状态失败:', error);
      return NextResponse.json({
        success: false,
        error: '检查邮件状态失败'
      }, { status: 500 });
    }

    const emailSent = data && data.length > 0;
    
    return NextResponse.json({
      success: true,
      emailSent,
      emailInfo: emailSent ? {
        sentAt: data[0].created_at,
        subject: data[0].subject
      } : null
    });

  } catch (error) {
    console.error('❌ 检查邮件状态异常:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}