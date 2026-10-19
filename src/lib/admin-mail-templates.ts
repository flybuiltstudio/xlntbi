/**
 * Owner-written follow-up emails sent from the admin Orders page. Shared by
 * the confirm dialog preview and the email templates so both show the same text.
 */

export const DEMO_FEEDBACK_PARAGRAPHS: string[] = [
  "Kedves Könyvelő!",
  "Igényeltél demo terméket tőlem, de ha jól látom, eddig nem vásároltad meg.",
  "Érdeklődni szeretnék, hogy sikerült-e kipróbálni?",
  "Mi tetszett benne, és mi nem?",
  "Mi a nehézség, mi kellene még bele, mitől lenne jobb, miért nem vetted meg még, és mikor vennéd meg?",
  "Bármilyen hibát találtál benne, esetleg tudsz javasolni új funkció(ka)t bele?",
  "Ha az ár nem reális szerinted, akkor mi lenne az?",
  "Megköszönöm, ha egy válasz levélben leírod ezeket, cserébe valamilyen kedvezményt a termékre, vagy esetleg egy hasznos kis ajándék terméket kaphatsz.",
  "Üdvözlettel:",
  "Sarinay Dávid",
];

export function formatHuf(value: number): string {
  return `${Math.round(value).toLocaleString("hu-HU").replace(/\u00a0/g, " ")} Ft`;
}

export function paymentReminderParagraphs(input: {
  productName: string;
  tierLabel: string | null;
  totalPrice: number;
}): string[] {
  return [
    "Kedves Könyvelő!",
    "Igényeltél terméket tőlem, de ha jól látom, eddig nem történt meg a kiegyenlítése.",
    "Érdeklődni szeretnék, hogy mikor tervezed rendezni az összeget?",
    [
      `Termék: ${input.productName}`,
      `Licenc típusa: ${input.tierLabel?.trim() || "—"}`,
      `Ár: ${formatHuf(input.totalPrice)}`,
    ].join("\n"),
    "Ha az ár nem reális szerinted, akkor mi lenne az?",
    "Megköszönöm, ha mielőbb rendezed vagy egy válasz levélben leírod, ha szerinted más a reális ár, netán ha meggondoltad magad, akkor miért. Cserébe valamilyen kedvezményt a termékre, vagy esetleg egy hasznos kis ajándék terméket kaphatsz.",
    "Üdvözlettel:",
    "Sarinay Dávid",
  ];
}

export const demoFeedbackSubject = (productName: string) => `Visszajelzés kérés – ${productName}`;
export const paymentReminderSubject = (orderNumber: string) =>
  `Fizetési emlékeztető – ${orderNumber}`;
