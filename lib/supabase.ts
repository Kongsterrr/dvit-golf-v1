import { createClient } from '@supabase/supabase-js'

// 服务端环境变量 (仅在服务端可用)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 客户端环境变量 (在客户端和服务端都可用)
const supabaseClientUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 服务端配置检查
if (typeof window === 'undefined') {
  console.log('🔍 服务端Supabase配置检查:', {
    url: supabaseUrl ? '✅ 已配置' : '❌ 未配置',
    serviceKey: supabaseServiceKey ? '✅ 已配置' : '❌ 未配置'
  });
}

// 客户端配置检查
console.log('🔍 客户端Supabase配置检查:', {
  url: supabaseClientUrl ? '✅ 已配置' : '❌ 未配置',
  anonKey: supabaseAnonKey ? '✅ 已配置' : '❌ 未配置'
});

// 服务端客户端 - 用于API路由
let supabaseAdmin: any = null;
if (typeof window === 'undefined' && supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// 客户端配置
if (!supabaseClientUrl || !supabaseAnonKey) {
  throw new Error(`Missing client Supabase environment variables: URL=${!!supabaseClientUrl}, AnonKey=${!!supabaseAnonKey}`)
}

export const supabase = createClient(supabaseClientUrl, supabaseAnonKey)
export { supabaseAdmin }