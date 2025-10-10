/**
 * 支付验证工具函数
 * 提供支付相关的验证和安全检查
 */

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  faceDeck: any;
  weightSystem: any;
  totalPrice: number;
}

/**
 * 验证支付金额
 */
export function validatePaymentAmount(amount: number): PaymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!amount || typeof amount !== 'number') {
    errors.push('支付金额必须是有效数字');
  } else if (amount <= 0) {
    errors.push('支付金额必须大于0');
  } else if (amount < 1) {
    errors.push('支付金额不能少于1美元');
  } else if (amount > 10000) {
    warnings.push('支付金额较大，请确认订单信息');
  }

  // 检查金额精度（最多2位小数）
  if (amount && (amount * 100) % 1 !== 0) {
    errors.push('支付金额精度不能超过2位小数');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证订单数据
 */
export function validateOrderData(orderData: any): PaymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!orderData) {
    errors.push('订单数据不能为空');
    return { isValid: false, errors, warnings };
  }

  // 验证客户信息
  if (!orderData.customerName || typeof orderData.customerName !== 'string') {
    errors.push('客户姓名不能为空');
  } else if (orderData.customerName.trim().length < 2) {
    errors.push('客户姓名至少需要2个字符');
  }

  if (!orderData.customerEmail || typeof orderData.customerEmail !== 'string') {
    errors.push('客户邮箱不能为空');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.customerEmail)) {
    errors.push('客户邮箱格式不正确');
  }

  // 验证产品配置
  if (!orderData.faceDeck) {
    errors.push('面板配置不能为空');
  }

  if (!orderData.weightSystem) {
    errors.push('配重系统不能为空');
  }

  // 验证配送地址（如果提供）
  if (orderData.shippingAddress) {
    const address = orderData.shippingAddress;
    if (!address.address || !address.city || !address.state || !address.zipCode) {
      errors.push('配送地址信息不完整');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证支付环境
 */
export function validatePaymentEnvironment(): PaymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查Stripe配置
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripePublishableKey) {
    errors.push('Stripe公钥未配置');
  } else if (stripePublishableKey.startsWith('pk_test_')) {
    warnings.push('当前使用Stripe测试环境');
  }

  if (!stripeSecretKey) {
    errors.push('Stripe私钥未配置');
  } else if (stripeSecretKey.startsWith('sk_test_')) {
    warnings.push('当前使用Stripe测试密钥');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 综合验证支付请求（服务端使用）
 */
export function validatePaymentRequest(amount: number, orderData: any): PaymentValidationResult {
  const amountValidation = validatePaymentAmount(amount);
  const orderValidation = validateOrderData(orderData);
  const envValidation = validatePaymentEnvironment();

  const allErrors = [
    ...amountValidation.errors,
    ...orderValidation.errors,
    ...envValidation.errors
  ];

  const allWarnings = [
    ...amountValidation.warnings,
    ...orderValidation.warnings,
    ...envValidation.warnings
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * 前端支付验证（不检查服务端环境变量）
 */
export function validateClientPaymentRequest(amount: number, orderData: any): PaymentValidationResult {
  const amountValidation = validatePaymentAmount(amount);
  const orderValidation = validateOrderData(orderData);

  const allErrors = [
    ...amountValidation.errors,
    ...orderValidation.errors
  ];

  const allWarnings = [
    ...amountValidation.warnings,
    ...orderValidation.warnings
  ];

  // 只检查前端可访问的Stripe公钥
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!stripePublishableKey) {
    allErrors.push('Stripe公钥未配置');
  } else if (stripePublishableKey.startsWith('pk_test_')) {
    allWarnings.push('当前使用Stripe测试环境');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * 生成安全的订单ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `DVIT-${timestamp}-${random}`;
}

/**
 * 验证支付意图状态
 */
export function validatePaymentIntentStatus(status: string): boolean {
  const validStatuses = [
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
    'requires_capture',
    'canceled',
    'succeeded'
  ];
  
  return validStatuses.includes(status);
}

/**
 * 格式化金额给Stripe（将美元转换为分）
 * Stripe要求金额以最小货币单位提交（USD以分为单位）
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * 格式化支付金额（从分转换为元）
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}