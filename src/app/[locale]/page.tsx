import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

// Désactive la génération statique pour cette page
export const dynamic = 'force-dynamic';

export default function HomePage() {
  // return (
  //   <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 overflow-x-hidden">
  //     <Header />
  //     <Hero />
  //     <Services />
  //     <About />
  //     <Contact />
  //     <Footer />
  //     <WhatsAppButton />
  //   </main>
  // );
  return <div>
    Test Plexa green
  </div>
}
