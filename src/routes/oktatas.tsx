import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import heroImage from "@/assets/oktatas.jpg";

export const Route = createFileRoute("/oktatas")({
  head: () => ({
    meta: [
      { title: "Oktatás – könyvelés, adózás, Excel, Power BI, AI | EXCELlent" },
      { name: "description", content: "Gyakorlatias oktatás könyvelésből, adózásból, Excelből, Power BI-ból és AI-használatból, vizsgára és napi munkára is." },
      { property: "og:title", content: "Oktatás – könyvelés, adózás, Excel, Power BI, AI | EXCELlent" },
      { property: "og:description", content: "Gyakorlatias oktatás könyvelésből, adózásból, Excelből, Power BI-ból és AI-használatból, vizsgára és napi munkára is." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OktatasPage,
});

function OktatasPage() {
  return (
    <ServicePage
      title={"Oktatás"}
      intro={["Az oktatásban nem csak elméletet adok át, hanem használható, napi munkában is alkalmazható tudást. A cél az, hogy a résztvevő ne csak értse a témát, hanem tudja is használni.", "Az oktatási témák a könyvelés, az adózás, a digitális folyamatok, a Power BI és az automatizáció köré épülnek. A hangsúly mindig a gyakorlati alkalmazáson van."]}
      ctaLabel={"Oktatást kérek"}
      ctaTo={"/konzultacio"}
      image={heroImage}
      imageAlt={"Oktatás – szakmai képzés"}
      listTitle={"Témák"}
      listItems={["Könyvelési alapok és haladó gyakorlat", "Adózási logika és döntéstámogatás", "Excel használat szakmai szinten", "Power BI alapok", "Automatizálás pénzügyi szemlélettel", "AI használat a mindennapi munkában", "Vizsgára és gyakorlati munkára felkészítés"]}
      closing={{"heading": "Kinek szól?", "items": ["Főiskolai és egyetemi hallgatóknak", "Mérlegképes könyvelő hallgatóknak", "Adótanácsadó jelölteknek", "Pályakezdőknek", "Haladó szakembereknek"], "ctaLabel": "Konzultációt kérek", "ctaTo": "/konzultacio"}}
    />
  );
}
