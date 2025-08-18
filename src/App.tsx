import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import Integrations from './components/sections/Integrations';
import Contact from './components/sections/Contact';
import WhatsAppButton from './components/ui/WhatsAppButton';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set document direction based on language
    const isRTL = i18n.language === 'he';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Services />
        <Integrations />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
