import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: '重置token和新密码不能为空' },
        { status: 400 }
      )
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 查找用户
    const { data: user, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('password_reset_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: '无效的重置链接' },
        { status: 400 }
      )
    }

    // 检查token是否过期
    const now = new Date()
    const tokenExpiry = new Date(user.password_reset_token_expiry)
    
    if (now > tokenExpiry) {
      return NextResponse.json(
        { error: '重置链接已过期，请重新申请' },
        { status: 400 }
      )
    }

    // 加密新密码
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // 更新用户密码并清除重置token
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_token_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('更新密码失败:', updateError)
      return NextResponse.json(
        { error: '密码重置失败，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: '密码重置成功'
    })

  } catch (error) {
    console.error('重置密码错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}