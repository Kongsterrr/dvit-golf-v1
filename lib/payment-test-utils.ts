/**
 * 支付测试工具
 * 提供测试支付功能的工具函数和测试数据
 */

export interface TestPaymentData {
  amount: number;
  currency: string;
  orderData: {
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
  };
}

// 测试用的Stripe测试卡号
export const TEST_CARDS = {
  VISA_SUCCESS: '4242424242424242',
  VISA_DECLINED: '4000000000000002',
  MASTERCARD_SUCCESS: '5555555555554444',
  AMEX_SUCCESS: '378282246310005',
  VISA_3DS: '4000000000003220', // 需要3D Secure验证
  VISA_INSUFFICIENT_FUNDS: '4000000000009995',
  VISA_EXPIRED: '4000000000000069',
  VISA_INCORRECT_CVC: '4000000000000127',
  VISA_PROCESSING_ERROR: '4000000000000119',
};

// 有效的测试数据
export const VALID_TEST_DATA: TestPaymentData = {
  amount: 299.99,
  currency: 'usd',
  orderData: {
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+1234567890',
    shippingAddress: {
      address: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
      country: 'US'
    },
    faceDeck: {
      type: 'premium',
      color: 'black',
      material: 'carbon-fiber'
    },
    weightSystem: {
      type: 'adjustable',
      weight: '350g'
    },
    totalPrice: 299.99
  }
};

// 无效的测试数据（用于测试验证）
export const INVALID_TEST_DATA = {
  EMPTY_AMOUNT: {
    ...VALID_TEST_DATA,
    amount: 0
  },
  NEGATIVE_AMOUNT: {
    ...VALID_TEST_DATA,
    amount: -100
  },
  EXCESSIVE_AMOUNT: {
    ...VALID_TEST_DATA,
    amount: 999999
  },
  MISSING_CUSTOMER_NAME: {
    ...VALID_TEST_DATA,
    orderData: {
      ...VALID_TEST_DATA.orderData,
      customerName: ''
    }
  },
  INVALID_EMAIL: {
    ...VALID_TEST_DATA,
    orderData: {
      ...VALID_TEST_DATA.orderData,
      customerEmail: 'invalid-email'
    }
  },
  MISSING_ORDER_DATA: {
    ...VALID_TEST_DATA,
    orderData: null
  }
};

/**
 * 测试支付API端点
 */
export async function testPaymentAPI(
  testData: TestPaymentData,
  baseUrl: string = 'http://localhost:3000'
): Promise<{ success: boolean; response: any; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PaymentTestTool/1.0'
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();

    return {
      success: response.ok,
      response: {
        status: response.status,
        statusText: response.statusText,
        data
      }
    };
  } catch (error) {
    return {
      success: false,
      response: null,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 测试频率限制
 */
export async function testRateLimit(
  baseUrl: string = 'http://localhost:3000',
  requestCount: number = 6
): Promise<{ results: any[]; rateLimitTriggered: boolean }> {
  const results = [];
  let rateLimitTriggered = false;

  for (let i = 0; i < requestCount; i++) {
    const result = await testPaymentAPI(VALID_TEST_DATA, baseUrl);
    results.push({
      requestNumber: i + 1,
      success: result.success,
      status: result.response?.status,
      error: result.error
    });

    if (result.response?.status === 429) {
      rateLimitTriggered = true;
    }

    // 短暂延迟以避免过快的请求
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { results, rateLimitTriggered };
}

/**
 * 测试验证功能
 */
export async function testValidation(
  baseUrl: string = 'http://localhost:3000'
): Promise<{ testName: string; passed: boolean; details: any }[]> {
  const tests = [
    {
      name: '有效数据测试',
      data: VALID_TEST_DATA,
      expectedSuccess: true
    },
    {
      name: '空金额测试',
      data: INVALID_TEST_DATA.EMPTY_AMOUNT,
      expectedSuccess: false
    },
    {
      name: '负金额测试',
      data: INVALID_TEST_DATA.NEGATIVE_AMOUNT,
      expectedSuccess: false
    },
    {
      name: '过大金额测试',
      data: INVALID_TEST_DATA.EXCESSIVE_AMOUNT,
      expectedSuccess: false
    },
    {
      name: '缺少客户姓名测试',
      data: INVALID_TEST_DATA.MISSING_CUSTOMER_NAME,
      expectedSuccess: false
    },
    {
      name: '无效邮箱测试',
      data: INVALID_TEST_DATA.INVALID_EMAIL,
      expectedSuccess: false
    }
  ];

  const results = [];

  for (const test of tests) {
    const result = await testPaymentAPI(test.data, baseUrl);
    const passed = result.success === test.expectedSuccess;

    results.push({
      testName: test.name,
      passed,
      details: {
        expected: test.expectedSuccess,
        actual: result.success,
        response: result.response,
        error: result.error
      }
    });
  }

  return results;
}

/**
 * 运行完整的测试套件
 */
export async function runFullTestSuite(
  baseUrl: string = 'http://localhost:3000'
): Promise<{
  validationTests: any[];
  rateLimitTest: any;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
  };
}> {
  console.log('🧪 开始运行支付系统测试套件...');

  // 运行验证测试
  console.log('📋 运行验证测试...');
  const validationTests = await testValidation(baseUrl);

  // 运行频率限制测试
  console.log('⏱️ 运行频率限制测试...');
  const rateLimitTest = await testRateLimit(baseUrl);

  // 计算总结
  const totalValidationTests = validationTests.length;
  const passedValidationTests = validationTests.filter(t => t.passed).length;
  const rateLimitPassed = rateLimitTest.rateLimitTriggered ? 1 : 0;

  const totalTests = totalValidationTests + 1; // +1 for rate limit test
  const passedTests = passedValidationTests + rateLimitPassed;
  const failedTests = totalTests - passedTests;
  const successRate = (passedTests / totalTests) * 100;

  const summary = {
    totalTests,
    passedTests,
    failedTests,
    successRate
  };

  console.log('📊 测试完成！');
  console.log(`✅ 通过: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);

  return {
    validationTests,
    rateLimitTest,
    summary
  };
}

/**
 * 生成测试报告
 */
export function generateTestReport(testResults: any): string {
  const { validationTests, rateLimitTest, summary } = testResults;

  let report = '# 支付系统测试报告\n\n';
  
  report += `## 测试总结\n`;
  report += `- 总测试数: ${summary.totalTests}\n`;
  report += `- 通过测试: ${summary.passedTests}\n`;
  report += `- 失败测试: ${summary.failedTests}\n`;
  report += `- 成功率: ${summary.successRate.toFixed(1)}%\n\n`;

  report += `## 验证测试结果\n`;
  validationTests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    report += `${status} ${test.testName}\n`;
    if (!test.passed) {
      report += `   - 期望: ${test.details.expected}\n`;
      report += `   - 实际: ${test.details.actual}\n`;
      if (test.details.error) {
        report += `   - 错误: ${test.details.error}\n`;
      }
    }
  });

  report += `\n## 频率限制测试\n`;
  const rateLimitStatus = rateLimitTest.rateLimitTriggered ? '✅' : '❌';
  report += `${rateLimitStatus} 频率限制功能\n`;
  if (rateLimitTest.rateLimitTriggered) {
    report += `   - 成功触发频率限制保护\n`;
  } else {
    report += `   - 未能触发频率限制（可能需要调整配置）\n`;
  }

  return report;
}