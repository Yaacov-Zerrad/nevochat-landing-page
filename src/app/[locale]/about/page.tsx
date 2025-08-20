import Header from '@/components/Header';
import About from '@/components/About';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <Header />
      <div className="pt-20">
        <About />
        {/* Additional about content can go here */}
      </div>
      <Footer />
    </main>
  );
}
