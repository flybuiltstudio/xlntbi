/**
 * Full purchase self-test.
 *
 * Runs one order end to end with the selected payment method and verifies every
 * downstream step: payment status, Billingo invoice, download link and license
 * e-mail. Always uses a TESZT- order (payment_provider "test") so statistics
 * stay clean. Optional cleanup cancels the invoice (storno) and deletes the
 * order afterwards.
 */

export type PurchaseTestStep = {
  key: string;
  label: string;
  status: "ok" | "warn" | "error" | "skipped";
  detail: string;
};

export type PurchaseTestResult = {
  ok: boolean;
  orderNumber: string | null;
  steps: PurchaseTestStep[];
};

export type PurchaseTestInput = {
  productSlug: string;
  tierId: string;
  email: string;
  paymentMethod: "card" | "transfer";
  sendLicenseEmail: boolean;
  cleanup: boolean;
};

export async function runFullPurchaseTest(
  input: PurchaseTestInput,
): Promise<PurchaseTestResult> {
  const steps: PurchaseTestStep[] = [];
  const push = (step: PurchaseTestStep) => steps.push(step);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1. Order
  const { createTestOrder } = await import("./admin.server");
  const created = await createTestOrder({
    productSlug: input.productSlug,
    tierId: input.tierId,
    quantity: 1,
    billingName: "Teljes teszt – EXCELlent BI",
    companyName: "",
    taxNumber: "",
    country: "Magyarország",
    postalCode: "1076",
    city: "Budapest",
    addressLine: "Péterfy Sándor u. 9.",
    email: input.email,
    phone: "20/962-2176",
  });

  if (!created.ok) {
    push({
      key: "order",
      label: "Megrendelés rögzítése",
      status: "error",
      detail: created.error,
    });
    return { ok: false, orderNumber: null, steps };
  }

  const orderNumber = created.orderNumber;
  push({
    key: "order",
    label: "Megrendelés rögzítése",
    status: "ok",
    detail: `${orderNumber} – ${created.total} Ft`,
  });

  const { data: orderRow } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .maybeSingle();
  const orderId = orderRow?.id as string | undefined;
  if (!orderId) {
    push({
      key: "order-id",
      label: "Megrendelés visszaolvasása",
      status: "error",
      detail: "A rögzített megrendelés nem található.",
    });
    return { ok: false, orderNumber, steps };
  }

  // 2. Payment
  if (input.paymentMethod === "transfer") {
    const { approveTransfer } = await import("./admin.server");
    const approved = await approveTransfer(orderId, `TESZT-ATUTALAS-${Date.now()}`);
    push({
      key: "payment",
      label: "Fizetés – banki átutalás jóváhagyása",
      status: approved.ok ? "ok" : "error",
      detail: approved.ok
        ? "Az átutalás jóváhagyva, a fizetett folyamat lefutott."
        : (approved.error ?? "A jóváhagyás nem sikerült."),
    });
  } else {
    const { getProduct, getTier } = await import("./products");
    const product = getProduct(input.productSlug);
    const tier = product ? getTier(product, input.tierId) : null;

    try {
      const { createStripeClient } = await import("./stripe.server");
      const liveReady = Boolean(
        process.env["STRIPE_LIVE_API_KEY"] && process.env["PAYMENTS_LIVE_WEBHOOK_SECRET"],
      );
      const stripe = createStripeClient(liveReady ? "live" : "sandbox");
      const prices = await stripe.prices.list({ lookup_keys: [tier?.priceId ?? ""] });
      const price = prices.data[0];
      if (!price) throw new Error("A termék árazása nem található a Stripe-ban.");
      push({
        key: "stripe",
        label: "Stripe árazás ellenőrzése",
        status: "ok",
        detail: `Ár rendben (${price.id}) a ${liveReady ? "live" : "sandbox"} Stripe fiókban.`,
      });
    } catch (e: any) {
      push({
        key: "stripe",
        label: "Stripe árazás ellenőrzése",
        status: "warn",
        detail: e?.message ?? "A Stripe ellenőrzés nem sikerült.",
      });
    }

    // Exercises exactly the webhook fulfilment path (markOrderPaid) without a
    // real card charge.
    const { markOrderPaid } = await import("./order-paid.server");
    await markOrderPaid({
      orderNumber,
      paymentReference: `pi_selftest_${Date.now()}`,
    });
    const { data: paid } = await supabaseAdmin
      .from("orders")
      .select("payment_status")
      .eq("id", orderId)
      .maybeSingle();
    push({
      key: "payment",
      label: "Fizetés – kártyás (webhook teljesítési lánc)",
      status: paid?.payment_status === "paid" ? "ok" : "error",
      detail:
        paid?.payment_status === "paid"
          ? "A webhook teljesítési lánc lefutott, a megrendelés fizetett."
          : `Váratlan fizetési státusz: ${paid?.payment_status ?? "ismeretlen"}`,
    });
  }

  // 3. Invoice
  const { data: afterPay } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  const invoiceId = (afterPay?.billingo_invoice_id as number | null) ?? null;
  push({
    key: "invoice",
    label: "Billingo számla",
    status: invoiceId ? "ok" : "error",
    detail: invoiceId
      ? `Számlaszám: ${afterPay?.billingo_invoice_number ?? "?"} (id ${invoiceId})`
      : "Nem jött létre számla – nézd meg a Számlázás naplót.",
  });

  // 4. Download link
  const { data: downloads } = await (supabaseAdmin as any)
    .from("order_downloads")
    .select("token, expires_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1);
  const download = Array.isArray(downloads) ? downloads[0] : null;
  push({
    key: "download",
    label: "Letöltő link",
    status: download ? "ok" : "error",
    detail: download
      ? `Token létrejött, lejárat: ${new Date(download.expires_at).toLocaleString("hu-HU")}`
      : "Nem jött létre letöltési token.",
  });

  // 5. License email
  if (input.sendLicenseEmail) {
    const { sendLicense } = await import("./admin.server");
    const result = await sendLicense(orderId, `TESZT-LICENSZ-${Date.now()}`);
    push({
      key: "license",
      label: "Licensz e-mail",
      status: result.ok ? "ok" : "error",
      detail: result.ok
        ? `Kiküldve: ${new Date(result.sentAt!).toLocaleString("hu-HU")}`
        : (result.error ?? "A licensz kiküldése nem sikerült."),
    });
  } else {
    push({
      key: "license",
      label: "Licensz e-mail",
      status: "skipped",
      detail: "Nem kértél licensz kiküldést ehhez a teszthez.",
    });
  }

  // 6. Cleanup
  if (input.cleanup) {
    let detail = "";
    if (invoiceId && afterPay) {
      const { cancelInvoiceForOrder } = await import("./billingo.server");
      const canceled = await cancelInvoiceForOrder(afterPay as any, {
        reason: "Teljes vásárlási teszt utáni automatikus sztornó.",
        source: "self_test",
      });
      detail = canceled.ok
        ? "A teszt számla sztornózva. "
        : `A számla sztornózása nem sikerült: ${canceled.error}. `;
    }
    const { deleteTestOrder } = await import("./admin.server");
    const removed = await deleteTestOrder(orderId);
    detail += removed.ok
      ? "A teszt megrendelés törölve."
      : `A teszt megrendelés törlése nem sikerült: ${removed.error ?? "ismeretlen hiba"}`;
    push({
      key: "cleanup",
      label: "Takarítás",
      status: removed.ok ? "ok" : "warn",
      detail,
    });
  } else {
    push({
      key: "cleanup",
      label: "Takarítás",
      status: "skipped",
      detail: "A teszt megrendelés és a számla megmaradt ellenőrzésre.",
    });
  }

  const ok = steps.every((s) => s.status === "ok" || s.status === "skipped");
  return { ok, orderNumber, steps };
}
