# Supabase 配置设置指南

## 📋 获取 Supabase 认证信息

### 步骤 1: 登录 Supabase Dashboard
1. 访问 [https://supabase.com](https://supabase.com)
2. 登录您的账户
3. 选择您的 Dvit Golf 项目

### 步骤 2: 获取 API 配置信息
1. 在项目仪表板中，点击左侧菜单的 **Settings** (设置)
2. 选择 **API** 选项卡
3. 您将看到以下信息：

#### 🔗 Project URL
```
https://your-project-id.supabase.co
```

#### 🔑 API Keys
- **anon / public**: 用于客户端应用 (以 `eyJ` 开头)
- **service_role**: 用于服务端操作 (以 `eyJ` 开头，具有完整权限)

### 步骤 3: 配置本地环境
1. 打开项目根目录下的 `.env.local` 文件
2. 填入您的配置信息：

```bash
# 替换为您的实际信息
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 步骤 4: 验证配置
配置完成后，我将能够：
- ✅ 直接读取和写入 Supabase 数据库
- ✅ 同步所有 Stripe 产品到 products 表
- ✅ 执行数据库查询和更新操作

## 🔒 安全注意事项

### Service Role Key 权限
- **完整数据库访问权限**
- **绕过 Row Level Security (RLS)**
- **仅用于服务端操作**
- **请妥善保管，不要泄露**

### 最佳实践
1. **开发完成后重新生成密钥**
2. **生产环境使用不同的密钥**
3. **定期轮换 API 密钥**
4. **监控 API 使用情况**

## 📊 配置完成后的操作

一旦您填入了正确的配置信息，我将立即执行以下操作：

### 1. 数据同步 🔄
- 将所有 7 个 Stripe 产品同步到 Supabase
- 验证数据完整性
- 设置正确的产品关系

### 2. 数据验证 ✅
- 检查产品配置
- 验证价格计算
- 确认默认选项设置

### 3. 准备前端开发 🚀
- 产品数据结构完整
- API 端点就绪
- 开始构建用户界面

## 🆘 常见问题

### Q: 找不到 API 密钥？
A: 确保您在正确的项目中，API 密钥在 Settings > API 页面

### Q: 密钥格式不正确？
A: 密钥应该以 `eyJ` 开头，是一个很长的字符串

### Q: 权限错误？
A: 确保使用的是 `service_role` 密钥，而不是 `anon` 密钥

### Q: 项目 URL 格式？
A: 格式应该是 `https://your-project-id.supabase.co`

---

**准备好了吗？** 请填入您的 Supabase 配置信息到 `.env.local` 文件中，我将立即开始数据同步操作！