'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'

// Import translation files directly
import enMessages from '@/../../i18n/en.json'
import frMessages from '@/../../i18n/fr.json'
import heMessages from '@/../../i18n/he.json'

const messages = {
  en: enMessages,
  fr: frMessages,
  he: heMessages,
}

type Props = {
  children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const [locale, setLocale] = useState<'en' | 'fr' | 'he'>('fr')

  useEffect(() => {
    // Get locale from localStorage on client side
    const savedLocale = localStorage.getItem('locale') as 'en' | 'fr' | 'he' | null
    if (savedLocale && ['en', 'fr', 'he'].includes(savedLocale)) {
      setLocale(savedLocale)
    }
  }, [])

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}
