import { useState } from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Globe, Sun, Moon, Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';

const Navbar = () => {
  const { lang, isRTL, toggleLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { key: 'liveDemo', href: '#demo' },
    { key: 'howItWorks', href: '#how' },
    { key: 'dashboard', href: '#dashboard' },
    { key: 'impact', href: '#impact' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="SABIQ" className="h-10 w-auto" />
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.key} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t(l.key)}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Toggle language">
            <Globe size={18} />
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href="#demo" className="ms-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            {t('tryNow')}
          </a>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-foreground" aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="flex flex-col p-4 gap-3">
            {links.map(l => (
              <a key={l.key} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">
                {t(l.key)}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Globe size={18} /></button>
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <a href="#demo" onClick={() => setMenuOpen(false)} className="ms-auto px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                {t('tryNow')}
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
