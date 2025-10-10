import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: '验证token不能为空' },
        { status: 400 }
      )
    }

    // 创建 Supabase 管理客户端
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

    // 获取所有用户并查找匹配的验证令牌
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('获取用户列表失败:', listError);
      return NextResponse.json(
        { error: '验证失败，请重试' },
        { status: 500 }
      );
    }

    // 查找具有匹配验证令牌的用户
    const user = users.users.find((u: any) => 
      u.user_metadata?.verification_token === token
    );

    if (!user) {
      return NextResponse.json(
        { error: '无效的验证链接' },
        { status: 400 }
      )
    }

    // 检查令牌是否过期
    const tokenExpiry = user.user_metadata?.verification_token_expires;
    if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
      return NextResponse.json(
        { error: '验证链接已过期，请重新注册' },
        { status: 400 }
      )
    }

    // 检查用户是否已经验证
    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: '邮箱已经验证过了' },
        { status: 400 }
      )
    }

    // 更新用户验证状态
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          verification_token: null,
          verification_token_expires: null
        }
      }
    );

    if (updateError) {
      console.error('更新用户验证状态失败:', updateError)
      return NextResponse.json(
        { error: '验证失败，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '邮箱验证成功！您现在可以登录了。'
    })

  } catch (error) {
    console.error('邮箱验证错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}