import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationEmail } from 'lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    console.log('Environment check:', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY
    });

    // 创建 Supabase 客户端 - 使用服务角色密钥来绕过邮件确认
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body = await request.json();
    console.log('Received registration data:', { email: body.email, name: body.name });
    
    const { name, email, password } = body;

    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 检查密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 生成验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 使用 Supabase Auth 注册用户 - 设置为未验证状态
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: name,
        display_name: name,
        verification_token: verificationToken,
        verification_token_expires: tokenExpiry.toISOString()
      },
      email_confirm: false // 需要邮件验证
    });

    if (error) {
      console.error('Supabase registration error:', error);
      
      // 处理特定错误
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: '该邮箱已被注册' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: '注册失败，请重试' },
        { status: 500 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: '注册失败，请重试' },
        { status: 500 }
      );
    }

    // 发送验证邮件
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      
      const emailSent = await sendVerificationEmail(email, verificationUrl, name);
      
      if (!emailSent) {
        console.warn('验证邮件发送失败，但用户已创建');
      }
    } catch (emailError) {
      console.error('发送验证邮件时出错:', emailError);
      // 不阻塞注册流程，即使邮件发送失败
    }

    return NextResponse.json({
      message: '注册成功！请检查您的邮箱以验证账户。',
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || name,
        email: data.user.email,
        email_verified: false // 新注册用户需要验证
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '注册失败，请重试' },
      { status: 500 }
    );
  }
}