'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const Footer = () => {
  const t = useTranslations('footer');

  const currentYear = new Date().getFullYear();

  const socialLinks = [
    // { name: 'LinkedIn', icon: '🔗', url: '#' },
    // { name: 'GitHub', icon: '👨‍💻', url: '#' },
    // { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'WhatsApp', icon: '💬', url: 'https://wa.me/972545564449' },
  ];

  const quickLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-black border-t border-neon-green/20">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="md:col-span-2"
          >
            {/* Modern Logo */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-neon-green to-emerald-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-neon-green/30">
                  <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-70 animate-bounce"></div>
              </div>
              
              <div className="flex flex-col">
                <div className="text-4xl font-black bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  NevoChat
                </div>
                <div className="text-sm text-gray-400 font-semibold tracking-widest">
                  INTELLIGENCE • INNOVATION • INTEGRATION
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              {t('description')}
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-xl hover:bg-neon-green hover:text-black transition-all duration-300 transform hover:scale-110"
                  title={link.name}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-neon-green transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className="text-white font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Website Development</li>
              <li>Chatbot Solutions</li>
              <li>System Integration</li>
              <li>Technical Support</li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} NevoChat. {t('rights')}.
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-neon-green transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-neon-green transition-colors">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>

      {/* Floating back to top button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-neon-green to-emerald-500 text-black rounded-full flex items-center justify-center shadow-lg hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-110 z-50"
        title="Back to top"
      >
        ↑
      </motion.button>
    </footer>
  );
};

export default Footer;
