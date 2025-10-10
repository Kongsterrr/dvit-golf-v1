-- Dvit Golf Modular Putter 初始数据
-- 对应Stripe产品数据

-- 清空现有数据（如果需要重新导入）
-- TRUNCATE TABLE products CASCADE;

-- 插入基础产品
INSERT INTO products (stripe_product_id, stripe_price_id, name, description, category, subcategory, base_price, is_default, sort_order) VALUES
('prod_TC1tVw61VJFBX5', 'price_1SFdpl6LJHHneEe1HREAKHbM', 'Dvit Modular Putter', '高端模块化高尔夫推杆，支持多种材质和配重系统定制', 'base', 'standard', 899.00, true, 1)
ON CONFLICT (stripe_product_id) DO UPDATE SET
    stripe_price_id = EXCLUDED.stripe_price_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    updated_at = NOW();

-- 插入Face Deck材质选项
INSERT INTO products (stripe_product_id, stripe_price_id, name, description, category, subcategory, base_price, is_default, sort_order) VALUES
('prod_TC1ti9WNHjBTQF', 'price_1SFdpv6LJHHneEe166IPPBJv', 'Face Deck - 6061铝合金', '6061铝合金Face Deck，轻量化设计，优异的手感', 'face_deck', 'aluminum_6061', 0.00, true, 1),
('prod_TC1tbUBf8DcjCk', 'price_1SFdq56LJHHneEe1xpVvEJry', 'Face Deck - 铜合金', '铜合金Face Deck，经典材质，卓越的击球感受', 'face_deck', 'copper_alloy', 150.00, false, 2),
('prod_TC1tqw8ceOuvs0', 'price_1SFdqD6LJHHneEe1Lzh6f5Vu', 'Face Deck - 303不锈钢', '303不锈钢Face Deck，耐用性强，专业级选择', 'face_deck', 'stainless_steel_303', 120.00, false, 3),
('prod_TC1uKY3ZYyFruH', 'price_1SFdqL6LJHHneEe1ikMMBEX1', 'Face Deck - 聚合物', '聚合物Face Deck，创新材质，独特的击球体验', 'face_deck', 'polymer', 80.00, false, 4)
ON CONFLICT (stripe_product_id) DO UPDATE SET
    stripe_price_id = EXCLUDED.stripe_price_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    updated_at = NOW();

-- 插入配重系统选项
INSERT INTO products (stripe_product_id, stripe_price_id, name, description, category, subcategory, base_price, is_default, sort_order) VALUES
('prod_TC1uBfM8eAQCR6', 'price_1SFdqU6LJHHneEe1xHi5akIw', '配重系统 - Long Wing', 'Long Wing配重系统，提供更大的稳定性和惯性矩', 'weight_system', 'long_wing', 0.00, true, 1),
('prod_TC1uxe6VcQ5oCd', 'price_1SFdqc6LJHHneEe1y7pViXw2', '配重系统 - Short Wing', 'Short Wing配重系统，更灵活的操控性和精准度', 'weight_system', 'short_wing', 50.00, false, 2)
ON CONFLICT (stripe_product_id) DO UPDATE SET
    stripe_price_id = EXCLUDED.stripe_price_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    updated_at = NOW();

-- 插入系统设置
INSERT INTO system_settings (key, value, description, is_public) VALUES
('site_name', '"Dvit Golf"', '网站名称', true),
('base_currency', '"USD"', '基础货币', true),
('tax_rate', '0.08', '税率', true),
('shipping_cost', '25.00', '运费', true),
('free_shipping_threshold', '1000.00', '免运费门槛', true),
('max_configurations_per_user', '10', '每用户最大配置数量', false),
('enable_3d_preview', 'true', '启用3D预览', true),
('support_email', '"support@dvitgolf.com"', '客服邮箱', true),
('company_address', '{"street": "123 Golf Street", "city": "San Francisco", "state": "CA", "zip": "94102", "country": "USA"}', '公司地址', true)
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 插入示例产品资源（3D模型和图片）
INSERT INTO product_assets (product_id, asset_type, file_url, file_name, alt_text, is_primary, sort_order) 
SELECT 
    p.id,
    '3d_model',
    '/models/dvit-putter-base.glb',
    'dvit-putter-base.glb',
    'Dvit Modular Putter 3D Model',
    true,
    1
FROM products p 
WHERE p.category = 'base'
ON CONFLICT DO NOTHING;

-- 为Face Deck材质添加3D模型
INSERT INTO product_assets (product_id, asset_type, file_url, file_name, alt_text, sort_order)
SELECT 
    p.id,
    '3d_model',
    CASE 
        WHEN p.subcategory = 'aluminum_6061' THEN '/models/face-deck-aluminum.glb'
        WHEN p.subcategory = 'copper_alloy' THEN '/models/face-deck-copper.glb'
        WHEN p.subcategory = 'stainless_steel_303' THEN '/models/face-deck-steel.glb'
        WHEN p.subcategory = 'polymer' THEN '/models/face-deck-polymer.glb'
    END,
    CASE 
        WHEN p.subcategory = 'aluminum_6061' THEN 'face-deck-aluminum.glb'
        WHEN p.subcategory = 'copper_alloy' THEN 'face-deck-copper.glb'
        WHEN p.subcategory = 'stainless_steel_303' THEN 'face-deck-steel.glb'
        WHEN p.subcategory = 'polymer' THEN 'face-deck-polymer.glb'
    END,
    p.name || ' 3D Model',
    1
FROM products p 
WHERE p.category = 'face_deck'
ON CONFLICT DO NOTHING;

-- 为配重系统添加3D模型
INSERT INTO product_assets (product_id, asset_type, file_url, file_name, alt_text, sort_order)
SELECT 
    p.id,
    '3d_model',
    CASE 
        WHEN p.subcategory = 'long_wing' THEN '/models/weight-long-wing.glb'
        WHEN p.subcategory = 'short_wing' THEN '/models/weight-short-wing.glb'
    END,
    CASE 
        WHEN p.subcategory = 'long_wing' THEN 'weight-long-wing.glb'
        WHEN p.subcategory = 'short_wing' THEN 'weight-short-wing.glb'
    END,
    p.name || ' 3D Model',
    1
FROM products p 
WHERE p.category = 'weight_system'
ON CONFLICT DO NOTHING;