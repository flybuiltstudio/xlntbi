import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/adotanacsadas")({
  head: () => ({
    meta: [
      { title: "Adótanácsadás és ügyviteli tanácsadás | EXCELlent" },
      { name: "description", content: "Személyre szabott adótanácsadás és ügyviteli tanácsadás: adózási forma, kifizetések, NAV-kockázatok, döntéselőkészítés." },
      { property: "og:title", content: "Adótanácsadás és ügyviteli tanácsadás | EXCELlent" },
      { property: "og:description", content: "Személyre szabott adótanácsadás és ügyviteli tanácsadás: adózási forma, kifizetések, NAV-kockázatok, döntéselőkészítés." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdotanacsadasPage,
});

function AdotanacsadasPage() {
  return (
    <ServicePage
      title={"Adótanácsadás és ügyviteli tanácsadás"}
      intro={["Az adózásban egy jó döntés sokszor évekig meghatározza a működésedet. Ezért nem sablonválaszokat adok, hanem a konkrét helyzetedre szabott szakmai megoldást keresek.", "Adótanácsadási és ügyviteli tanácsadási szolgáltatásaim célja, hogy a vállalkozásod adózási és működési kérdései tiszták, tervezhetők és kontrollálhatók legyenek."]}
      ctaLabel={"Konzultációt kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Adótanácsadás – pénzügyi dokumentumok elemzése"}
      listTitle={"Tipikus témák"}
      listItems={["Adózási forma kiválasztása", "Kifizetések és juttatások kezelése", "NAV- és adózási kockázatok csökkentése", "Céges működési kérdések", "Ügyviteli folyamatok egyszerűsítése", "Döntéselőkészítés"]}
      closing={{"heading": "Miben segít?", "text": "Átláthatóbbá teszi a működésedet, és segít elkerülni a felesleges hibákat, plusz terheket és bizonytalanságot.", "ctaLabel": "Konzultációt kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
