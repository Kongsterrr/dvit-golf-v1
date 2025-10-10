/**
 * 支付安全配置和工具函数
 * 提供支付过程中的安全检查和防护措施
 */

export interface SecurityConfig {
  maxPaymentAmount: number;
  minPaymentAmount: number;
  allowedCurrencies: string[];
  rateLimitWindow: number; // 毫秒
  maxRequestsPerWindow: number;
  requiresSecureConnection: boolean;
}

// 默认安全配置
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxPaymentAmount: 10000, // $100.00
  minPaymentAmount: 100,   // $1.00
  allowedCurrencies: ['usd'],
  rateLimitWindow: 60000,  // 1分钟
  maxRequestsPerWindow: 5,
  requiresSecureConnection: true,
};

// 请求频率限制存储（在生产环境中应使用Redis等外部存储）
const requestTracker = new Map<string, { count: number; windowStart: number }>();

/**
 * 检查支付金额是否在安全范围内
 */
export function isPaymentAmountSecure(amount: number, config: SecurityConfig = DEFAULT_SECURITY_CONFIG): boolean {
  return amount >= config.minPaymentAmount && amount <= config.maxPaymentAmount;
}

/**
 * 检查货币是否被允许
 */
export function isCurrencyAllowed(currency: string, config: SecurityConfig = DEFAULT_SECURITY_CONFIG): boolean {
  return config.allowedCurrencies.includes(currency.toLowerCase());
}

/**
 * 检查连接是否安全
 */
export function isConnectionSecure(request: Request, config: SecurityConfig = DEFAULT_SECURITY_CONFIG): boolean {
  if (!config.requiresSecureConnection) {
    return true;
  }
  
  // 检查是否使用HTTPS
  const url = new URL(request.url);
  return url.protocol === 'https:' || url.hostname === 'localhost';
}

/**
 * 频率限制检查
 */
export function checkRateLimit(
  identifier: string, 
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const tracker = requestTracker.get(identifier);
  
  if (!tracker || now - tracker.windowStart > config.rateLimitWindow) {
    // 新的时间窗口
    requestTracker.set(identifier, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: config.maxRequestsPerWindow - 1,
      resetTime: now + config.rateLimitWindow
    };
  }
  
  if (tracker.count >= config.maxRequestsPerWindow) {
    // 超出限制
    return {
      allowed: false,
      remaining: 0,
      resetTime: tracker.windowStart + config.rateLimitWindow
    };
  }
  
  // 增加计数
  tracker.count++;
  requestTracker.set(identifier, tracker);
  
  return {
    allowed: true,
    remaining: config.maxRequestsPerWindow - tracker.count,
    resetTime: tracker.windowStart + config.rateLimitWindow
  };
}

/**
 * 生成客户端标识符（用于频率限制）
 */
export function generateClientIdentifier(request: Request): string {
  // 在生产环境中，可以使用更复杂的标识符生成逻辑
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `client:${ip}`;
}

/**
 * 验证请求头安全性
 */
export function validateRequestHeaders(request: Request): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 检查Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    errors.push('无效的Content-Type');
  }
  
  // 检查User-Agent
  const userAgent = request.headers.get('user-agent');
  if (!userAgent) {
    errors.push('缺少User-Agent');
  }
  
  // 检查Origin（如果是跨域请求）
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originUrl = new URL(origin);
      // 在生产环境中，应该验证origin是否在允许列表中
      if (process.env.NODE_ENV === 'production' && !isAllowedOrigin(originUrl.hostname)) {
        errors.push('不允许的Origin');
      }
    } catch {
      errors.push('无效的Origin格式');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 检查Origin是否被允许（生产环境使用）
 */
function isAllowedOrigin(hostname: string): boolean {
  const allowedOrigins = [
    'localhost',
    '127.0.0.1',
    // 在这里添加生产环境的域名
    // 'yourdomain.com',
    // 'www.yourdomain.com'
  ];
  
  return allowedOrigins.includes(hostname);
}

/**
 * 清理敏感数据（用于日志记录）
 */
export function sanitizeForLogging(data: any): any {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session'
  ];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  // 递归处理嵌套对象
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * 生成安全的错误响应
 */
export function createSecureErrorResponse(
  error: string, 
  statusCode: number = 400,
  includeDetails: boolean = false
): Response {
  const response = {
    error,
    timestamp: new Date().toISOString(),
    ...(includeDetails && process.env.NODE_ENV === 'development' && {
      details: 'Additional error details available in development mode'
    })
  };
  
  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    }
  });
}

/**
 * 验证Webhook签名（用于Stripe Webhook）
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // 这里应该使用Stripe的签名验证逻辑
    // 这是一个简化的示例
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * 检查环境变量安全性
 */
export function validateEnvironmentSecurity(): { secure: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // 检查Stripe密钥
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    warnings.push('Stripe密钥未配置');
  } else if (!stripeSecret.startsWith('sk_')) {
    warnings.push('Stripe密钥格式不正确');
  } else if (stripeSecret.startsWith('sk_test_') && process.env.NODE_ENV === 'production') {
    warnings.push('生产环境使用了测试密钥');
  }
  
  // 检查数据库连接
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseKey) {
    warnings.push('Supabase服务密钥未配置');
  }
  
  // 检查其他安全相关的环境变量
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_SECRET) {
      warnings.push('NextAuth密钥未配置');
    }
  }
  
  return {
    secure: warnings.length === 0,
    warnings
  };
}

/**
 * 记录安全事件
 */
export function logSecurityEvent(eventType: string, data: any): void {
  const timestamp = new Date().toISOString();
  const sanitizedData = sanitizeForLogging(data);
  
  const logEntry = {
    timestamp,
    eventType,
    ...sanitizedData
  };

  // 在开发环境中输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SECURITY] ${eventType}:`, logEntry);
  }

  // 在生产环境中，这里应该发送到日志服务
  // 例如：Winston, Datadog, CloudWatch 等
}