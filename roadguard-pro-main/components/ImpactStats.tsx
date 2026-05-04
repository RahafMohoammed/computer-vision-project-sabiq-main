import { useLang } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const ImpactStats = () => {
  const { t } = useLang();
  const ref = useScrollReveal();

  const stats = [
    { value: '94%', label: t('accuracy') },
    { value: '<2ms', label: t('responseTime') },
    { value: '24/7', label: t('monitoring') },
  ];

  return (
    <section id="impact" ref={ref} className="py-24 noise-overlay">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 fade-up">{t('impact')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-8 text-center fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="text-5xl md:text-6xl font-black font-mono text-gradient mb-3">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
