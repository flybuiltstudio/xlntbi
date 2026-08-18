import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/account-assets-audit-bank-bookkeeping-finance-concept.jpg";

export const Route = createFileRoute("/digitalis-idomegtakaritasi-audit")({
  head: () => ({
    meta: [
      { title: "Digitális időmegtakarítási audit | EXCELlent" },
      { name: "description", content: "Excel, makrók, Power BI és AI-eszközök átvilágítása: hol megy el az idő, és hol lehet valóban gyorsítani a folyamatokon." },
      { property: "og:title", content: "Digitális időmegtakarítási audit | EXCELlent" },
      { property: "og:description", content: "Excel, makrók, Power BI és AI-eszközök átvilágítása: hol megy el az idő, és hol lehet valóban gyorsítani a folyamatokon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DigitalisAuditPage,
});

function DigitalisAuditPage() {
  return (
    <ServicePage
      title={"Digitális időmegtakarítási audit"}
      intro={["Ha a mindennapi munkád része az Excel, a Power BI, az AI-eszközök vagy más digitális rendszerek használata, akár komplex makrókkal együtt, rengeteg idő el tud menni felesleges lépésekre, kézi javításokra és rosszul felépített folyamatokra. Az időmegtakarítási audit célja, hogy ezeket megtaláljuk és megszüntessük.", "Az audit során átnézem a használt fájlokat, folyamatokat és rendszereket, majd megmutatom, hol lehet időt nyerni. A cél nem több eszköz, hanem kevesebb munka ugyanannyi vagy jobb eredményért."]}
      ctaLabel={"Audit időpontot kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Digitális időmegtakarítási audit – folyamatok elemzése"}
      listTitle={"Amit vizsgálok"}
      listItems={["Képletek és függőségek", "Makrók és automatizmusok", "Adatbeviteli pontok", "Riportkészítés", "Felesleges manuális lépések", "Hibaforrások", "AI-alapú gyorsítási lehetőségek"]}
      closing={{"heading": "Kinek ajánlott?", "items": ["Könyvelőknek", "Pénzügyi szakembereknek", "Kontrollereknek", "Irodai csapatoknak", "Cégeknek, amelyek sokat dolgoznak digitális eszközökkel"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
