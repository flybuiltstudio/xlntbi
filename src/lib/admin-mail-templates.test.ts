import { describe, expect, it } from "vitest";

import { demoFeedbackParagraphs, paymentReminderParagraphs } from "./admin-mail-templates";

describe("payment reminder", () => {
  it("puts product, licence type and price on separate lines", () => {
    const p = paymentReminderParagraphs({
      productName: "XLNT Havi riport",
      tierLabel: "Teljes csomag",
      totalPrice: 74900,
      recipientName: "Teszt Elek",
    });
    expect(p[3]).toBe("Termék: XLNT Havi riport\nLicenc típusa: Teljes csomag\nÁr: 74 900 Ft");
    expect(p.join(" ")).not.toContain("IDE A TERMÉK");
  });
  it("has no double space", () => {
    const p = paymentReminderParagraphs({
      productName: "X",
      tierLabel: null,
      totalPrice: 0,
      recipientName: "Teszt Elek",
    });
    expect(p[1]).toBe(
      "Igényeltél terméket tőlem, de ha jól látom, eddig nem történt meg a kiegyenlítése.",
    );
    expect(p.join("\n")).not.toContain("  ");
  });
  it("greets the buyer by name", () => {
    const p = paymentReminderParagraphs({
      productName: "X",
      tierLabel: null,
      totalPrice: 0,
      recipientName: "Teszt Elek",
    });
    expect(p[0]).toBe("Kedves Teszt Elek!");
  });
  it("falls back to a generic greeting without a name", () => {
    const p = paymentReminderParagraphs({
      productName: "X",
      tierLabel: null,
      totalPrice: 0,
      recipientName: null,
    });
    expect(p[0]).toBe("Kedves Könyvelő!");
  });
});

describe("signature block", () => {
  it("keeps Üdvözlettel and the name adjacent in both letters", () => {
    const demo = demoFeedbackParagraphs({ recipientName: "Teszt Elek", productName: "XLNT Havi riport" });
    const payment = paymentReminderParagraphs({
      productName: "X",
      tierLabel: null,
      totalPrice: 0,
      recipientName: "Teszt Elek",
    });
    const last = (list: string[]) => list[list.length - 1];
    expect(last(demo)).toBe("Üdvözlettel:\nSarinay Dávid");
    expect(last(payment)).toBe("Üdvözlettel:\nSarinay Dávid");
  });
});

describe("demo feedback greeting", () => {
  it("greets the demo requester by name", () => {
    const p = demoFeedbackParagraphs({ recipientName: "Kiss Anna", productName: "XLNT Havi riport" });
    expect(p[0]).toBe("Kedves Kiss Anna!");
    expect(p[1]).toBe(
      "Igényeltél demó terméket tőlem, de ha jól látom, eddig nem vásároltad meg.",
    );
  });
  it("falls back to a generic greeting without a name", () => {
    const p = demoFeedbackParagraphs({ recipientName: "  ", productName: "XLNT Havi riport" });
    expect(p[0]).toBe("Kedves Könyvelő!");
  });
});

describe("corrected wording", () => {
  const demo = demoFeedbackParagraphs({ recipientName: "Kiss Anna", productName: "XLNT Havi riport" });
  const payment = paymentReminderParagraphs({
    productName: "X",
    tierLabel: null,
    totalPrice: 0,
    recipientName: "Kiss Anna",
  });

  it("uses the owner's exact demo thanks sentence", () => {
    expect(demo[demo.length - 2]).toBe(
      "Megköszönöm, ha egy válaszlevélben leírod ezeket, cserébe valamilyen kedvezményt a termékre, vagy esetleg egy hasznos kis ajándék terméket kaphatsz.",
    );
  });

  it("uses the owner's exact payment reminder sentence", () => {
    expect(payment[payment.length - 2]).toBe(
      "Megköszönöm, ha mielőbb rendezed, vagy egy válaszlevélben leírod, ha szerinted más a reális ár, netán, ha meggondoltad magad, akkor miért. Cserébe valamilyen kedvezményt a termékre, vagy esetleg egy hasznos kis ajándék terméket kaphatsz.",
    );
  });

  it("writes válaszlevél as one word and demó with a long ó", () => {
    const both = [...demo, ...payment].join("\n");
    expect(both).not.toContain("válasz levél");
    expect(both).not.toMatch(/\bdemo\b/);
    expect(demo.join("\n")).toContain("demó terméket");
  });
});
