-- 同步Stripe产品到Supabase products表
-- 执行前请确保已运行 database-schema.sql

-- 清空现有产品数据（如果需要重新同步）
-- DELETE FROM products;

-- 插入所有Stripe产品数据
INSERT INTO products (
    stripe_product_id,
    stripe_price_id,
    name,
    description,
    category,
    subcategory,
    base_price,
    is_default,
    is_active,
    sort_order,
    metadata
) VALUES 
-- 1. 基础产品 - Dvit Modular Putter
(
    'prod_TC1tVw61VJFBX5',
    'price_1SFdpl6LJHHneEe1HREAKHbM',
    'Dvit Modular Putter',
    '高端模块化高尔夫推杆，支持多种材质和配重系统定制',
    'putter',
    'base',
    89900,
    true,
    true,
    1,
    '{"stripe_created": 1759854830, "type": "base_product"}'::jsonb
),

-- 2. Face Deck - 6061铝合金 (默认选项，免费)
(
    'prod_TC1ti9WNHjBTQF',
    'price_1SFdpv6LJHHneEe166IPPBJv',
    'Face Deck - 6061铝合金',
    '6061铝合金Face Deck，轻量化设计，优异的手感',
    'face_deck',
    'aluminum',
    0,
    true,
    true,
    2,
    '{"stripe_created": 1759854838, "material": "6061_aluminum", "weight": "light", "feel": "excellent"}'::jsonb
),

-- 3. Face Deck - 铜合金 (+$150)
(
    'prod_TC1tbUBf8DcjCk',
    'price_1SFdq56LJHHneEe1xpVvEJry',
    'Face Deck - 铜合金',
    '铜合金Face Deck，经典材质，卓越的击球感受',
    'face_deck',
    'copper',
    15000,
    false,
    true,
    3,
    '{"stripe_created": 1759854847, "material": "copper_alloy", "weight": "medium", "feel": "classic"}'::jsonb
),

-- 4. Face Deck - 303不锈钢 (+$120)
(
    'prod_TC1tqw8ceOuvs0',
    'price_1SFdqD6LJHHneEe1Lzh6f5Vu',
    'Face Deck - 303不锈钢',
    '303不锈钢Face Deck，耐用性强，专业级选择',
    'face_deck',
    'stainless_steel',
    12000,
    false,
    true,
    4,
    '{"stripe_created": 1759854857, "material": "303_stainless_steel", "weight": "medium", "durability": "high"}'::jsonb
),

-- 5. Face Deck - 聚合物 (+$80)
(
    'prod_TC1uKY3ZYyFruH',
    'price_1SFdqL6LJHHneEe1ikMMBEX1',
    'Face Deck - 聚合物',
    '聚合物Face Deck，创新材质，独特的击球体验',
    'face_deck',
    'polymer',
    8000,
    false,
    true,
    5,
    '{"stripe_created": 1759854865, "material": "polymer", "weight": "light", "innovation": "high"}'::jsonb
),

-- 6. 配重系统 - Long Wing (默认选项，免费)
(
    'prod_TC1uBfM8eAQCR6',
    'price_1SFdqU6LJHHneEe1xHi5akIw',
    '配重系统 - Long Wing',
    'Long Wing配重系统，提供更大的稳定性和惯性矩',
    'weight_system',
    'long_wing',
    0,
    true,
    true,
    6,
    '{"stripe_created": 1759854874, "wing_type": "long", "stability": "high", "moi": "high"}'::jsonb
),

-- 7. 配重系统 - Short Wing (+$50)
(
    'prod_TC1uxe6VcQ5oCd',
    'price_1SFdqc6LJHHneEe1y7pViXw2',
    '配重系统 - Short Wing',
    'Short Wing配重系统，更灵活的操控性和精准度',
    'weight_system',
    'short_wing',
    5000,
    false,
    true,
    7,
    '{"stripe_created": 1759854882, "wing_type": "short", "control": "high", "precision": "high"}'::jsonb
)

ON CONFLICT (stripe_product_id) DO UPDATE SET
    stripe_price_id = EXCLUDED.stripe_price_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    base_price = EXCLUDED.base_price,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    metadata = EXCLUDED.metadata,
    updated_at = CURRENT_TIMESTAMP;

-- 验证插入结果
SELECT 
    name,
    category,
    subcategory,
    base_price / 100.0 as price_usd,
    is_default,
    stripe_product_id
FROM products 
ORDER BY category, sort_order;

-- 显示产品配置组合
SELECT 
    'Face Deck Options:' as section,
    name,
    '$' || (base_price / 100.0)::text as price
FROM products 
WHERE category = 'face_deck'
UNION ALL
SELECT 
    'Weight System Options:' as section,
    name,
    '$' || (base_price / 100.0)::text as price
FROM products 
WHERE category = 'weight_system'
ORDER BY section, price;