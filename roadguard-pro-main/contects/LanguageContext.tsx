import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'ar' | 'en';

interface LanguageContextType {
  lang: Lang;
  isRTL: boolean;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  brand: { ar: 'سابِـق', en: 'SABIQ' },
  tagline: { ar: 'حيث كل عثرة تُروى.. قبل أن تُرى', en: 'Where every defect is reported.. before it\'s seen' },
  liveDemo: { ar: 'تجربة النظام', en: 'Live Demo' },
  howItWorks: { ar: 'آلية العمل', en: 'How It Works' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  impact: { ar: 'الأثر', en: 'Impact' },
  tryNow: { ar: 'جرّب الآن', en: 'Try Now' },
  uploadTitle: { ar: 'ارفع فيديو واكتشف التشوهات', en: 'Upload Video & Detect Defects' },
  dragDrop: { ar: 'اسحب الفيديو هنا أو اضغط للرفع', en: 'Drag video here or click to upload' },
  analyzeBtn: { ar: 'تحليل الفيديو', en: 'Analyze Video' },
  results: { ar: 'نتائج التحليل', en: 'Analysis Results' },
  totalDefects: { ar: 'إجمالي التشوهات', en: 'Total Defects' },
  highRisk: { ar: 'خطورة عالية', en: 'High Risk' },
  mediumRisk: { ar: 'خطورة متوسطة', en: 'Medium Risk' },
  lowRisk: { ar: 'خطورة منخفضة', en: 'Low Risk' },
  exportCSV: { ar: 'تصدير CSV لأمانة الرياض', en: 'Export CSV to Municipality' },
  newVideo: { ar: 'فيديو جديد', en: 'New Video' },
  dashboardTitle: { ar: 'لوحة تحكم سابق', en: 'SABIQ Dashboard' },
  type: { ar: 'النوع', en: 'Type' },
  severity: { ar: 'الخطورة', en: 'Severity' },
  location: { ar: 'الموقع', en: 'Location' },
  date: { ar: 'التاريخ', en: 'Date' },
  status: { ar: 'الحالة', en: 'Status' },
  pending: { ar: 'معلق', en: 'Pending' },
  fixed: { ar: 'تم الإصلاح', en: 'Fixed' },
  all: { ar: 'الكل', en: 'All' },
  high: { ar: 'عالي', en: 'High' },
  medium: { ar: 'متوسط', en: 'Medium' },
  low: { ar: 'منخفض', en: 'Low' },
  pothole: { ar: 'حفرة', en: 'Pothole' },
  longCrack: { ar: 'شق طولي', en: 'Longitudinal Crack' },
  transCrack: { ar: 'شق عرضي', en: 'Transverse Crack' },
  alligatorCrack: { ar: 'تشقق تمساحي', en: 'Alligator Crack' },
  other: { ar: 'أخرى', en: 'Other' },
  step1: { ar: 'استخراج الـ frames من الفيديو', en: 'Extracting frames from video' },
  step2: { ar: 'تشغيل نموذج YOLOv8 على كل frame', en: 'Running YOLOv8 on each frame' },
  step3: { ar: 'حساب درجة الخطورة لكل تشوه', en: 'Calculating severity for each defect' },
  step4: { ar: 'تسجيل النتائج في قاعدة البيانات', en: 'Saving results to database' },
  step5: { ar: 'إنشاء التقرير النهائي', en: 'Generating final report' },
  footer: { ar: 'مشروع تخرج · أكاديمية طويق · مسار الذكاء الاصطناعي', en: 'Graduation Project · Tuwaiq Academy · AI Track' },
  capture: { ar: 'التقاط', en: 'Capture' },
  captureDesc: { ar: 'التقاط فيديو للطريق أثناء القيادة باستخدام كاميرا السيارة', en: 'Capture road video while driving using a dashcam' },
  detect: { ar: 'كشف', en: 'Detect' },
  detectDesc: { ar: 'تحليل الفيديو بنموذج YOLOv8 للكشف عن التشوهات تلقائياً', en: 'Analyze video with YOLOv8 model to automatically detect defects' },
  locate: { ar: 'تحديد', en: 'Locate' },
  locateDesc: { ar: 'تحديد الموقع الجغرافي لكل تشوه على الخريطة بدقة', en: 'Precisely locate each defect on the map using GPS' },
  notify: { ar: 'إبلاغ', en: 'Notify' },
  notifyDesc: { ar: 'إرسال تقرير مفصل للجهات المعنية لاتخاذ الإجراء المناسب', en: 'Send detailed report to authorities for appropriate action' },
  accuracy: { ar: 'دقة الكشف', en: 'Detection Accuracy' },
  responseTime: { ar: 'زمن الاستجابة', en: 'Response Time' },
  monitoring: { ar: 'مراقبة مستمرة', en: 'Continuous Monitoring' },
  totalDetections: { ar: 'إجمالي الكشوفات', en: 'Total Detections' },
  highRiskCount: { ar: 'عالية الخطورة', en: 'High Risk' },
  locationsCovered: { ar: 'مواقع مغطاة', en: 'Locations Covered' },
  lastScan: { ar: 'آخر فحص', en: 'Last Scan' },
  mockNote: { ar: 'بيانات تجريبية — سيتم ربط نموذج YOLOv8 قريباً', en: 'Mock data — YOLOv8 model will be connected soon' },
  mapPlaceholder: { ar: 'خريطة الكشوفات', en: 'Detections Map' },
  inReview: { ar: 'قيد المراجعة', en: 'In Review' },
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  noData: { ar: 'لا توجد بيانات', en: 'No data found' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('sabiq-lang') as Lang) || 'ar';
  });

  const isRTL = lang === 'ar';

  useEffect(() => {
    localStorage.setItem('sabiq-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang, isRTL]);

  const toggleLang = () => setLang(prev => prev === 'ar' ? 'en' : 'ar');

  const t = (key: string) => translations[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, isRTL, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};
