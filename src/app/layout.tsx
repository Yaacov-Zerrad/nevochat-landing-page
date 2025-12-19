'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import { AccountProvider } from '@/contexts/AccountContext'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${inter.className}  bg-gradient-to-br from-primary-50 to-primary-200 dark:from-gray-900 dark:to-primary-700`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <AccountProvider>
              {children}
            </AccountProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
