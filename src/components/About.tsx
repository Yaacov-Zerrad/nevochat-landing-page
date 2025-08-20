'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  UserGroupIcon, 
  GlobeAltIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const About = () => {
  const t = useTranslations('about');

  const features = [
    t('features.websites'),
    t('features.chatbots'),
    t('features.integrations'),
    t('features.multiLanguage'),
    t('features.support'),
    t('features.design'),
  ];

  const stats = [
    { number: '50+', label: t('stats.projectsCompleted') },
    { number: '3', label: t('stats.languagesSupported') },
    { number: '100%', label: t('stats.clientSatisfaction') },
    { number: '24/6 :)', label: t('stats.supportAvailable') },
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {t('description')}
            </p>

            <div className="mb-8">
              <p className="text-lg text-neon-green font-semibold mb-4">
                {t('languages')}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-neon-green flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="px-8 py-4 bg-gradient-to-r from-neon-green to-emerald-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-105"
            >
              {t('cta')}
            </motion.button>
          </motion.div>

          {/* Right side - Stats and visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-neon-green/50 transition-all duration-300 text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-neon-green mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Visual elements */}
            <div className="relative bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center justify-center space-x-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-4 bg-gradient-to-r from-neon-green to-emerald-500 rounded-full"
                >
                  <GlobeAltIcon className="h-8 w-8 text-white" />
                </motion.div>
                
                <div className="text-4xl">🤝</div>
                
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="p-4 bg-gradient-to-r from-neon-cyan to-blue-500 rounded-full"
                >
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-gray-300">{t('buildingTogether')}</p>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-neon-yellow/20 rounded-full animate-ping"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-neon-pink/20 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
