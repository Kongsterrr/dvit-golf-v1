# Dvit Golf 产品配置总览

## 产品架构

### 基础产品
- **Dvit Modular Putter** - $899.00
  - Stripe Product ID: `prod_TC1tVw61VJFBX5`
  - Stripe Price ID: `price_1SFdpl6LJHHneEe1HREAKHbM`
  - 描述：高端模块化高尔夫推杆，支持多种材质和配重系统定制

### Face Deck 材质选项

| 材质 | 价格 | Stripe Product ID | Stripe Price ID | 特点 |
|------|------|-------------------|-----------------|------|
| **6061铝合金** (默认) | 免费 | `prod_TC1ti9WNHjBTQF` | `price_1SFdpv6LJHHneEe166IPPBJv` | 轻量化设计，优异的手感 |
| **铜合金** | +$150 | `prod_TC1tbUBf8DcjCk` | `price_1SFdq56LJHHneEe1xpVvEJry` | 经典材质，卓越的击球感受 |
| **303不锈钢** | +$120 | `prod_TC1tqw8ceOuvs0` | `price_1SFdqD6LJHHneEe1Lzh6f5Vu` | 耐用性强，专业级选择 |
| **聚合物** | +$80 | `prod_TC1uKY3ZYyFruH` | `price_1SFdqL6LJHHneEe1ikMMBEX1` | 创新材质，独特的击球体验 |

### 配重系统选项

| 系统 | 价格 | Stripe Product ID | Stripe Price ID | 特点 |
|------|------|-------------------|-----------------|------|
| **Long Wing** (默认) | 免费 | `prod_TC1uBfM8eAQCR6` | `price_1SFdqU6LJHHneEe1xHi5akIw` | 更大的稳定性和惯性矩 |
| **Short Wing** | +$50 | `prod_TC1uxe6VcQ5oCd` | `price_1SFdqc6LJHHneEe1y7pViXw2` | 更灵活的操控性和精准度 |

## 定价策略

### 配置组合示例

| Face Deck | Weight System | 总价 |
|-----------|---------------|------|
| 6061铝合金 (默认) | Long Wing (默认) | **$899** |
| 6061铝合金 | Short Wing | **$949** |
| 聚合物 | Long Wing | **$979** |
| 聚合物 | Short Wing | **$1,029** |
| 303不锈钢 | Long Wing | **$1,019** |
| 303不锈钢 | Short Wing | **$1,069** |
| 铜合金 | Long Wing | **$1,049** |
| 铜合金 | Short Wing | **$1,099** |

### 价格区间
- **最低价格**: $899 (基础配置)
- **最高价格**: $1,099 (铜合金 + Short Wing)
- **平均价格**: 约$999

## 数据同步状态

### Stripe 产品状态 ✅
- [x] 7个产品已创建
- [x] 7个价格已配置
- [x] 所有产品均为活跃状态

### Supabase 同步状态 ⚠️
- [x] 基础产品 "Dvit Modular Putter" 已同步
- [ ] **需要同步**: 6个配件产品 (Face Deck + Weight System)

## 同步操作

要将所有Stripe产品同步到Supabase，请执行以下步骤：

1. **在Supabase SQL编辑器中运行**:
   ```sql
   -- 首先运行数据库架构 (如果还未运行)
   \i database-schema.sql
   
   -- 然后同步产品数据
   \i sync-stripe-products.sql
   ```

2. **验证同步结果**:
   ```sql
   SELECT 
       name,
       category,
       subcategory,
       base_price / 100.0 as price_usd,
       is_default
   FROM products 
   ORDER BY category, sort_order;
   ```

## 前端集成建议

### 产品展示逻辑
```javascript
// 获取产品配置
const baseProduct = products.find(p => p.category === 'putter');
const faceDecks = products.filter(p => p.category === 'face_deck');
const weightSystems = products.filter(p => p.category === 'weight_system');

// 计算总价
const calculateTotalPrice = (selectedFaceDeck, selectedWeightSystem) => {
  return baseProduct.base_price + 
         selectedFaceDeck.base_price + 
         selectedWeightSystem.base_price;
};
```

### 默认配置
```javascript
const defaultConfiguration = {
  faceDeck: faceDecks.find(fd => fd.is_default), // 6061铝合金
  weightSystem: weightSystems.find(ws => ws.is_default), // Long Wing
  totalPrice: 89900 // $899.00
};
```

## 3D 模型资源

每个配件组合都应该有对应的3D模型文件：

```
/public/models/
├── face-decks/
│   ├── aluminum-6061.glb
│   ├── copper-alloy.glb
│   ├── stainless-steel-303.glb
│   └── polymer.glb
└── weight-systems/
    ├── long-wing.glb
    └── short-wing.glb
```

## 下一步行动

1. ✅ **立即执行**: 运行 `sync-stripe-products.sql` 同步所有产品
2. 🔄 **开发阶段**: 开始前端产品配置器开发
3. 🎨 **设计阶段**: 准备3D模型和产品图片资源
4. 🧪 **测试阶段**: 验证Stripe支付流程集成