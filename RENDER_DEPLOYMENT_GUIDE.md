# Render 部署指南

本指南将帮助你将 Dvit Golf 定制化项目部署到 Render 平台。

## 📋 部署前准备

### 1. 确保代码已推送到 GitHub
确保你的项目代码已经推送到 GitHub 仓库，并且包含以下文件：
- `render.yaml` - Render 配置文件
- `package.json` - 项目依赖
- `next.config.js` - Next.js 配置

### 2. 准备环境变量
你需要准备以下环境变量的值：

#### Supabase 配置
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Stripe 配置
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### SMTP 邮件配置
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## 🚀 Render 部署步骤

### 步骤 1: 创建 Render 账户
1. 访问 [render.com](https://render.com)
2. 点击 "Get Started" 注册账户
3. 使用 GitHub 账户登录（推荐）

### 步骤 2: 连接 GitHub 仓库
1. 在 Render Dashboard 中，点击 "New +"
2. 选择 "Web Service"
3. 连接你的 GitHub 账户（如果还没有连接）
4. 选择包含你项目的仓库

### 步骤 3: 配置 Web Service
1. **Name**: 输入服务名称，例如 `dvit-golf-customization`
2. **Branch**: 选择 `main` 或你的主分支
3. **Root Directory**: 留空（如果项目在根目录）
4. **Runtime**: 选择 `Node`
5. **Build Command**: `npm ci && npm run build`
6. **Start Command**: `npm start`

### 步骤 4: 配置环境变量
在 "Environment Variables" 部分添加以下变量：

```bash
# 基础配置
NODE_ENV=production

# Supabase 配置
SUPABASE_URL=你的supabase项目URL
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥

# Stripe 配置
STRIPE_SECRET_KEY=你的stripe密钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=你的stripe公钥
STRIPE_WEBHOOK_SECRET=你的webhook密钥

# SMTP 配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=你的邮箱
SMTP_PASS=你的邮箱密码或应用密码

# 应用URL（部署后会自动生成）
NEXT_PUBLIC_SITE_URL=https://你的应用名.onrender.com
NEXT_PUBLIC_APP_URL=https://你的应用名.onrender.com
```

### 步骤 5: 高级设置
1. **Plan**: 选择 "Free" 计划开始
2. **Auto-Deploy**: 保持启用，这样代码更新时会自动部署
3. **Health Check Path**: 设置为 `/`

### 步骤 6: 部署
1. 点击 "Create Web Service"
2. Render 将开始构建和部署你的应用
3. 构建过程大约需要 5-10 分钟

## 🔧 部署后配置

### 1. 更新 Stripe Webhook
部署完成后，你需要更新 Stripe 的 webhook URL：
1. 登录 Stripe Dashboard
2. 进入 "Developers" > "Webhooks"
3. 更新 webhook URL 为：`https://你的应用名.onrender.com/api/webhooks/stripe`

### 2. 更新 Supabase 认证设置
1. 登录 Supabase Dashboard
2. 进入 "Authentication" > "URL Configuration"
3. 更新 "Site URL" 为：`https://你的应用名.onrender.com`
4. 在 "Redirect URLs" 中添加：
   - `https://你的应用名.onrender.com/auth/callback`
   - `https://你的应用名.onrender.com/auth/verify-email`

### 3. 测试邮件功能
确保 SMTP 配置正确，测试用户注册和邮件验证功能。

## 📊 监控和维护

### 查看日志
1. 在 Render Dashboard 中选择你的服务
2. 点击 "Logs" 标签查看实时日志
3. 监控错误和性能问题

### 性能优化
1. **免费计划限制**: 
   - 15分钟无活动后会休眠
   - 每月750小时免费运行时间
   - 512MB RAM

2. **升级建议**:
   - 如果需要24/7运行，考虑升级到付费计划
   - 付费计划提供更多资源和更好的性能

### 域名配置（可选）
如果你有自定义域名：
1. 在 Render Dashboard 中选择你的服务
2. 点击 "Settings" > "Custom Domains"
3. 添加你的域名并配置 DNS

## 🚨 常见问题

### 构建失败
- 检查 `package.json` 中的依赖是否正确
- 确保 Node.js 版本兼容（项目要求 >=18.0.0）
- 查看构建日志中的具体错误信息

### 环境变量问题
- 确保所有必需的环境变量都已设置
- 检查变量名是否正确（区分大小写）
- 敏感信息不要包含在代码中

### 数据库连接问题
- 验证 Supabase URL 和密钥是否正确
- 确保 Supabase 项目允许来自 Render 的连接

### 支付功能问题
- 确认 Stripe 密钥是否为生产环境密钥
- 检查 webhook URL 是否正确配置

## 📞 获取帮助

如果遇到问题：
1. 查看 Render 官方文档：https://render.com/docs
2. 检查项目的 GitHub Issues
3. 联系技术支持

---

**恭喜！** 你的 Dvit Golf 定制化应用现在已经在 Render 上运行了！🎉