import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-white font-medium">{currentLanguage.name}</span>
      </motion.button>
      
      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => i18n.changeLanguage(language.code)}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
              i18n.language === language.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
