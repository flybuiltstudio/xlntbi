import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/135731.jpg";

export const Route = createFileRoute("/konyvvizsgalat")({
  head: () => ({
    meta: [
      { title: "Könyvvizsgálat, átvilágítás és due diligence | EXCELlent" },
      { name: "description", content: "Könyvvizsgálat, átvilágítás, due diligence és audit előkészítés: pénzügyi, számviteli és működési megbízhatóság vizsgálata." },
      { property: "og:title", content: "Könyvvizsgálat, átvilágítás és due diligence | EXCELlent" },
      { property: "og:description", content: "Könyvvizsgálat, átvilágítás, due diligence és audit előkészítés: pénzügyi, számviteli és működési megbízhatóság vizsgálata." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KonyvvizsgalatPage,
});

function KonyvvizsgalatPage() {
  return (
    <ServicePage
      title={"Könyvvizsgálat, átvilágítás, audit szolgáltatások"}
      intro={["A könyvvizsgálat és az átvilágítás célja nem csak az ellenőrzés, hanem az is, hogy valódi képet kapj a működésedről. Egy jól megcsinált audit megmutatja, hol vannak a kockázatok, és hol lehet javítani a folyamatokon.", "Könyvvizsgálati, due diligence és audit szolgáltatásaim során a pénzügyi, számviteli és működési megbízhatóságot vizsgálom."]}
      ctaLabel={"Audit konzultációt kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Könyvvizsgálat – pénzügyi adatok ellenőrzése"}
      listTitle={"Szolgáltatások"}
      listItems={["Könyvvizsgálat", "Átvilágítás", "Due diligence", "Audit előkészítés", "Belső kontrollok áttekintése", "Kockázatelemzés"]}
      closing={{"heading": "Kinek hasznos?", "items": ["Tulajdonosoknak", "Vezetőknek", "Befektetőknek", "Cégvásárlás előtt állóknak", "Olyan szervezeteknek, ahol fontos a transzparencia"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
