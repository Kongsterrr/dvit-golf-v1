import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
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
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '验证token不能为空' },
        { status: 400 }
      );
    }

    // 解码token
    let decodedData;
    try {
      const decodedString = Buffer.from(token, 'base64').toString('utf-8');
      decodedData = JSON.parse(decodedString);
    } catch (error) {
      return NextResponse.json(
        { error: '无效的验证链接' },
        { status: 400 }
      );
    }

    const { userId, email, timestamp } = decodedData;

    // 检查链接是否过期（24小时）
    const now = Date.now();
    const linkAge = now - timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    if (linkAge > maxAge) {
      return NextResponse.json(
        { error: '验证链接已过期，请重新申请' },
        { status: 400 }
      );
    }

    // 查找用户
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !user.user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查邮箱是否匹配
    if (user.user.email !== email) {
      return NextResponse.json(
        { error: '邮箱地址不匹配' },
        { status: 400 }
      );
    }

    // 检查是否已经验证
    if (user.user.email_confirmed_at) {
      return NextResponse.json(
        { message: '邮箱已经验证过了', verified: true },
        { status: 200 }
      );
    }

    // 验证用户邮箱
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('更新用户验证状态失败:', updateError);
      return NextResponse.json(
        { error: '验证失败，请重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '邮箱验证成功！您现在可以正常使用账户了。',
      verified: true
    });

  } catch (error) {
    console.error('邮箱验证错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}