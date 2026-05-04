import { useState, useRef, useCallback } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/lib/supabase';
import { UploadCloud, Search, Download, Image as ImageIcon, AlertTriangle, CheckCircle, MapPin, CircleDot, Zap, X, Loader2 } from 'lucide-react';

interface ApiDetection {
  label?: string;
  class?: string;
  name?: string;
  type?: string;
  confidence?: number;
  score?: number;
  severity?: string;
  [key: string]: unknown;
}

interface DetectionResult {
  type: string;
  confidence: number;
  severity: 'high' | 'medium' | 'low';
  lat: number;
  lng: number;
}

const mapDamageType = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes('pothole')) return 'pothole';
  if (l.includes('alligator') || l.includes('crocodile')) return 'alligatorCrack';
  if (l.includes('long') || l.includes('longitudinal')) return 'longCrack';
  if (l.includes('trans')) return 'transCrack';
  if (l.includes('crack')) return 'crack';
  return 'other';
};

const mapSeverity = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
};

const DemoSection = () => {
  const { t } = useLang();
  const ref = useScrollReveal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];

  const handleFile = (f: File) => {
    if (f.type.startsWith('image/') || f.type.startsWith('video/')) {
      setFile(f);
      setError(null);
      if (f.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(f));
      } else {
        setPreview(null);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Step 1: Preparing file
      setCurrentStep(0);
      await delay(500);

      // Step 2: Sending to model
      setCurrentStep(1);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://rahaf2001-sabiq-api.hf.space/detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Step 3: Processing results
      setCurrentStep(2);
      await delay(400);

      // Parse API response into our format
      const detectionArray: ApiDetection[] = Array.isArray(data) ? data : data.detections || data.results || data.predictions || [data];

      const parsed: DetectionResult[] = detectionArray
        .filter((d: ApiDetection) => d && (d.label || d.class || d.name || d.type))
        .map((d: ApiDetection) => {
          const label = (d.label || d.class || d.name || d.type || 'other') as string;
          const conf = d.confidence ?? d.score ?? 0.7;
          const sev = (d.severity as 'high' | 'medium' | 'low') || mapSeverity(conf);
          return {
            type: mapDamageType(label),
            confidence: Math.round(conf * 100),
            severity: sev,
            lat: 24.7136,
            lng: 46.6753,
          };
        });

      // If API returned empty but no error, show that
      if (parsed.length === 0) {
        // Could be no detections found
        setResults([]);
        setCurrentStep(4);
        await delay(300);
        setProcessing(false);
        setShowResults(true);
        return;
      }

      // Step 4: Saving to database
      setCurrentStep(3);
      const supabaseRows = parsed.map(d => ({
        damage_type: d.type === 'pothole' ? 'pothole' : d.type === 'other' ? 'other' : 'crack',
        confidence: d.confidence / 100,
        severity: d.severity,
        latitude: d.lat,
        longitude: d.lng,
        status: 'pending' as const,
        google_maps_url: `https://www.google.com/maps?q=${d.lat},${d.lng}`,
      }));

      await supabase.from('detections').insert(supabaseRows);
      await delay(300);

      // Step 5: Done
      setCurrentStep(4);
      await delay(300);

      setResults(parsed);
      setProcessing(false);
      setShowResults(true);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setProcessing(false);
      setCurrentStep(-1);
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setProcessing(false);
    setCurrentStep(-1);
    setShowResults(false);
    setResults([]);
    setError(null);
  };

  const exportCSV = () => {
    const header = 'Type,Confidence,Severity,Latitude,Longitude\n';
    const rows = results.map(r => `${r.type},${r.confidence}%,${r.severity},${r.lat},${r.lng}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sabiq-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityBadge = (s: string) => {
    const cls = s === 'high' ? 'border-destructive text-destructive' : s === 'medium' ? 'border-accent text-accent' : 'border-success text-success';
    const label = s === 'high' ? t('high') : s === 'medium' ? t('medium') : t('low');
    return <span className={`text-xs font-mono border px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
  };

  const typeIcon = (tp: string) => {
    if (tp === 'pothole') return <CircleDot size={16} />;
    return <Zap size={16} />;
  };

  const highCount = results.filter(r => r.severity === 'high').length;
  const medCount = results.filter(r => r.severity === 'medium').length;
  const lowCount = results.filter(r => r.severity === 'low').length;

  return (
    <section id="demo" ref={ref} className="py-24 relative noise-overlay">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 fade-up">{t('uploadTitle')}</h2>
        <p className="text-center text-muted-foreground mb-12 text-sm font-mono fade-up">{t('mockNote')}</p>

        {!showResults ? (
          <div className="fade-up">
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-colors bg-card/50"
              >
                <UploadCloud size={48} className="text-muted-foreground" />
                <p className="text-muted-foreground">{t('dragDrop')}</p>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ImageIcon size={20} className="text-primary" />
                    <span className="font-mono text-sm truncate max-w-xs">{file.name}</span>
                  </div>
                  <button onClick={reset} className="p-1 hover:bg-muted rounded"><X size={18} className="text-muted-foreground" /></button>
                </div>

                {preview && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full max-h-64 object-contain bg-muted/30" />
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                  </div>
                )}

                {!processing ? (
                  <button onClick={analyze} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <Search size={18} />
                    {t('analyzeBtn')}
                  </button>
                ) : (
                  <div className="space-y-3 mt-4">
                    {steps.map((s, i) => (
                      <div key={s} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors duration-300 ${
                          i < currentStep ? 'bg-success' : i === currentStep ? 'bg-accent animate-pulse' : 'bg-muted'
                        }`} />
                        <span className={`text-sm ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>{t(s)}</span>
                        {i === currentStep && <Loader2 size={14} className="animate-spin text-accent" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 fade-up visible">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-success" />
              <h3 className="text-xl font-bold">{t('results')}</h3>
            </div>

            {results.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                {t('noData')}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SummaryCard label={t('totalDefects')} value={results.length} color="text-foreground" />
                  <SummaryCard label={t('highRisk')} value={highCount} color="text-destructive" />
                  <SummaryCard label={t('mediumRisk')} value={medCount} color="text-accent" />
                  <SummaryCard label={t('lowRisk')} value={lowCount} color="text-success" />
                </div>

                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {results.map((r, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 text-sm ${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'} border-b border-border last:border-0`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {typeIcon(r.type)}
                        <span className="truncate">{t(r.type)}</span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground mx-2">{r.confidence}%</span>
                      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mx-2">
                        <MapPin size={12} />
                        <span className="font-mono">{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</span>
                      </div>
                      <div className="ms-2">{severityBadge(r.severity)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-3">
              {results.length > 0 && (
                <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  <Download size={16} />
                  {t('exportCSV')}
                </button>
              )}
              <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors">
                <UploadCloud size={16} />
                {t('newVideo')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SummaryCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-xl border border-border bg-card p-5 text-center">
    <div className={`text-3xl font-bold font-mono ${color}`}>{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

export default DemoSection;
