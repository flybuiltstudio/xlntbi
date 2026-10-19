/**
 * Owner-written follow-up emails sent from the admin Orders page. Shared by
 * the confirm dialog preview and the email templates so both show the same text.
 */

/** Greeting uses the recipient's own name; falls back when the name is missing. */
function greeting(recipientName: string | null | undefined): string {
  const name = recipientName?.trim();
  return name ? `Kedves ${name}!` : "Kedves Könyvelő!";
}

/** Signature lines stay in one block so no blank line sits between them. */
const SIGNATURE = "Üdvözlettel:\nSarinay Dávid";

export function demoFeedbackParagraphs(input: { recipientName: string | null }): string[] {
  return [
    greeting(input.recipientName),
    "Igényeltél demó terméket tőlem, de ha jól látom, eddig nem vásároltad meg.",
    "Érdeklődni szeretnék, hogy sikerült-e kipróbálni?",
    "Mi tetszett benne, és mi nem?",
    "Mi a nehézség, mi kellene még bele, mitől lenne jobb, miért nem vetted meg még, és mikor vennéd meg?",
    "Bármilyen hibát találtál benne, esetleg tudsz javasolni új funkció(ka)t bele?",
    "Ha az ár nem reális szerinted, akkor mi lenne az?",
    "Megköszönöm, ha egy válaszlevélben leírod ezeket, cserébe valamilyen kedvezményt a termékre, vagy esetleg egy hasznos kis ajándék terméket kaphatsz.",
    SIGNATURE,
  ];
}

export function formatHuf(value: number): string {
  return `${Math.round(value).toLocaleString("hu-HU").replace(/\u00a0/g, " ")} Ft`;
}

export function paymentReminderParagraphs(input: {
  productName: string;
  tierLabel: string | null;
  totalPrice: number;
  recipientName: string | null;
}): string[] {
  return [
    greeting(input.recipientName),
    "Igényeltél terméket tőlem, de ha jól látom, eddig nem történt meg a kiegyenlítése.",
    "Érdeklődni szeretnék, hogy mikor tervezed rendezni az összeget?",
    [
      `Termék: ${input.productName}`,
      `Licenc típusa: ${input.tierLabel?.trim() || "—"}`,
      `Ár: ${formatHuf(input.totalPrice)}`,
    ].join("\n"),
    "Ha az ár nem reális szerinted, akkor mi lenne az?",
    "Megköszönöm, ha mielőbb rendezed, vagy egy válaszlevélben leírod, ha szerinted más a reális ár, netán, ha meggondoltad magad, akkor miért. Cserébe valamilyen kedvezményt a termékre, vagy esetleg egy hasznos kis ajándék terméket kaphatsz.",
    SIGNATURE,
  ];
}

export const demoFeedbackSubject = (productName: string) => `Visszajelzés kérés – ${productName}`;
export const paymentReminderSubject = (orderNumber: string) =>
  `Fizetési emlékeztető – ${orderNumber}`;
