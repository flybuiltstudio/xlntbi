import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { CreditCard, FlaskConical, Loader2, RefreshCw, Trash2 } from "lucide-react";

import {
  adminCreateTestOrder,
  adminDeleteTestOrder,
  adminListTestOrders,
} from "@/lib/admin.functions";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { FullPurchaseTestPanel } from "@/components/FullPurchaseTestPanel";
import { StripeOrderCheckout } from "@/components/StripeOrderCheckout";
import { PageHero } from "@/components/PageHero";
import { formatPrice, getProduct, getTier, products } from "@/lib/products";
import { isCardPaymentAvailable } from "@/lib/stripe";

export const Route = createFileRoute("/admin/fizetes-teszt")({
  head: () => ({
    meta: [
      { title: "Admin – fizetés teszt | EXCELlent Business Intelligence" },
      {
        name: "description",
        content: "Belső tesztfelület a számlázási adatok bekérésének és a bankkártyás fizetésnek.",
      },
      { property: "og:title", content: "Admin – fizetés teszt" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentTestPage,
});

type TestOrderRow = Awaited<ReturnType<typeof adminListTestOrders>>["orders"][number];

type CreatedOrder = {
  orderNumber: string;
  total: number;
  priceId: string;
  quantity: number;
  customerEmail: string;
};

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40";

function PaymentTestPage() {
  return (
    <>
      <PageHero>
        <h1 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
          Fizetés teszt
        </h1>
      </PageHero>
      <div className="mx-auto max-w-4xl px-4 py-14">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Belső tesztfelület: itt ellenőrizheted a számlázási adatok bekérését és a teljes
          bankkártyás (Stripe) fizetési folyamatot éles pénzmozgás nélkül. A teszt megrendelések{" "}
          <strong className="text-foreground">TESZT-</strong> előtagot kapnak,{" "}
          <strong className="text-foreground">nem szerepelnek a statisztikában</strong>, és
          rögzítéskor nem megy ki e-mail. Ha sandbox fizetést is indítasz hozzá, a sikeres
          fizetés után a rendszer az éles folyamathoz hasonlóan kiküldi a visszaigazolást és a
          letöltési linket a megadott e-mail címre.
        </p>
        <FullPurchaseTestPanel />
        <TestPanel />
      </div>
    </>
  );
}

function TestPanel() {
  const createOrder = useServerFn(adminCreateTestOrder);
  const listOrders = useServerFn(adminListTestOrders);
  const deleteOrder = useServerFn(adminDeleteTestOrder);

  const orderable = products.filter((p) => p.status === "available");
  const [slug, setSlug] = useState(orderable[0]!.slug);
  const [tierId, setTierId] = useState(() => getTier(orderable[0]!).id);
  const [quantity, setQuantity] = useState(1);

  const [phase, setPhase] = useState<"form" | "sending" | "created" | "paying">("form");
  const [created, setCreated] = useState<CreatedOrder | null>(null);
  const [error, setError] = useState("");

  const [testOrders, setTestOrders] = useState<TestOrderRow[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cardAvailable = isCardPaymentAvailable();
  const product = getProduct(slug) ?? orderable[0]!;
  const tier = getTier(product, tierId);

  const refreshList = useCallback(() => {
    listOrders()
      .then((r) => setTestOrders(r.orders))
      .catch(() => setTestOrders([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  function selectProduct(nextSlug: string) {
    setSlug(nextSlug);
    setTierId(getTier(getProduct(nextSlug)!).id);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setPhase("sending");
    setError("");
    try {
      const result = await createOrder({
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
        },
      });
      if (result.ok) {
        setCreated({
          orderNumber: result.orderNumber,
          total: result.total,
          priceId: result.priceId,
          quantity: result.quantity,
          customerEmail: result.customerEmail,
        });
        setPhase("created");
        refreshList();
      } else {
        setPhase("form");
        setError(result.error);
      }
    } catch {
      setPhase("form");
      setError("A teszt megrendelés rögzítése nem sikerült. Ellenőrizd a mezőket.");
    }
  }

  async function onDelete(orderId: string) {
    setDeletingId(orderId);
    setError("");
    try {
      const result = await deleteOrder({ data: { orderId } });
      if (!result.ok) setError(result.error ?? "A törlés nem sikerült.");
      refreshList();
    } catch {
      setError("A törlés nem sikerült.");
    } finally {
      setDeletingId(null);
    }
  }

  function resetFlow() {
    setCreated(null);
    setPhase("form");
    setError("");
  }

  return (
    <div className="mt-8">
      <PaymentTestModeBanner />

      {error ? (
        <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {/* 1. lépés – teszt megrendelés rögzítése */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <FlaskConical className="h-5 w-5 text-primary" />
          1. lépés – Teszt megrendelés rögzítése
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ugyanazok a számlázási mezők és ugyanaz a szerveroldali validáció, mint a nyilvános
          megrendelőlapon.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium text-foreground sm:col-span-2">
              Termék
              <select
                className={inputClass}
                value={slug}
                onChange={(e) => selectProduct(e.target.value)}
              >
                {orderable.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-foreground">
              Mennyiség
              <input
                type="number"
                min={1}
                max={20}
                className={inputClass}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              />
            </label>
          </div>

          {product.tiers.length > 1 ? (
            <label className="block text-sm font-medium text-foreground">
              Licenc csomag
              <select
                className={inputClass}
                value={tier.id}
                onChange={(e) => setTierId(e.target.value)}
              >
                {product.tiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} – {formatPrice(t.price)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-foreground">
              Számlázási név *
              <input name="billingName" required className={inputClass} defaultValue="Teszt Elek" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Cégnév
              <input name="companyName" className={inputClass} placeholder="Opcionális" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Adószám
              <input name="taxNumber" className={inputClass} placeholder="Opcionális" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Ország *
              <input name="country" required className={inputClass} defaultValue="Magyarország" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Irányítószám *
              <input name="postalCode" required className={inputClass} defaultValue="1011" />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Város *
              <input name="city" required className={inputClass} defaultValue="Budapest" />
            </label>
            <label className="block text-sm font-medium text-foreground sm:col-span-2">
              Utca, házszám *
              <input
                name="addressLine"
                required
                className={inputClass}
                defaultValue="Teszt utca 1."
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              E-mail *
              <input
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="Ide megy a teszt visszaigazolás"
              />
            </label>
            <label className="block text-sm font-medium text-foreground">
              Telefon *
              <input name="phone" required className={inputClass} defaultValue="209622176" />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={phase === "sending"}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {phase === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Teszt megrendelés rögzítése – {formatPrice(tier.price * quantity)}
            </button>
            {phase !== "form" ? (
              <button
                type="button"
                onClick={resetFlow}
                className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
              >
                Új teszt indítása
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {/* 2. lépés – Stripe teszt fizetés */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <CreditCard className="h-5 w-5 text-primary" />
          2. lépés – Bankkártyás fizetés tesztelése (sandbox)
        </h2>

        {created ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              A teszt megrendelés rögzítve:{" "}
              <strong className="text-foreground">{created.orderNumber}</strong> –{" "}
              <strong className="text-foreground">{formatPrice(created.total)}</strong>. Teszt
              kártya: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">4242 4242 4242 4242</code>
              , tetszőleges jövőbeli dátum és CVC.
            </p>
            {phase === "paying" ? (
              cardAvailable ? (
                <StripeOrderCheckout
                  priceId={created.priceId}
                  quantity={created.quantity}
                  orderNumber={created.orderNumber}
                  customerEmail={created.customerEmail}
                  productLabel={`${product.name} – ${tier.label}`}
                />
              ) : (
                <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  A bankkártyás fizetés ehhez a buildhez nincs beállítva (hiányzik a Stripe
                  kliens-token).
                </p>
              )
            ) : (
              <button
                type="button"
                onClick={() => setPhase("paying")}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
              >
                <CreditCard className="h-4 w-4" />
                Stripe teszt fizetés indítása
              </button>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Először rögzíts egy teszt megrendelést az 1. lépésben – utána tudod elindítani hozzá a
            sandbox kártyás fizetést.
          </p>
        )}
      </section>

      {/* Korábbi teszt megrendelések */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">Korábbi teszt megrendelések</h2>
          <button
            type="button"
            onClick={refreshList}
            className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Frissítés
          </button>
        </div>

        {testOrders === null ? (
          <p className="mt-4 text-sm text-muted-foreground">Betöltés…</p>
        ) : testOrders.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Még nincs teszt megrendelés.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Rendelésszám</th>
                  <th className="px-3 py-2 font-semibold">Termék</th>
                  <th className="px-3 py-2 font-semibold">E-mail</th>
                  <th className="px-3 py-2 text-right font-semibold">Összeg</th>
                  <th className="px-3 py-2 font-semibold">Állapot</th>
                  <th className="px-3 py-2 text-right font-semibold">Törlés</th>
                </tr>
              </thead>
              <tbody>
                {testOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-foreground">{o.orderNumber}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {o.productName}
                      {o.tierLabel ? ` – ${o.tierLabel}` : ""} ({o.quantity} db)
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{o.email}</td>
                    <td className="px-3 py-2.5 text-right text-foreground">
                      {formatPrice(o.totalPrice)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          o.paymentStatus === "paid"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {o.paymentStatus === "paid" ? "Rendezett" : "Fizetésre vár"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(o.id)}
                        disabled={deletingId === o.id}
                        className="inline-flex items-center gap-1 rounded-md border border-input px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        {deletingId === o.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Törlés
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
