// 简单的购物车图标检查脚本
console.log('=== 检查购物车图标 ===');

// 检查购物车图标是否存在
const cartIcon = document.querySelector('[data-testid="cart-icon"]') || 
                 document.querySelector('svg[data-lucide="shopping-cart"]') ||
                 document.querySelector('.cart-icon');

if (cartIcon) {
  console.log('✅ 找到购物车图标');
  console.log('图标元素:', cartIcon);
  
  // 检查徽章
  const badge = cartIcon.parentElement?.querySelector('.badge') || 
                cartIcon.parentElement?.querySelector('[class*="badge"]');
  
  if (badge) {
    console.log('✅ 找到购物车徽章');
    console.log('徽章内容:', badge.textContent);
  } else {
    console.log('⚠️ 未找到购物车徽章');
  }
} else {
  console.log('❌ 未找到购物车图标');
  console.log('导航栏内容:', document.querySelector('nav')?.innerHTML || '未找到导航栏');
}
