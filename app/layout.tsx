import type { Metadata } from 'next'
import './globals.css'
import Providers from '../components/Providers'

export const metadata: Metadata = {
  title: 'Dvit Golf - 模块化推杆定制',
  description: '体验前所未有的高尔夫推杆定制服务。Dvit Golf提供模块化设计，让您打造专属的完美推杆。',
  keywords: ['高尔夫', '推杆', '定制', '模块化', 'Dvit Golf', '高端装备'],
  authors: [{ name: 'Dvit Golf' }],
  creator: 'Dvit Golf',
  publisher: 'Dvit Golf',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dvitgolf.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Dvit Golf - 模块化推杆定制',
    description: '体验前所未有的高尔夫推杆定制服务',
    url: 'https://dvitgolf.com',
    siteName: 'Dvit Golf',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dvit Golf 模块化推杆',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dvit Golf - 模块化推杆定制',
    description: '体验前所未有的高尔夫推杆定制服务',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-dvit-black text-dvit-white antialiased">
        <div id="root" className="relative">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  )
}