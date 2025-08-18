import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Integrations: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const integrations = [
    {
      key: 'whatsapp',
      name: t('integrations.items.whatsapp.name'),
      logo: '/images/whatsapp-logo.png', // You can add this image later
      description: t('integrations.items.whatsapp.description'),
      color: 'bg-green-100 border-green-200',
    },
    {
      key: 'wordpress',
      name: t('integrations.items.wordpress.name'),
      logo: '/images/wordpress-logo.png',
      description: t('integrations.items.wordpress.description'),
      color: 'bg-blue-100 border-blue-200',
    },
    {
      key: 'googleSheets',
      name: t('integrations.items.googleSheets.name'),
      logo: '/images/google-sheets-logo.png',
      description: t('integrations.items.googleSheets.description'),
      color: 'bg-green-100 border-green-200',
    },
    {
      key: 'googleCalendar',
      name: t('integrations.items.googleCalendar.name'),
      logo: '/images/google-calendar-logo.png',
      description: t('integrations.items.googleCalendar.description'),
      color: 'bg-yellow-100 border-yellow-200',
    },
    {
      key: 'facebook',
      name: t('integrations.items.facebook.name'),
      logo: '/images/facebook-logo.png',
      description: t('integrations.items.facebook.description'),
      color: 'bg-blue-100 border-blue-200',
    },
    {
      key: 'instagram',
      name: t('integrations.items.instagram.name'),
      logo: '/images/instagram-logo.png',
      description: t('integrations.items.instagram.description'),
      color: 'bg-pink-100 border-pink-200',
    },
    {
      key: 'telegram',
      name: t('integrations.items.telegram.name'),
      logo: '/images/telegram-logo.png',
      description: t('integrations.items.telegram.description'),
      color: 'bg-blue-100 border-blue-200',
    },
    {
      key: 'customApis',
      name: t('integrations.items.customApis.name'),
      logo: '/images/api-logo.png',
      description: t('integrations.items.customApis.description'),
      color: 'bg-purple-100 border-purple-200',
    },
  ];

  return (
    <section className={`py-20 bg-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('integrations.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('integrations.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
              className={`p-6 rounded-xl border-2 ${integration.color} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
            >
              <div className="text-center space-y-3">
                {/* Placeholder for logo - you can replace with actual images */}
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-gray-600">
                    {integration.name.substring(0, 2)}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                  {integration.name}
                </h3>
                
                <p className="text-sm text-gray-600">
                  {integration.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            {t('integrations.callToAction')}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary-500 text-white font-semibold rounded-full hover:bg-primary-600 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            {t('integrations.customButton')}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Integrations;
