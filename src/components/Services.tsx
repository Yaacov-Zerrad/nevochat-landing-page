'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  GlobeAltIcon, 
  ChatBubbleLeftRightIcon, 
  PuzzlePieceIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Services = () => {
  const t = useTranslations('services');

  const services = [
    {
      key: 'websites',
      icon: GlobeAltIcon,
      color: 'from-neon-green to-emerald-500',
      delay: 0.1,
    },
    {
      key: 'chatbots',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-neon-cyan to-blue-500',
      delay: 0.2,
    },
    {
      key: 'integrations',
      icon: PuzzlePieceIcon,
      color: 'from-neon-pink to-purple-500',
      delay: 0.3,
    },
  ];

  const integrationLogos = [
    { 
      name: 'WhatsApp', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
        </svg>
      )
    },
    { 
      name: 'WordPress', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#21759B">
          <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.105l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-.963 0-1.641.84-1.641 1.742 0 .811.467 1.499.963 2.31.375.645.81 1.474.81 2.67 0 .811-.312 1.757-.735 3.08L16.469 6.825zM12 2.988c-.264 0-.52.01-.777.025L15.17 18.853c2.25-1.309 3.771-3.73 3.771-6.541 0-1.744-.6-3.356-1.615-4.624C16.835 5.24 14.6 4.104 12 2.988zM2.985 12c0 3.042 1.509 5.734 3.818 7.369L3.265 9.325C3.033 10.169 2.985 11.068 2.985 12z"/>
        </svg>
      )
    },
    { 
      name: 'Google Sheets', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0F9D58">
          <path d="M11.318 12.545H7.91v-1.909h3.41v1.91zM14.728 0v6h6l-6-6zm1.363 10.636h-3.41v1.909h3.41v-1.91zm0 3.273h-3.41v1.909h3.41v-1.91zM20.727 6v1.5c0 .41-.338.75-.75.75s-.75-.34-.75-.75V7.5h-6.75c-.422 0-.75-.33-.75-.75V0H3.75c-.422 0-.75.33-.75.75v22.5c0 .42.328.75.75.75h16.5c.422 0 .75-.33.75-.75V6h.477zM11.318 16.364H7.91v-1.91h3.41v1.91zm5.864-5.728c.422 0 .75.34.75.75v7.5c0 .42-.328.75-.75.75H6.136c-.422 0-.75-.33-.75-.75v-7.5c0-.41.328-.75.75-.75h11.046z"/>
        </svg>
      )
    },
    { 
      name: 'Google Calendar', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#4285F4">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.89-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
          <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#833AB4"/>
              <stop offset="50%" stopColor="#FD1D1D"/>
              <stop offset="100%" stopColor="#FCB045"/>
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    { 
      name: 'Telegram', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0088CC">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    },
    { 
      name: 'Gmail', 
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#EA4335">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
        </svg>
      )
    },
  ];

  return (
    <section id="services" className="py-20 bg-black/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: service.delay }}
                className="group"
              >
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700 hover:border-neon-green/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-neon-green/20">
                  <div className={`inline-flex p-4 rounded-lg bg-gradient-to-r ${service.color} mb-6`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {t(`${service.key}.title` as any)}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {t(`${service.key}.description` as any)}
                  </p>
                  
                  <div className="flex items-center text-neon-green hover:text-neon-cyan transition-colors cursor-pointer">
                    <span className="font-medium">{t('learnMore')}</span>
                    <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Integration showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
            <span className="text-neon-green">{t('integrationsTitle')}</span>
          </h3>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {integrationLogos.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-neon-green/50 transition-all duration-300 transform hover:scale-110"
              >
                <div className="flex justify-center mb-2">{integration.logo}</div>
                <div className="text-xs text-gray-400 text-center">{integration.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
