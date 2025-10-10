import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 在实际应用中，这里可以将token加入黑名单
    // 或者在数据库中记录登出时间
    
    return NextResponse.json({
      message: '登出成功'
    })

  } catch (error) {
    console.error('登出错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}