import { ROUTE_PAIRS } from "./i18n/routes";

/** Service subpages used by the Hungarian service listing. */
export const serviceItems = [
  { to: "/konyveles", label: "Könyvelési szolgáltatások" },
  { to: "/ev-konyveles", label: "EV Könyvelés – KATA és átalányadó" },
  { to: "/en/sole-trader-bookkeeping", label: "SE bookkeeping – Self-employed bookkeeping" },
  { to: "/adotanacsadas", label: "Adózási és ügyviteli tanácsadás" },
  { to: "/fintech-es-bi", label: "Fintech és BI tanácsadás" },
  { to: "/kontrolling", label: "Kontrolling modern riport- és automatizációs eszközökkel" },
  { to: "/cegaudit", label: "Cégaudit" },
  { to: "/konyvvizsgalat", label: "Könyvvizsgálat" },
  { to: "/konyveloiroda-audit", label: "Könyvelőiroda audit" },
  { to: "/digitalis-idomegtakaritasi-audit", label: "Digitális időmegtakarítási audit" },
] as const;

/** Both language variants, with existing counter keys and labels preserved. */
export const servicePageItems: { to: string; label: string }[] = [
  ...serviceItems,
  ...ROUTE_PAIRS.flatMap((pair) => {
    const item = serviceItems.find((service) => service.to === pair.hu);
    return item && !serviceItems.some((service) => service.to === pair.en)
      ? [{ to: pair.en, label: `${item.label} (EN)` }]
      : [];
  }),
];

export function serviceLabel(path: string): string {
  return servicePageItems.find((item) => item.to === path)?.label ?? path;
}
