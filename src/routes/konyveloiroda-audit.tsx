import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/konyveloiroda-audit.jpg";

export const Route = createFileRoute("/konyveloiroda-audit")({
  head: () => ({
    meta: [
      { title: "Könyvelőiroda audit – működési térkép az irodádhoz | EXCELlent" },
      { name: "description", content: "Könyvelőiroda audit: folyamatok, minőségbiztosítás, határidőkezelés, automatizáció és ügyfélkommunikáció szakmai felülvizsgálata." },
      { property: "og:title", content: "Könyvelőiroda audit – működési térkép az irodádhoz | EXCELlent" },
      { property: "og:description", content: "Könyvelőiroda audit: folyamatok, minőségbiztosítás, határidőkezelés, automatizáció és ügyfélkommunikáció szakmai felülvizsgálata." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KonyveloirodaAuditPage,
});

function KonyveloirodaAuditPage() {
  return (
    <ServicePage
      title={"Könyvelőiroda audit"}
      intro={["A könyvelőiroda audit azoknak szól, akik a saját irodájuk működését szeretnék szakmai szemmel felülvizsgálni. A cél az, hogy lássuk: a folyamatok mennyire rendezettek, hatékonyak és skálázhatók.", "Egy könyvelőirodában a minőség, a határidőkezelés és az egységes munkamódszer kulcsfontosságú. Az audit során ezeket nézem át, és gyakorlati fejlesztési javaslatokat adok."]}
      ctaLabel={"Auditot kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Könyvelőiroda audit – irodai folyamatok"}
      listTitle={"Mit vizsgálok?"}
      listItems={["Folyamatok szervezettsége", "Csapatmunka és feladatkiosztás", "Minőségbiztosítás", "Határidőkezelés", "Automatizáció", "Ügyfélkommunikáció"]}
      closing={{"eyebrow": "Eredmény", "heading": "Egy működési térkép az irodádhoz", "text": "Megmutatja, hol lehet gyorsítani, egyszerűsíteni és stabilizálni a könyvelőirodád működését.", "ctaLabel": "Auditot kérek", "ctaTo": "/kapcsolat"}}
    />
  );
}
