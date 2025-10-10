import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    console.log('Environment check:', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY
    });

    // 创建 Supabase 客户端
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
    console.log('Received login data:', { email: body.email });
    
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 使用 Supabase Auth 登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      
      // 处理特定错误
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }
      
      // 检查是否是邮箱未验证错误
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { 
            code: 'EMAIL_NOT_VERIFIED',
            message: '您的邮箱尚未验证，请先完成验证',
            email: email
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: '登录失败，请重试' },
        { status: 500 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: '登录失败，请重试' },
        { status: 500 }
      );
    }

    // 检查邮箱验证状态
    if (!data.user.email_confirmed_at) {
      return NextResponse.json(
        { 
          code: 'EMAIL_NOT_VERIFIED',
          message: '您的邮箱尚未验证，请先完成验证',
          email: email
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        email: data.user.email,
        email_verified: data.user.email_confirmed_at ? true : false
      },
      tokens: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请重试' },
      { status: 500 }
    );
  }
}