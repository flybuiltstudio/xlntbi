import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import {
  adminApproveTransfer,
  adminListOrders,
  adminResendDownload,
} from "@/lib/admin.functions";
import { formatPrice } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin – megrendelések | EXCELlent Business Intelligence" },
      {
        name: "description",
        content: "Belső felület a megrendelések és az átutalásos fizetések kezelésére.",
      },
      { property: "og:title", content: "Admin – megrendelések" },
      { property: "og:description", content: "Belső adminisztrációs felület." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Order = Awaited<ReturnType<typeof adminListOrders>>["orders"][number];

const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function AdminPage() {
  const [session, setSession] = useState<{ email: string | null } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? { email: data.session.user.email ?? null } : null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { email: s.user.email ?? null } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold text-foreground">Megrendelések</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Belső felület: átutalásos megrendelések jóváhagyása és a letöltési linkek kiküldése.
      </p>

      {!ready ? (
        <p className="mt-10 text-sm text-muted-foreground">Betöltés…</p>
      ) : session ? (
        <OrdersPanel email={session.email} />
      ) : (
        <LoginPanel />
      )}
    </div>
  );
}

function LoginPanel() {
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(event.currentTarget);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    setStatus("idle");
    if (signInError) setError("Hibás e-mail cím vagy jelszó.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 max-w-md rounded-xl border border-border bg-card p-6"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Bejelentkezés
      </h2>
      <label className="mt-4 block text-sm font-medium text-foreground">
        E-mail
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="mt-4 block text-sm font-medium text-foreground">
        Jelszó
        <input name="password" type="password" required className={inputClass} />
      </label>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "sending" ? "Belépés…" : "Belépés"}
      </button>
    </form>
  );
}

function OrdersPanel({ email }: { email: string | null }) {
  const load = useServerFn(adminListOrders);
  const approve = useServerFn(adminApproveTransfer);
  const resend = useServerFn(adminResendDownload);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setError("");
    try {
      const result = await load();
      setOrders(result.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A megrendelések betöltése nem sikerült.");
      setOrders([]);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onApprove(order: Order) {
    const reference = window.prompt(
      `Átutalás azonosítója / megjegyzés (${order.orderNumber}):`,
      "",
    );
    if (reference === null) return;
    setBusy(order.id);
    setMessage("");
    try {
      const result = await approve({ data: { orderId: order.id, reference } });
      setMessage(
        result.ok
          ? `${order.orderNumber}: jóváhagyva, a letöltési link kiküldve.`
          : (result.error ?? "Hiba történt."),
      );
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  async function onResend(order: Order) {
    setBusy(order.id);
    setMessage("");
    try {
      const result = await resend({ data: { orderId: order.id } });
      setMessage(
        result.ok
          ? `${order.orderNumber}: új letöltési link kiküldve.`
          : (result.error ?? "Hiba történt."),
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          Bejelentkezve: <strong className="text-foreground">{email}</strong>
        </span>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-md border border-input px-3 py-1.5 font-medium text-foreground hover:bg-accent"
        >
          Frissítés
        </button>
        <button
          type="button"
          onClick={() => void supabase.auth.signOut()}
          className="rounded-md border border-input px-3 py-1.5 font-medium text-foreground hover:bg-accent"
        >
          Kilépés
        </button>
      </div>

      {message ? (
        <p className="mt-6 rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {orders === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Betöltés…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Még nincs megrendelés.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-border bg-card p-5 text-sm text-foreground"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    {order.productName}
                    {order.tierLabel ? ` – ${order.tierLabel}` : ""}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.orderNumber} · {new Date(order.createdAt).toLocaleString("hu-HU")} ·{" "}
                    {order.quantity} db · {formatPrice(order.totalPrice)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    order.paymentStatus === "paid"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {order.paymentStatus === "paid" ? "Rendezett" : "Fizetésre vár"} ·{" "}
                  {order.paymentProvider === "stripe" ? "kártya" : "átutalás"}
                </span>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                  <dt className="inline font-semibold">Név: </dt>
                  <dd className="inline">{order.billingName}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">E-mail: </dt>
                  <dd className="inline">{order.email}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Telefon: </dt>
                  <dd className="inline">{order.phone}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Cím: </dt>
                  <dd className="inline">{order.address}</dd>
                </div>
                {order.companyName ? (
                  <div>
                    <dt className="inline font-semibold">Cég: </dt>
                    <dd className="inline">{order.companyName}</dd>
                  </div>
                ) : null}
                {order.taxNumber ? (
                  <div>
                    <dt className="inline font-semibold">Adószám: </dt>
                    <dd className="inline">{order.taxNumber}</dd>
                  </div>
                ) : null}
                {order.paymentReference ? (
                  <div>
                    <dt className="inline font-semibold">Fizetési hivatkozás: </dt>
                    <dd className="inline">{order.paymentReference}</dd>
                  </div>
                ) : null}
                {order.note ? (
                  <div className="sm:col-span-2">
                    <dt className="inline font-semibold">Megjegyzés: </dt>
                    <dd className="inline">{order.note}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.paymentStatus !== "paid" ? (
                  <button
                    type="button"
                    disabled={busy === order.id}
                    onClick={() => void onApprove(order)}
                    className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-60"
                  >
                    {busy === order.id ? "Feldolgozás…" : "Beérkezett az utalás – jóváhagyom"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy === order.id}
                    onClick={() => void onResend(order)}
                    className="rounded-md border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-60"
                  >
                    {busy === order.id ? "Küldés…" : "Letöltési link újraküldése"}
                  </button>
                )}
                <a
                  href={`mailto:${order.email}?subject=${encodeURIComponent(order.orderNumber)}`}
                  className="rounded-md border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  E-mail a vevőnek
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
