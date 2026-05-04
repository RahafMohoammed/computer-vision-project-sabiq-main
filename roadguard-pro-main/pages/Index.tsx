import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import DemoSection from '@/components/DemoSection';
import HowItWorks from '@/components/HowItWorks';
import DashboardSection from '@/components/DashboardSection';
import ImpactStats from '@/components/ImpactStats';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <DemoSection />
      <HowItWorks />
      <DashboardSection />
      <ImpactStats />
      <Footer />
    </div>
  );
};

export default Index;
