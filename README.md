# Dvit Golf - 模块化高尔夫推杆定制销售网站

## 项目概述

Dvit Golf是一个高端模块化高尔夫推杆的定制销售平台，采用现代化的技术栈，提供类似BMW配置器的交互式定制体验。

## 核心功能

### 1. 用户系统
- ✅ 完整的用户注册/登录流程
- ✅ 邮箱验证机制
- ✅ 密码找回功能
- ✅ 用户资料管理

### 2. 产品展示系统
- ✅ 基础产品：Dvit Modular Putter（$899基础价格）
- ✅ Face Deck材质选项：
  - 6061铝合金（默认，+$0）
  - 铜合金（+$150）
  - 303不锈钢（+$120）
  - 聚合物（+$80）
- ✅ 配重系统选项：
  - Long Wing（默认，+$0）
  - Short Wing（+$50）
- 🔄 3D可视化技术集成

### 3. 定制化系统
- 🔄 BMW风格的交互式配置界面
- 🔄 实时价格计算和显示
- 🔄 配置保存和分享功能
- 🔄 3D预览自动生成

### 4. 支付系统
- ✅ Stripe沙盒环境集成
- ✅ 产品和价格配置完成
- 🔄 多种支付方式支持
- 🔄 订单确认邮件

### 5. 数据库设计
- ✅ Supabase PostgreSQL数据库
- ✅ 完整的数据模型设计
- ✅ 用户资料存储
- ✅ 产品配置数据
- ✅ 订单记录系统
- ✅ 关联数据模型

### 6. 页面设计
- 🔄 Apple.com风格的极简首页
- 🔄 全屏滚动交互产品页
- 🔄 高精度产品渲染配置器
- 🔄 响应式设计

## 技术架构

### 前端技术栈
- **框架**: Next.js 14 + TypeScript
- **样式**: Tailwind CSS
- **3D渲染**: Three.js + React Three Fiber
- **状态管理**: Zustand
- **UI组件**: Headless UI / Radix UI

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **支付**: Stripe
- **文件存储**: Supabase Storage
- **邮件服务**: Resend / SendGrid

### 部署和运维
- **前端部署**: Vercel
- **CDN**: Vercel Edge Network
- **监控**: Vercel Analytics
- **错误追踪**: Sentry

## 数据库结构

### 核心表
1. **products** - 产品信息（已创建）
2. **user_configurations** - 用户配置
3. **orders** - 订单记录
4. **order_items** - 订单项目
5. **user_profiles** - 用户资料扩展
6. **email_logs** - 邮件日志
7. **product_assets** - 产品资源（3D模型、图片）
8. **system_settings** - 系统设置

### Stripe产品配置

| 产品 | Stripe Product ID | Stripe Price ID | 价格 |
|------|------------------|-----------------|------|
| Dvit Modular Putter | prod_TC1tVw61VJFBX5 | price_1SFdpl6LJHHneEe1HREAKHbM | $899.00 |
| Face Deck - 6061铝合金 | prod_TC1ti9WNHjBTQF | price_1SFdpv6LJHHneEe166IPPBJv | $0.00 |
| Face Deck - 铜合金 | prod_TC1tbUBf8DcjCk | price_1SFdq56LJHHneEe1xpVvEJry | $150.00 |
| Face Deck - 303不锈钢 | prod_TC1tqw8ceOuvs0 | price_1SFdqD6LJHHneEe1Lzh6f5Vu | $120.00 |
| Face Deck - 聚合物 | prod_TC1uKY3ZYyFruH | price_1SFdqL6LJHHneEe1ikMMBEX1 | $80.00 |
| 配重系统 - Long Wing | prod_TC1uBfM8eAQCR6 | price_1SFdqU6LJHHneEe1xHi5akIw | $0.00 |
| 配重系统 - Short Wing | prod_TC1uxe6VcQ5oCd | price_1SFdqc6LJHHneEe1y7pViXw2 | $50.00 |

## 开发阶段

### ✅ 第一阶段：基础架构搭建
- [x] 数据库设计和表创建
- [x] Stripe产品配置
- [ ] 前端项目初始化
- [ ] 基础认证系统

### 🔄 第二阶段：核心功能开发
- [ ] 用户系统完善
- [ ] 产品展示页面
- [ ] 基础配置器界面
- [ ] 3D可视化集成

### ⏳ 第三阶段：高级功能
- [ ] 完整定制化系统
- [ ] 支付流程集成
- [ ] 订单管理系统
- [ ] 邮件通知系统

### ⏳ 第四阶段：优化和完善
- [ ] 性能优化
- [ ] 移动端适配
- [ ] 管理后台
- [ ] 测试和部署

## 安装和运行

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase项目
- Stripe账户

### 环境变量
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# 其他
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 数据库初始化
```bash
# 在Supabase SQL编辑器中运行
psql -f database-schema.sql
psql -f seed-data.sql
```

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## API文档

### 产品API
- `GET /api/products` - 获取所有产品
- `GET /api/products/[category]` - 按类别获取产品
- `GET /api/products/[id]` - 获取单个产品

### 配置API
- `POST /api/configurations` - 创建配置
- `GET /api/configurations/[id]` - 获取配置
- `PUT /api/configurations/[id]` - 更新配置
- `DELETE /api/configurations/[id]` - 删除配置

### 订单API
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取用户订单
- `GET /api/orders/[id]` - 获取订单详情

### 支付API
- `POST /api/payments/create-intent` - 创建支付意图
- `POST /api/payments/webhook` - Stripe Webhook

## 安全考虑

### 数据安全
- Row Level Security (RLS) 策略
- 用户数据隔离
- API访问控制

### 支付安全
- PCI DSS合规
- Stripe安全最佳实践
- Webhook签名验证

### 认证安全
- JWT令牌管理
- 密码加密存储
- 邮箱验证机制

## 性能优化

### 前端优化
- 代码分割和懒加载
- 图片优化和CDN
- 3D模型压缩
- 缓存策略

### 数据库优化
- 索引优化
- 查询优化
- 连接池管理

## 监控和分析

### 性能监控
- Vercel Analytics
- Core Web Vitals
- 用户体验指标

### 错误监控
- Sentry错误追踪
- 日志聚合
- 告警机制

### 业务分析
- 用户行为分析
- 转化率追踪
- 销售数据分析

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目维护者: Dvit Golf Team
- 邮箱: dev@dvitgolf.com
- 网站: https://dvitgolf.com