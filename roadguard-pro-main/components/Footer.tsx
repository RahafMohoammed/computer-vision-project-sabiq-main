import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Globe, Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  const { t, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-border py-12 noise-overlay">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-start flex items-center gap-3">
            <img src={logo} alt="SABIQ" className="h-10 w-auto" />
            <p className="text-sm text-muted-foreground">{t('tagline')}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t('footer')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Globe size={18} />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
