import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";

import { CouponCodeChecker } from "@/components/CouponCodeChecker";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PaymentEnvironmentNotice } from "@/components/PaymentEnvironmentNotice";
import { StripeOrderCheckout } from "@/components/StripeOrderCheckout";
import { AAM_PRICE_NOTE_SHORT, aamText } from "@/lib/aam";
import { isCardPaymentAvailable } from "@/lib/stripe";
import { formatPrice, getProduct, getTier, products } from "@/lib/products";
import { submitOrder } from "@/lib/order.functions";

const TITLE = "Megrendelés | EXCELlent digitális termékek";
const DESC =
  "Add le a megrendelésedet az EXCELlent digitális termékeire. Számlázási adatok megadása, visszaigazoló e-maillel.";

const searchSchema = z.object({
  termek: z.string().optional(),
  csomag: z.string().optional(),
});

export const Route = createFileRoute("/megrendeles")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: OrderPage,
});

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40";

function OrderPage() {
  const { termek, csomag } = Route.useSearch();
  const submit = useServerFn(submitOrder);

  const orderable = products.filter((p) => p.status === "available");
  const initialSlug =
    termek && getProduct(termek)?.status === "available" ? termek : orderable[0]!.slug;
  const [slug, setSlug] = useState(initialSlug);
  const [tierId, setTierId] = useState(
    () => getTier(getProduct(initialSlug)!, csomag).id,
  );
  const [quantity, setQuantity] = useState(1);
  const cardAvailable = isCardPaymentAvailable();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">(
    cardAvailable ? "card" : "transfer",
  );
  const [status, setStatus] = useState<
    "idle" | "sending" | "done" | "paying" | "error"
  >("idle");
  const [customerEmail, setCustomerEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const product = getProduct(slug) ?? orderable[0]!;
  const tier = getTier(product, tierId);
  const total = tier.price * quantity;

  function selectProduct(nextSlug: string) {
    setSlug(nextSlug);
    setTierId(getTier(getProduct(nextSlug)!).id);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    setErrorMessage("");

    try {
      const result = await submit({
        data: {
          productSlug: slug,
          tierId: tier.id,
          quantity,
          billingName: String(fd.get("billingName") ?? ""),
          companyName: String(fd.get("companyName") ?? ""),
          taxNumber: String(fd.get("taxNumber") ?? ""),
          country: String(fd.get("country") ?? ""),
          postalCode: String(fd.get("postalCode") ?? ""),
          city: String(fd.get("city") ?? ""),
          addressLine: String(fd.get("addressLine") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          note: String(fd.get("note") ?? ""),
          paymentMethod,
          acceptTerms: true,
          acceptPrivacy: true,
          acceptWithdrawal: true,
          website: String(fd.get("website") ?? ""),
        },
      });

      if (result.ok) {
        setOrderNumber(result.orderNumber);
        if (paymentMethod === "card") {
          setCustomerEmail(String(fd.get("email") ?? ""));
          setStatus("paying");
        } else {
          setStatus("done");
          form.reset();
        }
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        "A megrendelés beküldése nem sikerült. Kérlek, ellenőrizd az adatokat, vagy írj a info@xlntbi.hu címre.",
      );
    }
  }

  if (status === "paying") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <PaymentTestModeBanner />
        <h1 className="mt-4 text-3xl font-bold text-foreground">Bankkártyás fizetés</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          A rendelésed rögzítettem (<strong className="text-foreground">{orderNumber}</strong>).
          A fizetés befejezéséhez töltsd ki az alábbi biztonságos fizetési űrlapot. A
          visszaigazolást és a számlát a sikeres fizetés után küldöm e-mailben.
        </p>
        <PaymentEnvironmentNotice className="mt-6" />
        <CouponCodeChecker amount={total} priceId={tier.priceId} />
        <StripeOrderCheckout
          priceId={tier.priceId}
          quantity={quantity}
          orderNumber={orderNumber}
          customerEmail={customerEmail}
        />
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <h1 className="text-3xl font-bold text-foreground">Köszönöm a megrendelésedet!</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          A rendelésed száma: <strong className="text-foreground">{orderNumber}</strong>. A
          visszaigazolást elküldtem a megadott e-mail címre. A számlát és a letöltési tudnivalókat
          hamarosan megkapod.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/termekeim"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
          >
            Vissza a termékekhez
          </Link>
          <Link
            to="/kapcsolat"
            className="inline-flex items-center rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Kapcsolat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <PaymentTestModeBanner />
      <h1 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">Megrendelés</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Digitális termékről van szó, ezért csak számlázási adatokra van szükség – szállítási címre
        nincs. A megrendelés leadása után visszaigazoló e-mailt kapsz, és elküldöm a számlát, majd a
        letöltés részleteit. Fizethetsz bankkártyával azonnal, vagy választhatsz banki
        átutalást.
      </p>

      <form onSubmit={onSubmit} className="mt-8 rounded-xl border border-border bg-card p-6 md:p-8">
        <label className="block text-sm font-semibold text-foreground">
          Termék *
          <select
            name="productSlug"
            value={slug}
            onChange={(e) => selectProduct(e.target.value)}
            className={inputClass}
          >
            {orderable.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-foreground">Licenc csomag</legend>
          <div className="mt-3 space-y-2">
            {product.tiers.map((t) => (
              <label
                key={t.id}
                className="flex items-start gap-3 rounded-md border border-border p-3 text-sm text-foreground"
              >
                <input
                  type="radio"
                  name="tierId"
                  value={t.id}
                  checked={tier.id === t.id}
                  onChange={() => setTierId(t.id)}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span>
                  {aamText(t.label)} – {formatPrice(t.price)}
                  {t.note ? (
                    <span className="block text-xs text-muted-foreground">{aamText(t.note)}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-foreground">
            Darabszám *
            <input
              type="number"
              min={1}
              max={20}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              className={inputClass}
            />
          </label>
          <div className="flex items-end">
            <p className="text-sm text-muted-foreground">
              Fizetendő:{" "}
              <strong className="text-lg text-foreground">{formatPrice(total)}</strong>
              <span className="block text-xs text-muted-foreground">{AAM_PRICE_NOTE_SHORT}</span>
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Számlázási adatok
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-foreground">
            Számlázási név *
            <input name="billingName" required minLength={2} maxLength={160} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Cégnév
            <input name="companyName" maxLength={160} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Adószám
            <input name="taxNumber" maxLength={40} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Ország *
            <input
              name="country"
              required
              defaultValue="Magyarország"
              maxLength={80}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Postai irányítószám *
            <input name="postalCode" required minLength={2} maxLength={20} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Település *
            <input name="city" required minLength={2} maxLength={80} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground sm:col-span-2">
            Utca, házszám *
            <input name="addressLine" required minLength={3} maxLength={200} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            E-mail *
            <input name="email" type="email" required maxLength={160} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Telefonszám *
            <input name="phone" type="tel" required minLength={6} maxLength={30} className={inputClass} />
          </label>
        </div>

        <label className="mt-6 block text-sm font-medium text-foreground">
          Megjegyzés
          <textarea name="note" maxLength={2000} rows={4} className={inputClass} />
        </label>

        {/* Honeypot – rejtett spamcsapda, ne töltsd ki */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="mt-8 space-y-3 text-sm text-muted-foreground">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              Elfogadom az{" "}
              <a href="/aszf" className="underline hover:text-foreground">
                Általános Szerződési Feltételeket
              </a>
              . *
            </span>
          </label>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              Megismertem az{" "}
              <a href="/adatvedelmi-tajekoztato" className="underline hover:text-foreground">
                Adatvédelmi tájékoztatót
              </a>
              . *
            </span>
          </label>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              Tudomásul veszem, hogy digitális tartalom esetén a teljesítés megkezdése után az{" "}
              <a href="/elallas-a-szerzodestol" className="underline hover:text-foreground">
                elállási jogom
              </a>{" "}
              megszűnik. *
            </span>
          </label>
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-semibold text-foreground">Fizetési mód</legend>
          <PaymentEnvironmentNotice className="mt-3" />
          <div className="mt-3 space-y-2">
            {cardAvailable ? (
              <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm text-foreground">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span>
                  Bankkártyás fizetés
                  <span className="block text-xs text-muted-foreground">
                    Azonnali, biztonságos fizetés a Stripe felületén. A visszaigazolás a sikeres
                    fizetés után érkezik.
                  </span>
                </span>
              </label>
            ) : null}
            <label className="flex items-start gap-3 rounded-md border border-border p-3 text-sm text-foreground">
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={paymentMethod === "transfer"}
                onChange={() => setPaymentMethod("transfer")}
                className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
              />
              <span>
                Banki átutalás
                <span className="block text-xs text-muted-foreground">
                  A számlát a fizetési adatokkal e-mailben küldöm, a letöltés a teljesítés után
                  érhető el.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        {status === "error" ? (
          <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {status === "sending"
            ? "Küldés folyamatban…"
            : paymentMethod === "card"
              ? "Tovább a fizetéshez"
              : "Megrendelés elküldése"}
        </button>
      </form>
    </div>
  );
}
