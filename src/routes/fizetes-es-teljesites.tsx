import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

const TITLE = "Fizetési és teljesítési feltételek | EXCELlent";
const DESC =
  "Hogyan zajlik a digitális termékek megrendelése, a fizetés és a teljesítés a xlntbi.hu oldalon.";

export const Route = createFileRoute("/fizetes-es-teljesites")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <LegalPage
      title="Fizetési és teljesítési feltételek"
      intro={[
        "Az oldalon kínált termékek digitális termékek, ezért fizikai szállítás nincs: a teljesítés letöltéssel, illetve e-mailben megküldött hozzáféréssel történik.",
      ]}
      sections={[
        {
          heading: "A megrendelés folyamata",
          list: [
            "A termékoldalon a „Megrendelem” gombra kattintva megnyílik a megrendelőlap.",
            "A megrendelőlapon a darabszámot és a számlázási adatokat kell megadni. Szállítási címre nincs szükség.",
            "A megrendelés elküldése után automatikus visszaigazoló e-mail érkezik a rendelésszámmal.",
            "A megrendelést a szolgáltató visszaigazolja, és megküldi a számlát, illetve a fizetési tudnivalókat.",
          ],
        },
        {
          heading: "Fizetési módok",
          list: [
            "Banki átutalás: a megküldött számla, illetve fizetési tudnivalók alapján. A teljesítés az összeg beérkezése után indul.",
            "Bankkártyás online fizetés: a fizetést a Stripe Payments Europe, Ltd. biztonságos felülete bonyolítja le. A kártyaadatokat kizárólag a Stripe kezeli, azok a szolgáltatóhoz nem jutnak el.",
          ],
          afterList: [
            "Sikertelen vagy megszakadt kártyás fizetés esetén a megrendelés fizetésre váró állapotban marad, a fizetés újraindítható, vagy átutalásra lehet váltani.",
          ],
        },
        {
          heading: "Árak és számla",
          paragraphs: [
            `A weboldalon feltüntetett árak forintban értendők. A szolgáltató ${COMPANY.vatStatus} adózói körbe tartozik, ezért az árak áfát nem tartalmaznak, a számlán áfa nem kerül felszámításra.`,
            "A megrendelésről elektronikus számla készül a Billingo rendszerén keresztül, amelyet a megadott e-mail címre küldünk.",
          ],
        },
        {
          heading: "Teljesítés",
          paragraphs: [
            "A digitális termék elérhetőségét (letöltési link vagy fájl) a fizetés beérkezését követően, legkésőbb 2 munkanapon belül küldjük el a megadott e-mail címre. A termék használatához szükséges technikai feltételekről a termékleírás tájékoztat.",
          ],
        },
        {
          heading: "Elállás",
          paragraphs: [
            "Digitális tartalom esetén az elállási jog szabályairól az Elállási tájékoztató oldalon olvashatsz.",
          ],
        },
      ]}
    />
  ),
});
