import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NevoChat - Advanced Digital Solutions',
  description: 'Professional websites and smart chatbots for your business. We develop modern web solutions with AI-powered chatbots, WhatsApp integration, and custom system integrations.',
  keywords: 'web development, chatbots, WhatsApp integration, digital solutions, professional websites, AI chatbots',
  authors: [{ name: 'NevoChat' }],
  creator: 'NevoChat',
  publisher: 'NevoChat',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://nevochat.com',
    title: 'NevoChat - Advanced Digital Solutions',
    description: 'Professional websites and smart chatbots for your business',
    siteName: 'NevoChat',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NevoChat - Advanced Digital Solutions',
    description: 'Professional websites and smart chatbots for your business',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
