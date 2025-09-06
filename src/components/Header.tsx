'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';
import LoginButton from './LoginButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('nav');
  const params = useParams();
  const currentLocale = params?.locale as string || 'he';

  const menuItems = [
    { key: 'home', href: '#hero' },
    { key: 'services', href: '#services' },
    { key: 'about', href: '#about' },
    { key: 'contact', href: '#contact' },
  ];
  // if language == he reverse menuItems
    if (currentLocale === 'he'&& !isMenuOpen) {
        menuItems.reverse();
    }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-neon-green/20">
      <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            {/* Logo Icon */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-neon-green/30">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            
            {/* Brand Text */}
            <div className="flex flex-col">
              <div className="text-2xl font-black bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                NevoChat
              </div>
              <div className="text-xs text-gray-400 font-medium -mt-1 tracking-wider">
                AI POWERED
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" dir='ltr' >
            {currentLocale === 'he' && <LanguageSwitcher />}
            {menuItems.map((item, index) => (
              <motion.a
                key={item.key}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-white hover:text-neon-green transition-colors duration-300 font-medium"
              >
                {t(item.key as any)}
              </motion.a>
            ))}
            {currentLocale !== 'he' && <LanguageSwitcher />}
            <LoginButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-neon-green transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-neon-green/20"
          >
            {menuItems.map((item, index) => (
              <motion.a
                key={item.key}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="block py-2 text-white hover:text-neon-green transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.key as any)}
              </motion.a>
            ))}
            <div className="mt-4 pt-4 border-t border-neon-green/20">
              <LoginButton />
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Header;
