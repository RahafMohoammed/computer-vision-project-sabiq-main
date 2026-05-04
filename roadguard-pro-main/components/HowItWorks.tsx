import { useLang } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Camera, Search, MapPin, Bell } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useLang();
  const ref = useScrollReveal();

  const steps = [
    { num: 1, icon: Camera, title: 'capture', desc: 'captureDesc' },
    { num: 2, icon: Search, title: 'detect', desc: 'detectDesc' },
    { num: 3, icon: MapPin, title: 'locate', desc: 'locateDesc' },
    { num: 4, icon: Bell, title: 'notify', desc: 'notifyDesc' },
  ];

  return (
    <section id="how" ref={ref} className="py-24 noise-overlay">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 fade-up">{t('howItWorks')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="rounded-2xl border border-border bg-card p-6 text-center fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="text-xs font-mono text-primary mb-3">0{s.num}</div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <s.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{t(s.title)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(s.desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
