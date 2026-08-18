import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/close-up-busy-businesswoman.jpg";

export const Route = createFileRoute("/konyveles")({
  head: () => ({
    meta: [
      { title: "Könyvelés cégeknek és egyéni vállalkozóknak | EXCELlent" },
      { name: "description", content: "Teljes körű könyvelés cégeknek, egyéni vállalkozóknak és magánszemélyeknek, digitális, papírmentes működéssel." },
      { property: "og:title", content: "Könyvelés cégeknek és egyéni vállalkozóknak | EXCELlent" },
      { property: "og:description", content: "Teljes körű könyvelés cégeknek, egyéni vállalkozóknak és magánszemélyeknek, digitális, papírmentes működéssel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KonyvelesPage,
});

function KonyvelesPage() {
  return (
    <ServicePage
      title={"Könyvelés cégeknek, egyéni vállalkozóknak, magánszemélyeknek"}
      intro={["A könyvelés nálam nem puszta adminisztráció, hanem a stabil és tervezhető működés egyik alapja. Arra törekszem, hogy az adataidból ne csak kötelező jelentések, hanem valódi üzleti információk is szülessenek.", "Teljes körű könyvelési szolgáltatást nyújtok cégeknek, egyéni vállalkozóknak és magánszemélyeknek. A munkát mindig az ügyfél tevékenységéhez, igényeihez és működési sajátosságaihoz igazítom."]}
      ctaLabel={"Konzultációt kérek"}
      ctaTo={"/kapcsolat"}
      image={heroImage}
      imageAlt={"Könyvelés – irodai munka közben"}
      listTitle={"Szolgáltatások"}
      listItems={["Teljes körű könyvelés", "Bevallások előkészítése és benyújtása", "Éves zárás és beszámoló-előkészítés", "Folyamatos szakmai egyeztetés", "Online ügyintézés", "Digitális, papírmentes működés támogatása"]}
      closing={{"eyebrow": "Kinek ajánlott?", "heading": "Rendezett könyvelés azoknak, akik tisztán szeretnének látni", "items": ["Cégeknek", "Egyéni vállalkozóknak", "Magánszemélyeknek", "Olyan ügyfeleknek, akik rendezett és átlátható könyvelést szeretnének"]}}
    />
  );
}
