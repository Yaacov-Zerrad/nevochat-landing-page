import Header from '@/components/Header';
import Portfolio from '@/components/Portfolio';
import Footer from '@/components/Footer';

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
      <Header />
      <div className="pt-20">
        <Portfolio />
      </div>
      <Footer />
    </main>
  );
}
