'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const LanguageSwitcher = () => {
  const router = useRouter();
  const params = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = params?.locale as string || 'he';

  const languages = [
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const handleLanguageChange = (locale: string) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-neon-green/30 hover:border-neon-green transition-colors"
      >
        <GlobeAltIcon className="h-4 w-4 text-neon-green" />
        <span className="text-white text-sm">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-0 mt-2 bg-gray-800 border border-neon-green/30 rounded-lg shadow-lg overflow-hidden z-50"
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
                currentLocale === language.code ? 'bg-gray-700 text-neon-green' : 'text-white'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
