import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 查找用户
    const { data: user, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      // 为了安全起见，即使用户不存在也返回成功消息
      return NextResponse.json({
        message: '如果该邮箱存在，我们已发送重置密码链接'
      })
    }

    // 生成重置密码token
    const resetToken = randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1小时后过期

    // 更新用户重置token
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        password_reset_token: resetToken,
        password_reset_token_expiry: resetTokenExpiry.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('更新重置token失败:', updateError)
      return NextResponse.json(
        { error: '发送失败，请重试' },
        { status: 500 }
      )
    }

    // 发送重置密码邮件 (这里可以集成邮件服务)
    // await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({
      message: '如果该邮箱存在，我们已发送重置密码链接'
    })

  } catch (error) {
    console.error('忘记密码错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}