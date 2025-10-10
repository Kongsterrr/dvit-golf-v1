/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 确保静态导出和服务器端渲染兼容
  output: 'standalone',
  // 禁用严格模式以避免某些部署问题
  reactStrictMode: false,
  // 确保所有环境变量在构建时可用
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig