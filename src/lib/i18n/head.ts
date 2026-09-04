import { counterpartPath, SITE_ORIGIN, type Lang } from "./routes";

type HeadInput = {
  /** Canonical Hungarian path of the page pair (e.g. "/konyveles"). */
  huPath: string;
  lang: Lang;
  title: string;
  description: string;
  ogImage?: string;
  jsonLd?: unknown[];
};

/**
 * Builds a full head config: language-specific meta, canonical for the current
 * language, hreflang alternates for both languages and x-default (Hungarian).
 */
export function buildHead({ huPath, lang, title, description, ogImage, jsonLd }: HeadInput) {
  const enPath = counterpartPath(huPath, "en");
  const canonicalPath = lang === "en" ? enPath : huPath;
  const canonical = `${SITE_ORIGIN}${canonicalPath}`;

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:locale", content: lang === "en" ? "en_US" : "hu_HU" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (ogImage) {
    meta.splice(6, 0, { property: "og:image", content: ogImage });
    meta.push({ name: "twitter:image", content: ogImage });
  }

  const links = [
    { rel: "canonical", href: canonical },
    { rel: "alternate", hrefLang: "hu", href: `${SITE_ORIGIN}${huPath}` },
    { rel: "alternate", hrefLang: "en", href: `${SITE_ORIGIN}${enPath}` },
    { rel: "alternate", hrefLang: "x-default", href: `${SITE_ORIGIN}${huPath}` },
  ];

  const scripts = (jsonLd ?? []).map((data) => ({
    type: "application/ld+json",
    children: JSON.stringify(data),
  }));

  return { meta, links, scripts };
}
