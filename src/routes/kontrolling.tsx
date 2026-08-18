import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/controlling.jpg";

export const Route = createFileRoute("/kontrolling")({
  head: () => ({
    meta: [
      { title: "Kontrolling, Excel és Power BI riportok | EXCELlent" },
      { name: "description", content: "Vezetői riportok, profitabilitási elemzések, projektkontrolling és Power BI dashboardok, automatizált modellekkel." },
      { property: "og:title", content: "Kontrolling, Excel és Power BI riportok | EXCELlent" },
      { property: "og:description", content: "Vezetői riportok, profitabilitási elemzések, projektkontrolling és Power BI dashboardok, automatizált modellekkel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KontrollingPage,
});

function KontrollingPage() {
  return (
    <ServicePage
      title={"Kontrolling, Excel és Power BI riportok cégeknek"}
      intro={["A kontrolling célja nálam az, hogy a vezetés ne utólag lássa a számokat, hanem időben kapjon használható információt. Egy jól felépített riport sokkal több, mint egy táblázat: döntéstámogató eszköz.", "Modern riport- és automatizációs megoldásokat készítek cégeknek, amelyek segítenek abban, hogy a pénzügyi és működési adatok ne elszigetelten, hanem egységes rendszerben legyenek láthatók, akár komplex makrókkal támogatva."]}
      ctaLabel={"Kontrolling konzultáció"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Kontrolling riportok és elemzések"}
      listTitle={"Tipikus megoldások"}
      listItems={["Vezetői riportok", "Profitabilitási elemzések", "Projektkontrolling", "Havi zárási támogatás", "Automatizált modellek", "Power BI dashboardok"]}
      closing={{"heading": "Kinek való?", "items": ["KKV-knak", "Nagyobb cégeknek", "Pénzügyi vezetőknek", "Ügyvezetőknek", "Olyan csapatoknak, ahol gyors döntések kellenek"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
