'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const allLanguages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'he', label: 'עברית', flag: '🇮🇱', countryRestricted: 'IL' },
];

export default function LanguageToggle() {
  const [currentLocale, setCurrentLocale] = useState<'en' | 'fr' | 'he'>('fr');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [languages, setLanguages] = useState(allLanguages);

  useEffect(() => {
    setMounted(true);
    
    // Détecter le pays de l'utilisateur
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserCountry(data.country_code);
        
        // Filtrer les langues selon le pays
        const availableLanguages = allLanguages.filter(lang => {
          if (lang.countryRestricted) {
            return data.country_code === lang.countryRestricted;
          }
          return true;
        });
        setLanguages(availableLanguages);
      } catch (error) {
        console.error('Erreur de détection du pays:', error);
        // En cas d'erreur, afficher toutes les langues sauf l'hébreu
        setLanguages(allLanguages.filter(lang => !lang.countryRestricted));
      }
    };
    
    detectCountry();
    
    const savedLocale = localStorage.getItem('locale') as 'en' | 'fr' | 'he' | null;
    if (savedLocale && ['en', 'fr', 'he'].includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    }
  }, []);

  const changeLanguage = (locale: 'en' | 'fr' | 'he') => {
    localStorage.setItem('locale', locale);
    setCurrentLocale(locale);
    setIsOpen(false);
    // Reload to apply new locale
    window.location.reload();
  };

  if (!mounted) {
    return (
      <button className="relative p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
        <Globe className="h-5 w-5" />
      </button>
    );
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <Globe className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code as 'en' | 'fr' | 'he')}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentLocale === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                  {currentLocale === lang.code && (
                    <span className="ml-auto text-blue-500">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
