import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/bi.jpg";

export const Route = createFileRoute("/fintech-es-bi")({
  head: () => ({
    meta: [
      { title: "Fintech és BI tanácsadás | EXCELlent" },
      { name: "description", content: "Power BI dashboardok, riportautomatizálás, adatösszekapcsolás és AI-val támogatott munkafolyamatok pénzügyi szemlélettel." },
      { property: "og:title", content: "Fintech és BI tanácsadás | EXCELlent" },
      { property: "og:description", content: "Power BI dashboardok, riportautomatizálás, adatösszekapcsolás és AI-val támogatott munkafolyamatok pénzügyi szemlélettel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FintechBiPage,
});

function FintechBiPage() {
  return (
    <ServicePage
      title={"Fintech és BI tanácsadás könyvelőirodáknak, cégeknek és magánszemélyeknek"}
      intro={["A pénzügyi adat önmagában még nem érték. Akkor válik hasznossá, ha jól össze van kötve, átlátható és döntést támogat. Ebben segít a Fintech és BI tanácsadás.", "A klasszikus számvitelt modern automatizációval, riportokkal, adatmodellezéssel, komplex makrókkal és AI-támogatott munkafolyamatokkal kapcsolom össze. A cél, hogy a pénzügyi működés gyorsabb, tisztább és jobban irányítható legyen."]}
      ctaLabel={"BI konzultációt kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Fintech és BI – adatvezérelt pénzügyi működés"}
      listTitle={"Digitális és pénzügyi működés egyszerűbben, átláthatóbban"}
      listItems={["Power BI dashboardok", "Riportautomatizálás", "Adatösszekapcsolások", "Automatizált ellenőrzési logikák", "Digitális könyvelőirodai megoldások", "Pénzügyi folyamatok egyszerűsítése", "AI-val támogatott munkafolyamatok"]}
      closing={{"heading": "Kinek szól?", "items": ["Könyvelőirodáknak", "Cégeknek", "Magánszemélyeknek", "Olyan szakembereknek, akik technológiával akarnak hatékonyabbak lenni"], "ctaLabel": "BI konzultációt kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
