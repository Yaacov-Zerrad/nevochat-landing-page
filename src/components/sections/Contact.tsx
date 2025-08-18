import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon, UserIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    
    setIsSubmitting(false);
    alert('Message sent successfully!'); // Replace with a proper notification
  };

  return (
    <section id="contact" className={`py-20 bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Get in Touch
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <EnvelopeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300">Email</p>
                    <p className="text-white font-semibold">contact@nevochat.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <PhoneIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-300">Phone</p>
                    <p className="text-white font-semibold">+972-XX-XXX-XXXX</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages we speak */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                {t('features.multilingual.title')}
              </h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { lang: 'Hebrew', flag: '🇮🇱' },
                  { lang: 'English', flag: '🇺🇸' },
                  { lang: 'Français', flag: '🇫🇷' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg"
                  >
                    <span className="text-lg">{item.flag}</span>
                    <span className="text-white text-sm">{item.lang}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('contact.form.name')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.namePlaceholder')}
                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('contact.form.email')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.emailPlaceholder')}
                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('contact.form.phone')} <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.phonePlaceholder')}
                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300`}
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('contact.form.message')} <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} pointer-events-none`}>
                    <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t('contact.form.messagePlaceholder')}
                    className={`block w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  t('contact.form.submit')
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
