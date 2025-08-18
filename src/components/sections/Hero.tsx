import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const scrollToServices = () => {
    const element = document.querySelector('#services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-primary-800">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent animate-pulse"></div>
        </div>
        
        {/* Floating orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-neon-green/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-40 right-32 w-24 h-24 bg-neon-blue/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-32 left-1/3 w-20 h-20 bg-primary-400/30 rounded-full blur-xl"
        />
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Main heading */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight"
            >
              {t('hero.title')}
              <br />
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="bg-gradient-to-r from-neon-green to-primary-400 bg-clip-text text-transparent animate-glow"
              >
                {t('hero.highlight')}
              </motion.span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToServices()}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-glow"
            >
              {t('hero.cta')}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToServices()}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('hero.learnMore')}
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="pt-16"
          >
            <motion.button
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={scrollToServices}
              className="text-white hover:text-primary-400 transition-colors duration-300"
            >
              <ChevronDownIcon className="h-8 w-8 mx-auto" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
