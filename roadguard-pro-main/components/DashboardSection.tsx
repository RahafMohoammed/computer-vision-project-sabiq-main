import { useState, useEffect, useCallback } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { LayoutDashboard, MapPin, Check, Clock, Eye, CircleDot, Zap, Download, AlertTriangle } from 'lucide-react';
import { supabase, type Detection } from '@/lib/supabase';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DashboardSection = () => {
  const { t } = useLang();
  const ref = useScrollReveal();
  const [filter, setFilter] = useState('all');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetections = useCallback(async () => {
    const { data, error } = await supabase
      .from('detections')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDetections(data as Detection[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 30000);
    return () => clearInterval(interval);
  }, [fetchDetections]);

  const filtered = filter === 'all' ? detections : detections.filter(d => d.severity === filter);
  const highCount = detections.filter(d => d.severity === 'high').length;
  const medCount = detections.filter(d => d.severity === 'medium').length;
  const lowCount = detections.filter(d => d.severity === 'low').length;

  const tabs = [
    { key: 'all', label: t('all') },
    { key: 'high', label: t('high') },
    { key: 'medium', label: t('medium') },
    { key: 'low', label: t('low') },
  ];

  const sevBadge = (s: string) => {
    const cls = s === 'high' ? 'border-destructive text-destructive' : s === 'medium' ? 'border-accent text-accent' : 'border-success text-success';
    const label = s === 'high' ? t('high') : s === 'medium' ? t('medium') : t('low');
    return <span className={`text-xs font-mono border px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
  };

  const typeIcon = (tp: string) => tp === 'pothole' ? <CircleDot size={14} /> : tp === 'crack' ? <Zap size={14} /> : <AlertTriangle size={14} />;

  const typeLabel = (tp: string) => {
    if (tp === 'pothole') return t('pothole');
    if (tp === 'crack') return t('longCrack');
    return t('other');
  };

  const statusIcon = (s: string) => {
    if (s === 'fixed') return <span className="flex items-center gap-1 text-success text-xs"><Check size={14} />{t('fixed')}</span>;
    if (s === 'in_review') return <span className="flex items-center gap-1 text-accent text-xs"><Eye size={14} />{t('inReview')}</span>;
    return <span className="flex items-center gap-1 text-destructive text-xs"><Clock size={14} />{t('pending')}</span>;
  };

  const exportCSV = () => {
    const header = 'ID,Type,Severity,Confidence,Latitude,Longitude,Status,Date,Google Maps URL\n';
    const rows = detections.map(d =>
      `${d.id},${d.damage_type},${d.severity},${(d.confidence * 100).toFixed(1)}%,${d.latitude},${d.longitude},${d.status},${d.created_at},${d.google_maps_url || ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sabiq-detections.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="dashboard" ref={ref} className="py-24 noise-overlay">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8 fade-up">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={28} className="text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">{t('dashboardTitle')}</h2>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            <Download size={16} />
            {t('exportCSV')}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 fade-up">
          <StatCard label={t('totalDetections')} value={detections.length.toString()} />
          <StatCard label={t('highRiskCount')} value={highCount.toString()} accent />
          <StatCard label={t('mediumRisk')} value={medCount.toString()} />
          <StatCard label={t('lowRisk')} value={lowCount.toString()} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 fade-up flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-x-auto mb-8 fade-up">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">{t('loading')}</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">{t('noData')}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-start p-4 font-medium">{t('type')}</th>
                  <th className="text-start p-4 font-medium">{t('severity')}</th>
                  <th className="text-start p-4 font-medium hidden sm:table-cell">{t('location')}</th>
                  <th className="text-start p-4 font-medium hidden md:table-cell">{t('date')}</th>
                  <th className="text-start p-4 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                    <td className="p-4 flex items-center gap-2">{typeIcon(d.damage_type)}{typeLabel(d.damage_type)}</td>
                    <td className="p-4">{sevBadge(d.severity)}</td>
                    <td className="p-4 hidden sm:table-cell">
                      {d.google_maps_url ? (
                        <a href={d.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <MapPin size={12} />
                          <span className="font-mono text-xs">{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin size={12} />
                          <span className="font-mono text-xs">{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">{statusIcon(d.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Leaflet Map */}
        <div className="rounded-xl border border-border bg-card p-6 fade-up">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">{t('mapPlaceholder')}</h3>
          <div className="relative aspect-[2/1] rounded-lg overflow-hidden">
            <MapContainer
              center={[24.7136, 46.6753]}
              zoom={12}
              className="w-full h-full z-0"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {detections.map(d => {
                const color = d.severity === 'high' ? '#ef4444' : d.severity === 'medium' ? '#f97316' : '#22c55e';
                return (
                  <CircleMarker
                    key={d.id}
                    center={[d.latitude, d.longitude]}
                    radius={8}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 2 }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{typeLabel(d.damage_type)}</strong><br />
                        {t('severity')}: {d.severity}<br />
                        {t('status')}: {d.status}<br />
                        {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
            <div className="absolute bottom-3 end-3 flex gap-3 text-xs text-foreground bg-background/80 backdrop-blur px-3 py-1.5 rounded-lg z-[1000]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" />{t('high')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" />{t('medium')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" />{t('low')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className={`text-2xl font-bold font-mono ${accent ? 'text-destructive' : 'text-foreground'}`}>{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

export default DashboardSection;
