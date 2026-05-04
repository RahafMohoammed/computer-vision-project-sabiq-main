import { useLang } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import logo from '@/assets/logo.png';

const HeroSection = () => {
  const { t } = useLang();
  const ref = useScrollReveal();

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center noise-overlay overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <div className="relative z-10 container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 pt-20">
        {/* Text */}
        <div className="flex-1 text-center lg:text-start fade-up">
          <img src={logo} alt="SABIQ" className="h-28 md:h-32 w-auto mx-auto lg:mx-0 mb-6" />
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8">
            {t('tagline')}
          </p>
          <a
            href="#demo"
            className="inline-block px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity animate-pulse-glow"
          >
            {t('tryNow')}
          </a>
        </div>

        {/* Road Detection Mockup */}
        <div className="flex-1 max-w-lg w-full fade-up" style={{ transitionDelay: '0.2s' }}>
          <RoadMockup />
        </div>
      </div>
    </section>
  );
};

const RoadMockup = () => {
  const { t } = useLang();
  return (
    <div className="relative rounded-2xl border border-border bg-card overflow-hidden aspect-[4/3] shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-card" />
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 flex flex-col items-center justify-around">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1 h-8 bg-foreground/20 rounded" />
        ))}
      </div>

      <div className="absolute top-[20%] start-[15%] w-24 h-20 border-2 border-destructive rounded-md animate-float">
        <span className="absolute -top-6 start-0 text-xs font-mono bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
          {t('pothole')} 94%
        </span>
      </div>

      <div className="absolute top-[55%] end-[20%] w-28 h-14 border-2 border-accent rounded-md animate-float" style={{ animationDelay: '1s' }}>
        <span className="absolute -top-6 start-0 text-xs font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded">
          {t('longCrack')} 87%
        </span>
      </div>

      <div className="absolute bottom-[15%] start-[35%] w-20 h-16 border-2 border-success rounded-md animate-float" style={{ animationDelay: '2s' }}>
        <span className="absolute -top-6 start-0 text-xs font-mono bg-success text-success-foreground px-2 py-0.5 rounded whitespace-nowrap">
          {t('transCrack')} 72%
        </span>
      </div>

      <div className="absolute inset-x-0 h-0.5 bg-primary/60 scan-line" />
    </div>
  );
};

export default HeroSection;
