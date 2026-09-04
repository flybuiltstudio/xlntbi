import { Link, useLocation, useRouter, type LinkProps } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { dictionary, translate, type TranslationKey } from "./dictionary";
import {
  counterpartPath,
  langFromPath,
  localisedPath,
  SITE_ORIGIN,
  type Lang,
} from "./routes";

export { dictionary };
export type { TranslationKey };
export * from "./routes";

const STORAGE_KEY = "xlntbi-lang";

/**
 * Language switching and localised navigation build paths at runtime, so the
 * typed literal union cannot be used. This is the single narrow cast for it.
 */
export type RoutePath = LinkProps["to"];
export const asPath = (path: string): RoutePath => path as RoutePath;

export function storeLang(lang: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage blocked – language stays URL-driven only */
  }
}

export function readStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "en" || value === "hu" ? value : null;
  } catch {
    return null;
  }
}

/** Current language, derived from the URL so SSR and crawlers see it too. */
export function useLang(): Lang {
  const pathname = useLocation({ select: (l) => l.pathname });
  return langFromPath(pathname);
}

export function useT(): (key: TranslationKey) => string {
  const lang = useLang();
  return useCallback((key: TranslationKey) => translate(lang, key), [lang]);
}

/** Maps a Hungarian canonical path to the current language. */
export function useLocalPath(): (huPath: string) => string {
  const lang = useLang();
  return useCallback((huPath: string) => localisedPath(huPath, lang), [lang]);
}

/**
 * Keeps the stored language in sync and honours a stored English preference
 * when the visitor opens the Hungarian home page.
 */
export function useLanguagePersistence() {
  const router = useRouter();
  const pathname = useLocation({ select: (l) => l.pathname });
  const lang = langFromPath(pathname);

  useEffect(() => {
    const stored = readStoredLang();
    if (pathname === "/" && stored === "en") {
      void router.navigate({ to: asPath("/en"), replace: true });
      return;
    }
    if (stored !== lang) storeLang(lang);
  }, [pathname, lang, router]);
}

/** hreflang + canonical link tags for a page pair. */
export function languageHeadLinks(huPath: string) {
  const enPath = counterpartPath(huPath, "en");
  return [
    { rel: "alternate", hrefLang: "hu", href: `${SITE_ORIGIN}${huPath}` },
    { rel: "alternate", hrefLang: "en", href: `${SITE_ORIGIN}${enPath}` },
    { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}${huPath}` },
  ];
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const lang = langFromPath(pathname);
  const huTarget = counterpartPath(pathname, "hu");
  const enTarget = counterpartPath(pathname, "en");

  const base =
    "px-1.5 py-1 text-[13px] font-semibold uppercase tracking-wide transition-colors";
  const active = "text-primary";
  const idle = "text-muted-foreground hover:text-foreground";

  return (
    <div
      className={`flex items-center ${className}`}
      aria-label={translate(lang, "nav.language")}
      role="group"
    >
      <Link
        to={asPath(huTarget)}
        onClick={() => storeLang("hu")}
        aria-current={lang === "hu" ? "true" : undefined}
        aria-label={translate(lang, "nav.languageHu")}
        className={`${base} ${lang === "hu" ? active : idle}`}
      >
        HU
      </Link>
      <span aria-hidden="true" className="text-border">
        |
      </span>
      <Link
        to={asPath(enTarget)}
        onClick={() => storeLang("en")}
        aria-current={lang === "en" ? "true" : undefined}
        aria-label={translate(lang, "nav.languageEn")}
        className={`${base} ${lang === "en" ? active : idle}`}
      >
        EN
      </Link>
    </div>
  );
}
