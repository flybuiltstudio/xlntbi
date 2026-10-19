import { describe, expect, it } from "vitest";

import { DEMO_FEEDBACK_PARAGRAPHS, paymentReminderParagraphs } from "./admin-mail-templates";

describe("payment reminder", () => {
  it("puts product, licence type and price on separate lines", () => {
    const p = paymentReminderParagraphs({
      productName: "XLNT Havi riport",
      tierLabel: "Teljes csomag",
      totalPrice: 74900,
    });
    expect(p[3]).toBe("Termék: XLNT Havi riport\nLicenc típusa: Teljes csomag\nÁr: 74 900 Ft");
    expect(p.join(" ")).not.toContain("IDE A TERMÉK");
  });
  it("has no double space", () => {
    const p = paymentReminderParagraphs({ productName: "X", tierLabel: null, totalPrice: 0 });
    expect(p[1]).toBe(
      "Igényeltél terméket tőlem, de ha jól látom, eddig nem történt meg a kiegyenlítése.",
    );
    expect(DEMO_FEEDBACK_PARAGRAPHS.join("\n")).not.toContain("  ");
  });
});
