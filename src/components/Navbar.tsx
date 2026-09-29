import React from 'react';
import { ShieldCheck, ShieldAlert, RotateCcw, Zap, Languages } from 'lucide-react';
import { Language, UI_TRANSLATIONS } from '../translations';

interface NavbarProps {
  activeTab: 'sandbox' | 'dh' | 'vectors' | 'defense' | 'challenges';
  setActiveTab: (tab: 'sandbox' | 'dh' | 'vectors' | 'defense' | 'challenges') => void;
  onReset: () => void;
  onQuickSim: () => void;
  hasActiveThreat: boolean;
  lang: Language;
  setLang: (l: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  onQuickSim,
  hasActiveThreat,
  lang,
  setLang,
}) => {
  const t = UI_TRANSLATIONS[lang];

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="#sandbox" 
          onClick={(e) => { e.preventDefault(); setActiveTab('sandbox'); }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>{t.appTitle}</span>
        </a>
        <span className="hidden sm:inline text-xs text-slate-500 font-mono">
          {t.appSubtitle}
        </span>
      </div>

      {/* Zone 2: 4-5 clean text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'sandbox' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          {t.tabs.sandbox}
        </button>
        <button
          onClick={() => setActiveTab('dh')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'dh' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          {t.tabs.dh}
        </button>
        <button
          onClick={() => setActiveTab('vectors')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'vectors' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          {t.tabs.vectors}
        </button>
        <button
          onClick={() => setActiveTab('defense')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'defense' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          {t.tabs.defense}
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'challenges' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          <span>{t.tabs.challenges}</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions + Language selector */}
      <div className="flex items-center gap-2.5">
        {/* Language switch */}
        <button
          onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded bg-slate-900 border border-slate-700 hover:border-slate-600 text-cyan-300 transition-colors"
          title="Switch Language / สลับภาษา"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'ไทย' : 'EN'}</span>
        </button>

        <button
          onClick={onQuickSim}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap shadow-sm shadow-cyan-950"
          title="Send test packet with current attack & defense configuration"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{t.actions.transmit}</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors whitespace-nowrap"
          title="Reset topology and defenses to default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.actions.reset}</span>
        </button>
      </div>
    </header>
  );
};
