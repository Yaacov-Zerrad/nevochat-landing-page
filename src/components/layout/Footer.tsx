import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-950 text-white py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Logo and tagline */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">
              <span className="text-primary-500">Nevo</span>chat
            </h3>
            <p className="text-gray-400 text-lg">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Social links or additional info can be added here */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                © {currentYear} {t('footer.company')}. {t('footer.rights')}
              </p>
              
              {/* Language indicator */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">
                  Available in: עברית • English • Français
                </span>
              </div>
            </div>
          </div>

          {/* Decorative element */}
          <div className="mt-8">
            <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-primary-600 mx-auto rounded-full"></div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
