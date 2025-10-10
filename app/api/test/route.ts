import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'API 测试成功',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    success: true, 
    message: 'POST 请求测试成功',
    timestamp: new Date().toISOString()
  });
}