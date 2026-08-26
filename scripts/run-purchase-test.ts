import { runFullPurchaseTest } from "@/lib/purchase-test.server";
const res = await runFullPurchaseTest({
  productSlug: "pdf-excel-konverter",
  tierId: "orokos_licenc",
  email: "info@xlntbi.hu",
  paymentMethod: "card",
  sendLicenseEmail: true,
  cleanup: true,
});
console.log(JSON.stringify(res, null, 2));
