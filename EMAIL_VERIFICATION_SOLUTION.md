# 邮件验证问题解决方案

## 问题诊断结果

通过系统检查发现以下问题：

1. **Supabase使用默认SMTP服务**，有严格的邮箱域名限制
2. **Gmail域名被拒绝**，只有少数域名（如outlook.com）被允许
3. **需要配置自定义SMTP服务器**来解决邮件发送限制

## 解决方案

### 方案1：配置自定义SMTP（推荐）

1. **登录Supabase Dashboard**
   - 访问：https://supabase.com/dashboard
   - 选择项目：`tpzbipzpefiqqoirzrme`

2. **进入认证设置**
   - 导航到：Authentication > Settings
   - 滚动到 "SMTP Settings" 部分

3. **启用自定义SMTP**
   - 勾选 "Enable custom SMTP"
   - 填入以下配置：

```
Sender name: Dvit Golf
Sender email: dvitgolf@gmail.com
Host: smtp.gmail.com
Port: 587
Username: dvitgolf@gmail.com
Password: wkvseabcnssuobrw
Secure: Yes (TLS)
```

4. **保存并测试**
   - 点击 "Save" 保存配置
   - 运行测试脚本验证功能

### 方案2：临时解决方案

如果无法立即配置SMTP，可以：

1. **使用允许的邮箱域名**
   - 测试时使用 `@outlook.com` 邮箱
   - 避免使用 `@gmail.com` 等被限制的域名

2. **手动验证用户**
   - 在Supabase Dashboard中手动标记用户为已验证

## 测试步骤

配置完成后，运行以下命令测试：

```bash
# 测试SMTP配置后的邮件发送
node test-email-after-smtp-config.js
```

## 验证成功标志

- 用户注册后收到验证邮件
- 邮件来源显示为 "Dvit Golf"
- 点击验证链接后可正常登录

## 故障排除

如果仍未收到邮件：

1. **检查Gmail设置**
   - 确保启用了"两步验证"
   - 使用"应用专用密码"而非普通密码

2. **检查邮箱**
   - 查看垃圾邮件文件夹
   - 检查邮件过滤规则

3. **查看Supabase日志**
   - 在Dashboard中查看邮件发送日志
   - 检查是否有错误信息

## 相关文件

- `configure-supabase-smtp.js` - SMTP配置指导脚本
- `test-email-after-smtp-config.js` - 邮件功能测试脚本
- `check-supabase-config.js` - 系统配置检查脚本