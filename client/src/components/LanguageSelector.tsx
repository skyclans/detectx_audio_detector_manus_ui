import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", path: "/en/" },
  { code: "ko", label: "한국어", path: "/ko/" },
  { code: "ja", label: "日本語", path: "/ja/" },
  { code: "es", label: "Español", path: "/es/" },
  { code: "de", label: "Deutsch", path: "/de/" },
  { code: "fr", label: "Français", path: "/fr/" },
  { code: "pt", label: "Português", path: "/pt/" },
  { code: "zh", label: "中文", path: "/zh/" },
] as const;

const SUPPORTED_CODES = LANGUAGES.map((l) => l.code);

function detectBrowserLanguage(): string {
  const browserLang = navigator.language || (navigator as any).userLanguage || "en";
  const primary = browserLang.split("-")[0].toLowerCase();
  if (SUPPORTED_CODES.includes(primary as any)) return primary;
  return "en";
}

function getCurrentLanguage(pathname: string): string | null {
  const match = pathname.match(/^\/(en|ko|ja|es|de|fr|pt|zh)\/?$/);
  return match ? match[1] : null;
}

export function useLanguageRedirect() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect from homepage
    if (location !== "/") return;

    // Check if user has explicitly chosen a language before
    const savedLang = localStorage.getItem("detectx-lang");
    if (savedLang && SUPPORTED_CODES.includes(savedLang as any)) {
      setLocation(`/${savedLang}/`);
      return;
    }

    // Auto-detect from browser
    const detected = detectBrowserLanguage();
    if (detected !== "en") {
      setLocation(`/${detected}/`);
    }
  }, [location, setLocation]);
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = getCurrentLanguage(location);
  const activeLang = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectLanguage(code: string, path: string) {
    localStorage.setItem("detectx-lang", code);
    setLocation(path);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{activeLang.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-border bg-background shadow-lg z-50 py-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code, lang.path)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                lang.code === activeLang.code
                  ? "text-cyan-500 font-medium bg-muted/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
