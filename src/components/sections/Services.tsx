import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ComputerDesktopIcon, 
  ChatBubbleLeftRightIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const Services: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const services = [
    {
      icon: ComputerDesktopIcon,
      titleKey: 'services.websites.title',
      descriptionKey: 'services.websites.description',
      gradient: 'from-blue-500 to-purple-600',
      delay: 0.2,
    },
    {
      icon: ChatBubbleLeftRightIcon,
      titleKey: 'services.chatbots.title',
      descriptionKey: 'services.chatbots.description',
      gradient: 'from-green-500 to-teal-600',
      delay: 0.4,
    },
    {
      icon: Cog6ToothIcon,
      titleKey: 'services.integrations.title',
      descriptionKey: 'services.integrations.description',
      gradient: 'from-purple-500 to-pink-600',
      delay: 0.6,
    },
  ];

  return (
    <section id="services" className={`py-20 bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {t('services.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: service.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 h-full">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow duration-300`}
                >
                  <service.icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
                    {t(service.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(service.descriptionKey)}
                  </p>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
