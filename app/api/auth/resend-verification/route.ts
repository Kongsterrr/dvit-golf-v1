import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
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
    const { email } = body;

    // 验证输入
    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址不能为空' },
        { status: 400 }
      );
    }

    // 检查用户是否存在并获取用户信息
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('获取用户列表失败:', listError);
      return NextResponse.json(
        { error: '重新发送验证邮件失败，请稍后重试' },
        { status: 500 }
      );
    }

    const user = authUsers.users.find((u: any) => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查邮箱是否已验证
    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: '邮箱已经验证过了' },
        { status: 400 }
      );
    }

    // 生成新的验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // 生成验证链接
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    // 更新用户的验证令牌（使用用户元数据）
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        verification_token: verificationToken,
        verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
      }
    });

    if (updateError) {
      console.error('更新验证令牌失败:', updateError);
      return NextResponse.json(
        { error: '重新发送验证邮件失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 发送验证邮件
    try {
      await sendVerificationEmail(email, verificationLink, user.user_metadata?.name || '用户');
      console.log('验证邮件重新发送成功:', email);
    } catch (emailError) {
      console.error('发送验证邮件失败:', emailError);
      return NextResponse.json(
        { error: '发送验证邮件失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '验证邮件已重新发送，请检查您的邮箱',
      email: email
    });

  } catch (error) {
    console.error('重新发送验证邮件错误:', error);
    return NextResponse.json(
      { error: '重新发送验证邮件失败，请稍后重试' },
      { status: 500 }
    );
  }
}