/** Service subpages, shared by the Szolgáltatásaim page and the admin statistics. */
export const serviceItems = [
  { to: "/konyveles", label: "Könyvelési szolgáltatások" },
  { to: "/ev-konyveles", label: "EV Könyvelés – KATA és átalányadó" },
  { to: "/adotanacsadas", label: "Adózási és ügyviteli tanácsadás" },
  { to: "/fintech-es-bi", label: "Fintech és BI tanácsadás" },
  { to: "/kontrolling", label: "Kontrolling modern riport- és automatizációs eszközökkel" },
  { to: "/cegaudit", label: "Cégaudit" },
  { to: "/konyvvizsgalat", label: "Könyvvizsgálat" },
  { to: "/konyveloiroda-audit", label: "Könyvelőiroda audit" },
  { to: "/digitalis-idomegtakaritasi-audit", label: "Digitális időmegtakarítási audit" },
] as const;

export function serviceLabel(path: string): string {
  return serviceItems.find((item) => item.to === path)?.label ?? path;
}
