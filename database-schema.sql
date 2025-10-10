-- Dvit Golf Modular Putter 数据库设计
-- 创建时间: 2024

-- 1. 产品表 (已创建)
-- 存储所有产品信息，包括基础产品和可定制组件
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_product_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'base', 'face_deck', 'weight_system'
    subcategory VARCHAR(100), -- 材质类型或配重类型
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户配置表
-- 存储用户的定制配置
CREATE TABLE IF NOT EXISTS user_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    base_product_id UUID REFERENCES products(id),
    face_deck_product_id UUID REFERENCES products(id),
    weight_system_product_id UUID REFERENCES products(id),
    total_price DECIMAL(10,2) NOT NULL,
    is_saved BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 订单表
-- 存储完整的订单信息
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_payment_link_id VARCHAR(255),
    configuration_id UUID REFERENCES user_configurations(id),
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    shipping_address JSONB,
    billing_address JSONB,
    order_items JSONB NOT NULL, -- 详细的订单项目信息
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 订单项目表
-- 存储订单中的具体产品项目
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_snapshot JSONB, -- 产品信息快照
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 用户资料扩展表
-- 扩展用户信息
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    golf_handicap DECIMAL(4,1),
    preferred_hand VARCHAR(10), -- 'left', 'right'
    shipping_address JSONB,
    billing_address JSONB,
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 邮件日志表
-- 记录发送的邮件
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email_type VARCHAR(100) NOT NULL, -- 'welcome', 'order_confirmation', 'password_reset', etc.
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    template_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 产品图片表
-- 存储产品的3D模型和图片信息
CREATE TABLE IF NOT EXISTS product_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- '3d_model', 'image', 'texture'
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 系统设置表
-- 存储系统配置
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_user_configurations_user_id ON user_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- RLS (Row Level Security) 策略
-- 启用RLS
ALTER TABLE user_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- 用户配置RLS策略
CREATE POLICY "Users can view own configurations" ON user_configurations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configurations" ON user_configurations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configurations" ON user_configurations
    FOR UPDATE USING (auth.uid() = user_id);

-- 订单RLS策略
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户资料RLS策略
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 产品表公开访问（只读）
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (is_active = true);

-- 产品资源公开访问（只读）
ALTER TABLE product_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product assets are viewable by everyone" ON product_assets
    FOR SELECT USING (true);

-- 系统设置公开访问（只读公开设置）
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings are viewable by everyone" ON system_settings
    FOR SELECT USING (is_public = true);