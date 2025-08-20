import Header from '@/components/Header';
import Services from '@/components/Services';
import Footer from '@/components/Footer';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <Header />
      <div className="pt-20">
        <Services />
        {/* Additional detailed services content can go here */}
      </div>
      <Footer />
    </main>
  );
}
