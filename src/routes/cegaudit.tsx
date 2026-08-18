import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/cegaudit.jpg";

export const Route = createFileRoute("/cegaudit")({
  head: () => ({
    meta: [
      { title: "Cégaudit – folyamatok és kontrollok átvilágítása | EXCELlent" },
      { name: "description", content: "Gyakorlati cégaudit: folyamatok, kontrollok, riportálás, határidők, hibaforrások és digitalizációs lehetőségek feltárása." },
      { property: "og:title", content: "Cégaudit – folyamatok és kontrollok átvilágítása | EXCELlent" },
      { property: "og:description", content: "Gyakorlati cégaudit: folyamatok, kontrollok, riportálás, határidők, hibaforrások és digitalizációs lehetőségek feltárása." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CegauditPage,
});

function CegauditPage() {
  return (
    <ServicePage
      title={"Cégaudit"}
      intro={["A cégaudit célja, hogy külső szemmel nézzünk rá a működésedre, és megtaláljuk, hol lehet egyszerűsíteni, gyorsítani vagy biztonságosabbá tenni a folyamatokat.", "Ez nem hosszú elméleti anyag, hanem gyakorlati feltárás és fejlesztési javaslat. A hangsúly a használhatóságon van."]}
      ctaLabel={"Cégauditot kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Cégaudit – működési folyamatok átvilágítása"}
      listTitle={"Mit vizsgálunk?"}
      listItems={["Folyamatok", "Kontrollok", "Riportálás", "Határidők", "Hibaforrások", "Digitalizációs lehetőségek"]}
      closing={{"heading": "Kinek ajánlott?", "items": ["Tulajdonosoknak", "Ügyvezetőknek", "Pénzügyi vezetőknek", "Olyan cégeknek, amelyek javítani akarnak a működésükön"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
