import Header from '@/components/Header';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <Header />
      <div className="pt-20">
        <Contact />
        {/* Additional contact content can go here */}
      </div>
      <Footer />
    </main>
  );
}
