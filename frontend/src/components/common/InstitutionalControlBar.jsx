import React, { useState } from 'react';
import { 
  Sun, Moon, Compass, Globe, Palette, 
  Check, ChevronDown 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';

export default function InstitutionalControlBar({ compact = false }) {
  const { themeMode, cycleThemeMode, colorScheme, setColorScheme } = useTheme();
  const { currentLang, setLang, t } = useLanguage();

  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const colors = [
    { id: 'navy', label: 'Royal Navy', hex: '#0B3C8C' },
    { id: 'saffron', label: 'Vedic Saffron', hex: '#B45309' },
    { id: 'emerald', label: 'Imperial Emerald', hex: '#047857' },
    { id: 'indigo', label: 'Tech Indigo', hex: '#4338CA' },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      
      {/* 1-Click Theme Switcher Button */}
      <button
        type="button"
        onClick={cycleThemeMode}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border hover:border-primary-300 bg-surface-soft hover:bg-surface-alt text-xs font-semibold transition cursor-pointer shadow-inst-sm text-ink-primary"
        title={`Theme Mode: ${themeMode.toUpperCase()} (Click to Cycle)`}
      >
        {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
        {themeMode === 'medium' && <Compass className="w-3.5 h-3.5 text-blue-500" />}
        {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        {!compact && (
          <span className="capitalize text-[11px] hidden sm:inline">
            {t(themeMode)}
          </span>
        )}
      </button>

      {/* Color Palette Switcher */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setColorMenuOpen(!colorMenuOpen);
            setLangMenuOpen(false);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border hover:border-primary-300 bg-surface-soft hover:bg-surface-alt text-xs font-semibold transition cursor-pointer shadow-inst-sm text-ink-primary"
          title="Change Color Accent"
        >
          <Palette className="w-3.5 h-3.5 text-primary" />
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-white"
            style={{
              backgroundColor:
                colorScheme === 'saffron'
                  ? '#B45309'
                  : colorScheme === 'emerald'
                  ? '#047857'
                  : colorScheme === 'indigo'
                  ? '#4338CA'
                  : '#0B3C8C'
            }}
          />
        </button>

        {colorMenuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-surface rounded-xl shadow-inst-lg border border-surface-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-surface-border mb-1">
              Institutional Palette
            </div>
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setColorScheme(c.id);
                  setColorMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-surface-soft cursor-pointer transition ${
                  colorScheme === c.id ? 'text-primary font-bold bg-primary-50/50' : 'text-ink-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span>{c.label}</span>
                </div>
                {colorScheme === c.id && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Multilingual Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setLangMenuOpen(!langMenuOpen);
            setColorMenuOpen(false);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border hover:border-primary-300 bg-surface-soft hover:bg-surface-alt text-xs font-semibold transition cursor-pointer shadow-inst-sm text-ink-primary"
          title="Select Language"
        >
          <Globe className="w-3.5 h-3.5 text-secondary" />
          <span className="text-[11px] font-medium hidden sm:inline">
            {SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.native || 'English'}
          </span>
          <ChevronDown className="w-3 h-3 text-ink-muted" />
        </button>

        {langMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-surface rounded-xl shadow-inst-lg border border-surface-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1 text-[10px] font-bold text-ink-muted uppercase tracking-wider border-b border-surface-border mb-1">
              Regional Language
            </div>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLang(lang.code);
                  setLangMenuOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-surface-soft cursor-pointer transition ${
                  currentLang === lang.code ? 'text-primary font-bold bg-primary-50/50' : 'text-ink-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.native}</span>
                </div>
                {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
