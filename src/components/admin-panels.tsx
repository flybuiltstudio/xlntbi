import { useServerFn } from "@tanstack/react-start";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  adminApproveTransfer,
  adminCreateProductUploadUrl,
  adminCreateUser,
  adminDeleteCalculatorOverride,
  adminDeleteUser,
  adminInvoiceUrl,
  adminListCalculatorOverrides,
  adminListInvoiceLogs,
  adminListOrders,
  adminListProductFiles,
  adminListProductPlacements,
  adminListUsers,
  adminResetProductPlacements,
  adminResendDownload,
  adminSaveProductPlacements,
  adminRetryInvoice,
  adminUpdateUserRole,
  adminUploadCalculatorVersion,
} from "@/lib/admin.functions";
import { formatPrice, products } from "@/lib/products";
import { applyPlacements, productCategories } from "@/lib/product-categories";
import { CALCULATORS, calculatorLabel } from "@/lib/calculators/registry";
import { MONTHS, MONTHS_SHORT } from "@/lib/stats-export";
import { supabase } from "@/integrations/supabase/client";

export function filterChip(active: boolean) {
  return `rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "border border-input text-muted-foreground hover:bg-accent hover:text-foreground"
  }`;
}

export type Order = Awaited<ReturnType<typeof adminListOrders>>["orders"][number];
export type AdminUserRow = Awaited<ReturnType<typeof adminListUsers>>["users"][number];

export type AdminRole = "admin" | "user";
export type AdminSession = { email: string | null; userId: string; role: AdminRole | null };

export const AdminSessionContext = createContext<AdminSession>({ email: null, userId: "", role: null });

export function useAdminSession(): AdminSession {
  return useContext(AdminSessionContext);
}

export const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

export function LoginPanel() {
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    if (mode === "reset") {
      // Always show the same confirmation so the endpoint can't be used to
      // probe which addresses have an account.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/jelszo`,
      });
      setStatus("idle");
      setResetSent(true);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
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
        {mode === "login" ? "Bejelentkezés" : "Elfelejtett jelszó"}
      </h2>
      {mode === "reset" ? (
        resetSent ? (
          <p className="mt-4 rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground">
            Ha ez az e-mail cím szerepel a rendszerben, elküldtük rá a
            jelszó-visszaállító levelet. Nyisd meg a benne lévő linket, és adj
            meg új jelszót.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Add meg az admin e-mail címedet – arra küldünk egy linket, amivel
            új jelszót állíthatsz be.
          </p>
        )
      ) : null}
      <label className="mt-4 block text-sm font-medium text-foreground">
        E-mail
        <input name="email" type="email" required className={inputClass} />
      </label>
      {mode === "login" ? (
        <label className="mt-4 block text-sm font-medium text-foreground">
          Jelszó
          <input name="password" type="password" required className={inputClass} />
        </label>
      ) : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {mode === "reset" && resetSent ? null : (
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-60"
          >
            {status === "sending"
              ? mode === "login" ? "Belépés…" : "Küldés…"
              : mode === "login" ? "Belépés" : "Visszaállító e-mail küldése"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "reset" : "login");
            setResetSent(false);
            setError("");
          }}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {mode === "login" ? "Elfelejtetted a jelszavad?" : "Vissza a belépéshez"}
        </button>
      </div>
    </form>
  );
}

export function OrdersPanel({ email }: { email: string | null }) {
  const load = useServerFn(adminListOrders);
  const approve = useServerFn(adminApproveTransfer);
  const resend = useServerFn(adminResendDownload);
  const retryInvoice = useServerFn(adminRetryInvoice);
  const invoiceUrl = useServerFn(adminInvoiceUrl);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [invoiceFilter, setInvoiceFilter] = useState<"all" | "invoiced" | "not-invoiced">("all");
  const [yearSel, setYearSel] = useState<number | "all">("all");
  const [monthSel, setMonthSel] = useState<number | "all">("all");

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const order of orders ?? []) set.add(new Date(order.createdAt).getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [orders]);

  const activeYear = yearSel === "all" ? null : yearSel;
  const activeMonth = activeYear === null ? "all" : monthSel;

  const filteredOrders = useMemo(
    () =>
      (orders ?? []).filter((order) => {
        if (payFilter === "paid" && order.paymentStatus !== "paid") return false;
        if (payFilter === "unpaid" && order.paymentStatus === "paid") return false;
        if (invoiceFilter === "invoiced" && !order.billingoInvoiceNumber) return false;
        if (invoiceFilter === "not-invoiced" && order.billingoInvoiceNumber) return false;
        const date = new Date(order.createdAt);
        if (activeYear !== null && date.getFullYear() !== activeYear) return false;
        if (activeMonth !== "all" && date.getMonth() !== activeMonth) return false;
        return true;
      }),
    [orders, payFilter, invoiceFilter, activeYear, activeMonth],
  );

  const selectYear = (y: number | "all") => {
    setYearSel(y);
    if (y === "all") setMonthSel("all");
  };

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

  async function onRetryInvoice(order: Order) {
    setBusy(order.id);
    setMessage("");
    try {
      const result = await retryInvoice({ data: { orderId: order.id } });
      setMessage(
        result.ok
          ? `${order.orderNumber}: Billingo számla kiállítva${
              result.invoiceNumber ? ` (${result.invoiceNumber})` : ""
            }.`
          : (result.error ?? "Hiba történt."),
      );
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  /** Opens or downloads the Billingo invoice PDF via its public URL. */
  async function onInvoicePdf(order: Order, mode: "open" | "download") {
    setBusy(order.id);
    setMessage("");
    try {
      const result = await invoiceUrl({ data: { orderId: order.id } });
      if (!result.ok) {
        setMessage(result.error ?? "A számla nem érhető el.");
      } else if (mode === "open") {
        window.open(result.url, "_blank", "noopener");
      } else {
        const link = document.createElement("a");
        link.href = result.url;
        link.download = `${result.invoiceNumber || order.orderNumber}.pdf`;
        link.rel = "noopener";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
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

      {orders !== null && orders.length > 0 ? (
        <div className="mt-6 space-y-4 rounded-xl border border-border bg-card px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fizetés
            </span>
            {(
              [
                { id: "all", label: "Összes" },
                { id: "paid", label: "Rendezett" },
                { id: "unpaid", label: "Fizetésre vár" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={filterChip(payFilter === opt.id)}
                onClick={() => setPayFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Számlázva
            </span>
            {(
              [
                { id: "all", label: "Összes" },
                { id: "invoiced", label: "Számlázva" },
                { id: "not-invoiced", label: "Még nincs" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={filterChip(invoiceFilter === opt.id)}
                onClick={() => setInvoiceFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Év
            </span>
            <button
              type="button"
              className={filterChip(yearSel === "all")}
              onClick={() => selectYear("all")}
            >
              Összes év
            </button>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={filterChip(yearSel === y)}
                onClick={() => selectYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hónap
            </span>
            <button
              type="button"
              disabled={activeYear === null}
              className={filterChip(activeMonth === "all") + " disabled:cursor-not-allowed disabled:opacity-50"}
              onClick={() => setMonthSel("all")}
            >
              Összes
            </button>
            {MONTHS_SHORT.map((label, i) => (
              <button
                key={label}
                type="button"
                disabled={activeYear === null}
                className={filterChip(activeMonth === i) + " disabled:cursor-not-allowed disabled:opacity-50"}
                onClick={() => setMonthSel(i)}
                title={MONTHS[i]}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredOrders.length} / {orders.length} megrendelés látszik
          </p>
        </div>
      ) : null}

      {orders === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Betöltés…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Még nincs megrendelés.</p>
      ) : filteredOrders.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          A kiválasztott szűréshez nem tartozik megrendelés.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {filteredOrders.map((order) => (
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
                {order.paymentStatus === "paid" ? (
                  <div>
                    <dt className="inline font-semibold">Billingo számla: </dt>
                    <dd className="inline">
                      {order.billingoInvoiceNumber
                        ? order.billingoInvoiceNumber
                        : "még nincs"}
                    </dd>
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
                {order.paymentStatus === "paid" ? (
                  <button
                    type="button"
                    disabled={busy === order.id || !!order.billingoInvoiceNumber}
                    onClick={() => void onRetryInvoice(order)}
                    className="rounded-md border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-60"
                    title={
                      order.billingoInvoiceNumber
                        ? "Már ki van állítva számla"
                        : "Billingo számla kiállítása / újrakísérlet"
                    }
                  >
                    {busy === order.id
                      ? "Feldolgozás…"
                      : order.billingoInvoiceNumber
                        ? "Számlázva ✓"
                        : "Számlázás"}
                  </button>
                ) : null}
                {order.billingoInvoiceId ? (
                  <>
                    <button
                      type="button"
                      disabled={busy === order.id}
                      onClick={() => void onInvoicePdf(order, "open")}
                      className="rounded-md border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-60"
                      title={`Számla megnyitása új lapon (${order.billingoInvoiceNumber})`}
                    >
                      Számla megnyitása
                    </button>
                    <button
                      type="button"
                      disabled={busy === order.id}
                      onClick={() => void onInvoicePdf(order, "download")}
                      className="rounded-md border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-60"
                      title={`Számla PDF letöltése (${order.billingoInvoiceNumber})`}
                    >
                      Számla letöltése
                    </button>
                  </>
                ) : null}
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

export function UsersPanel({ currentUserId }: { currentUserId: string }) {
  const load = useServerFn(adminListUsers);
  const createUser = useServerFn(adminCreateUser);
  const deleteUser = useServerFn(adminDeleteUser);
  const updateRole = useServerFn(adminUpdateUserRole);

  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [roleBusy, setRoleBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setError("");
    try {
      const result = await load();
      setUsers(result.users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A felhasználók betöltése nem sikerült.");
      setUsers([]);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("new-email") ?? "");
    const password = String(data.get("new-password") ?? "");
    const role = String(data.get("new-role") ?? "user") === "admin" ? "admin" : "user";
    setCreating(true);
    setMessage("");
    setError("");
    try {
      const result = await createUser({ data: { email, password, role } });
      if (result.ok) {
        setMessage(`${email}: felhasználó létrehozva (${role === "admin" ? "admin" : "felhasználó"}).`);
        form.reset();
        await refresh();
      } else {
        setError(result.error ?? "Hiba történt.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setCreating(false);
  }

  async function onDelete(user: AdminUserRow) {
    if (!window.confirm(`Biztosan törlöd ezt a felhasználót? ${user.email}`)) return;
    setBusy(user.id);
    setMessage("");
    setError("");
    try {
      const result = await deleteUser({ data: { userId: user.id } });
      if (result.ok) {
        setMessage(`${user.email}: törölve.`);
        await refresh();
      } else {
        setError(result.error ?? "Hiba történt.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(null);
  }

  async function onChangeRole(user: AdminUserRow, role: "admin" | "user") {
    const label = role === "admin" ? "Admin" : "Felhasználó";
    if (!window.confirm(`Biztosan megváltoztatod a szerepkörét? ${user.email} → ${label}`)) return;
    setRoleBusy(user.id);
    setMessage("");
    setError("");
    try {
      const result = await updateRole({ data: { userId: user.id, role } });
      if (result.ok) {
        setMessage(`${user.email}: szerepkör módosítva (${label}). A változás a következő belépésnél lép életbe.`);
        await refresh();
      } else {
        setError(result.error ?? "Hiba történt.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setRoleBusy(null);
  }

  return (
    <section className="mt-8">
      <p className="text-sm text-muted-foreground">
        Admin felhasználók kezelése: új létrehozása, szerepkör módosítása vagy meglévő törlése.
      </p>
      <div className="mt-4 rounded-xl border border-border bg-muted/50 px-5 py-4 text-sm text-foreground">
        <p>
          <strong>Admin:</strong> teljes hozzáférés az admin felülethez –
          megrendelések jóváhagyása, statisztikák és exportok, fizetés-teszt,
          felhasználók kezelése.
        </p>
        <p className="mt-2">
          <strong>Felhasználó:</strong> be tud jelentkezni, de az admin
          felületen kizárólag a Statisztika oldalt éri el – a megrendeléseket,
          a fizetés-tesztet és a felhasználókezelést nem.
        </p>
      </div>

      {message ? (
        <p className="mt-4 rounded-md border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={onCreate}
        className="mt-6 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Új felhasználó
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium text-foreground">
            E-mail
            <input name="new-email" type="email" required className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Jelszó (min. 8 karakter)
            <input name="new-password" type="password" required minLength={8} className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Szerepkör
            <select name="new-role" className={inputClass} defaultValue="admin">
              <option value="admin">Admin</option>
              <option value="user">Felhasználó</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-5 inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-dark disabled:opacity-60"
        >
          {creating ? "Létrehozás…" : "Felhasználó létrehozása"}
        </button>
      </form>

      {users === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Betöltés…</p>
      ) : users.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Nincs felhasználó.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {users.map((user) => (
            <article
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-foreground"
            >
              <div>
                <p className="font-semibold">
                  {user.email}
                  {user.id === currentUserId ? (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      ez te vagy
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {user.roles.length > 0 ?
                    user.roles.map((r) => (r === "admin" ? "Admin" : "Felhasználó")).join(", ")
                  : "Nincs szerepkör"}{" "}
                  · Létrehozva: {new Date(user.createdAt).toLocaleDateString("hu-HU")}
                  {user.lastSignInAt ?
                    ` · Utolsó belépés: ${new Date(user.lastSignInAt).toLocaleString("hu-HU")}`
                  : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label={`Szerepkör: ${user.email}`}
                  value={user.roles[0] ?? "user"}
                  disabled={roleBusy === user.id || user.id === currentUserId}
                  onChange={(e) => {
                    const role = e.target.value === "admin" ? "admin" : "user";
                    if (role !== (user.roles[0] ?? "user")) void onChangeRole(user, role);
                  }}
                  className="rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-ring disabled:opacity-40"
                >
                  <option value="admin">Admin</option>
                  <option value="user">Felhasználó</option>
                </select>
                <button
                  type="button"
                  disabled={busy === user.id || user.id === currentUserId}
                  onClick={() => void onDelete(user)}
                  className="rounded-md border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-40"
                >
                  {busy === user.id ? "Törlés…" : "Törlés"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Billingo invoice logs
// ---------------------------------------------------------------------------

export type InvoiceLog = Awaited<ReturnType<typeof adminListInvoiceLogs>>["logs"][number];

const SOURCE_LABELS: Record<string, string> = {
  webhook: "Stripe webhook",
  admin_approval: "Átutalás jóváhagyás",
  admin_retry: "Kézi újrapróbálás",
};

export function InvoiceLogsPanel() {
  const load = useServerFn(adminListInvoiceLogs);
  const retry = useServerFn(adminRetryInvoice);

  const [logs, setLogs] = useState<InvoiceLog[] | null>(null);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "error">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [retryBusy, setRetryBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setError("");
    try {
      const result = await load();
      setLogs(result.logs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "A napló betöltése nem sikerült.");
      setLogs([]);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Starts a new invoicing attempt for the order behind a failed log row. */
  async function onRetryLog(log: InvoiceLog) {
    if (!log.orderId) return;
    setRetryBusy(log.id);
    setMessage("");
    try {
      const result = await retry({ data: { orderId: log.orderId } });
      setMessage(
        result.ok
          ? `${log.orderNumber}: Billingo számla kiállítva${
              result.invoiceNumber ? ` (${result.invoiceNumber})` : ""
            }.`
          : `${log.orderNumber}: ${result.error ?? "Hiba történt."}`,
      );
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Hiba történt.");
    }
    setRetryBusy(null);
  }

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs ?? []) set.add(log.source);
    return [...set];
  }, [logs]);

  const filteredLogs = useMemo(
    () =>
      (logs ?? []).filter((log) => {
        if (statusFilter !== "all" && log.status !== statusFilter) return false;
        if (sourceFilter !== "all" && log.source !== sourceFilter) return false;
        return true;
      }),
    [logs, statusFilter, sourceFilter],
  );

  const errorCount = (logs ?? []).filter((log) => log.status === "error").length;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          {logs ? `${logs.length} naplóbejegyzés` : "Betöltés…"}
          {logs && errorCount > 0 ? (
            <>
              {" · "}
              <strong className="text-destructive">{errorCount} hibás</strong>
            </>
          ) : null}
        </span>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-md border border-input px-3 py-1.5 font-medium text-foreground hover:bg-accent"
        >
          Frissítés
        </button>
      </div>

      {error ? (
        <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-6 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground">
          {message}
        </p>
      ) : null}

      {logs !== null && logs.length > 0 ? (
        <div className="mt-6 space-y-4 rounded-xl border border-border bg-card px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Állapot
            </span>
            {(
              [
                { id: "all", label: "Összes" },
                { id: "success", label: "Sikeres" },
                { id: "error", label: "Hibás" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={filterChip(statusFilter === opt.id)}
                onClick={() => setStatusFilter(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Forrás
            </span>
            <button
              type="button"
              className={filterChip(sourceFilter === "all")}
              onClick={() => setSourceFilter("all")}
            >
              Összes
            </button>
            {sources.map((source) => (
              <button
                key={source}
                type="button"
                className={filterChip(sourceFilter === source)}
                onClick={() => setSourceFilter(source)}
              >
                {SOURCE_LABELS[source] ?? source}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredLogs.length} / {logs.length} bejegyzés látszik
          </p>
        </div>
      ) : null}

      {logs === null ? (
        <p className="mt-8 text-sm text-muted-foreground">Betöltés…</p>
      ) : logs.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Még nincs naplóbejegyzés. A napló a következő számlázási
          próbálkozástól indul.
        </p>
      ) : filteredLogs.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          A kiválasztott szűréshez nem tartozik bejegyzés.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[880px] text-left text-sm text-foreground">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Időpont</th>
                <th className="px-4 py-3">Rendelés</th>
                <th className="px-4 py-3">Forrás</th>
                <th className="px-4 py-3">Állapot</th>
                <th className="px-4 py-3">Számlaszám</th>
                <th className="px-4 py-3">Hibakód</th>
                <th className="px-4 py-3">Hibaüzenet</th>
                <th className="px-4 py-3">Művelet</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border/60 align-top last:border-b-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("hu-HU")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-medium">
                    {log.orderNumber || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {SOURCE_LABELS[log.source] ?? log.source}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        log.status === "success"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {log.status === "success" ? "Sikeres" : "Hibás"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {log.invoiceNumber ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {log.errorCode ?? "—"}
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-xs text-muted-foreground">
                    {log.errorMessage ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {log.status === "error" && log.orderId ? (
                      <button
                        type="button"
                        disabled={retryBusy === log.id}
                        onClick={() => void onRetryLog(log)}
                        className="rounded-md border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-40"
                      >
                        {retryBusy === log.id ? "Újrapróbálás…" : "Újrapróbálás"}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// "Friss verzió feltöltés" — termékfájl csere + kalkulátor frissítés
// ---------------------------------------------------------------------------

type ProductFileMeta = Awaited<ReturnType<typeof adminListProductFiles>>["files"][number];
type CalculatorOverrideRow = Awaited<
  ReturnType<typeof adminListCalculatorOverrides>
>["overrides"][number];

const PRODUCT_FILES_BUCKET = "termekfajlok";
const MAX_CALCULATOR_HTML_BYTES = 5 * 1024 * 1024;

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Feltöltés aláírt URL-re XMLHttpRequesttel — a Supabase kliens fetch-et
 * használ, ami nem jelzi a haladást; az XHR upload eseményei igen.
 */
function uploadWithProgress(
  path: string,
  token: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const baseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
    const url =
      `${baseUrl}/storage/v1/object/upload/sign/${PRODUCT_FILES_BUCKET}/${path}` +
      `?token=${encodeURIComponent(token)}`;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.setRequestHeader(
      "apikey",
      import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string,
    );
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      let detail = "";
      try {
        const parsed = JSON.parse(xhr.responseText) as {
          message?: string;
          error?: string;
        };
        detail = parsed.message ?? parsed.error ?? "";
      } catch {
        detail = (xhr.responseText ?? "").slice(0, 200);
      }
      reject(
        new Error(
          `A tárhely elutasította a feltöltést (HTTP ${xhr.status}).` +
            (detail ? ` Részlet: ${detail}` : " Próbáld újra."),
        ),
      );
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "Hálózati hiba történt a feltöltés közben — ellenőrizd az internetkapcsolatot, majd próbáld újra.",
        ),
      );
    xhr.ontimeout = () =>
      reject(
        new Error(
          "A feltöltés időtúllépés miatt megszakadt — próbáld újra, vagy válassz kisebb fájlt.",
        ),
      );
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    xhr.send(body);
  });
}

/** Feltöltés-haladásjelző sáv százalékkal. */
function UploadProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{percent}%</span>
      </div>
      <div
        className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/** Feltöltési hiba doboza: cím + részletes magyarázat a progress bár alatt. */
function UploadErrorBox({ detail }: { detail: string }) {
  return (
    <div
      className="max-w-2xl rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      <p className="font-semibold">A feltöltés nem sikerült</p>
      <p className="mt-1">{detail}</p>
    </div>
  );
}

const selectClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";
const fileInputClass =
  "block w-full max-w-md text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:opacity-90";

/** Termék új verziója: legördülőből választott termék fájljának felülírása. */
export function ProductVersionPanel() {
  const loadFiles = useServerFn(adminListProductFiles);
  const createUploadUrl = useServerFn(adminCreateProductUploadUrl);

  const downloadable = useMemo(
    () => products.filter((p) => p.status === "available" && p.download),
    [],
  );
  const [slug, setSlug] = useState(downloadable[0]?.slug ?? "");
  const [files, setFiles] = useState<Record<string, ProductFileMeta> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const result = await loadFiles();
      const map: Record<string, ProductFileMeta> = {};
      for (const item of result.files) map[item.slug] = item;
      setFiles(map);
    } catch {
      setFiles({});
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = downloadable.find((p) => p.slug === slug);
  const meta = files?.[slug] ?? null;

  /** Uploads the chosen file straight to storage over the existing object. */
  async function onUpload() {
    if (!selected || !file || busy) return;
    setError("");
    setMessage("");
    if (file.size > 300 * 1024 * 1024) {
      setError(
        `A fájl túl nagy: ${formatFileSize(file.size)}. A megengedett maximum 300 MB.`,
      );
      return;
    }
    const allowedExt = [".xlsm", ".exe", ".zip", ".pdf"];
    const lowerName = file.name.toLowerCase();
    const matched = allowedExt.find((ext) => lowerName.endsWith(ext));
    if (!matched) {
      setError(
        `A fájl típusa nem megfelelő: ${file.name}. ` +
          `Elfogadott formátumok: .xlsm, .exe, .zip, .pdf.`,
      );
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const ticket = await createUploadUrl({
        data: { slug: selected.slug, fileName: file.name, fileSize: file.size },
      });
      if (!ticket.ok) throw new Error(ticket.error);
      await uploadWithProgress(ticket.path, ticket.token, file, setProgress);
      setMessage(
        `${selected.name}: új verzió feltöltve (${file.name}, ${formatFileSize(file.size)}). ` +
          "A korábbi vásárlók letöltő linkjei mostantól az új verziót szolgálják ki.",
      );
      setFile(null);
      setInputKey((k) => k + 1);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setProgress(null);
    setBusy(false);
  }

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">Termék új verziója</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A kiválasztott termék határozza meg, melyik fájl cserélődik — a feltöltött
        fájl neve nem számít. A régi fájl felülíródik, a meglévő letöltő linkek
        érvényesek maradnak.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <label className="text-sm font-medium text-foreground">
          Termék
          <select
            className={`${selectClass} mt-1.5 w-full max-w-md`}
            value={slug}
            disabled={busy}
            onChange={(e) => {
              setSlug(e.target.value);
              setMessage("");
              setError("");
            }}
          >
            {downloadable.map((p) => {
              const m = files?.[p.slug];
              return (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                  {m ? ` — ${m.fileName}` : ""}
                </option>
              );
            })}
          </select>
        </label>

        {selected ? (
          <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">
              Jelenlegi fájl: <span className="font-mono">{meta?.fileName ?? "…"}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Méret: {formatFileSize(meta?.size ?? null)}
              {meta?.updatedAt
                ? ` · Utoljára módosítva: ${new Date(meta.updatedAt).toLocaleString("hu-HU")}`
                : ""}
            </p>
          </div>
        ) : null}

        <label className="text-sm font-medium text-foreground">
          Új verzió fájlja (.xlsm, .exe, .zip, .pdf, legfeljebb 300 MB)
          <input
            key={inputKey}
            type="file"
            accept=".xlsm,.exe,.zip,.pdf"
            disabled={busy}
            className={`${fileInputClass} mt-1.5 disabled:opacity-50`}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div>
          <button
            type="button"
            disabled={!file || busy || !selected}
            onClick={() => void onUpload()}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Feltöltés…" : "Új verzió feltöltése"}
          </button>
        </div>

        {progress !== null ? (
          <UploadProgressBar
            percent={progress}
            label={
              progress < 100
                ? `Feltöltés folyamatban — ${file?.name ?? ""} (${formatFileSize(file?.size ?? null)})`
                : "Feltöltés kész, feldolgozás…"
            }
          />
        ) : null}

        {error ? <UploadErrorBox detail={error} /> : null}
        {message ? (
          <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/** Kalkulátor frissítése: feltöltött HTML felülírja a kiválasztott kalkulátort. */
export function CalculatorVersionPanel() {
  const loadOverrides = useServerFn(adminListCalculatorOverrides);
  const upload = useServerFn(adminUploadCalculatorVersion);
  const remove = useServerFn(adminDeleteCalculatorOverride);

  const [calcKey, setCalcKey] = useState<string>(CALCULATORS[0].key);
  const [overrides, setOverrides] = useState<CalculatorOverrideRow[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [restoreBusy, setRestoreBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const result = await loadOverrides();
      setOverrides(result.overrides);
    } catch {
      setOverrides([]);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overrideKeys = useMemo(
    () => new Set((overrides ?? []).map((o) => o.key)),
    [overrides],
  );

  /** Reads the chosen HTML file and stores it as the calculator's override. */
  async function onUpload() {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (file.size > MAX_CALCULATOR_HTML_BYTES) {
        throw new Error(
          `A fájl túl nagy: ${formatFileSize(file.size)}. A megengedett maximum 5 MB.`,
        );
      }
      if (!file.name.toLowerCase().endsWith(".html")) {
        throw new Error(
          `A fájl típusa nem megfelelő: .html fájlt vártunk, de a kiválasztott fájl: ${file.name}.`,
        );
      }
      const content = await file.text();
      const result = await upload({
        data: { key: calcKey, fileName: file.name, content },
      });
      if (!result.ok) throw new Error(result.error);
      setMessage(
        `${calculatorLabel(calcKey)}: frissítve a feltöltött fájllal (${file.name}). ` +
          "A nyilvános oldal mostantól ezt a verziót mutatja.",
      );
      setFile(null);
      setInputKey((k) => k + 1);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  }

  /** Deletes the override, restoring the bundled calculator version. */
  async function onRestore(key: string) {
    if (restoreBusy) return;
    setRestoreBusy(key);
    setMessage("");
    setError("");
    try {
      await remove({ data: { key } });
      setMessage(`${calculatorLabel(key)}: az eredeti, beépített verzió állt vissza.`);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setRestoreBusy(null);
  }

  return (
    <section className="mt-10 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">Kalkulátor frissítése</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A kiválasztott kalkulátor határozza meg a célt — a feltöltött fájl neve nem
        számít. A feltöltött HTML váltja le a kalkulátor nyilvános oldalát; az
        eredeti verzió bármikor visszaállítható.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <label className="text-sm font-medium text-foreground">
          Kalkulátor
          <select
            className={`${selectClass} mt-1.5 w-full max-w-md`}
            value={calcKey}
            disabled={busy}
            onChange={(e) => {
              setCalcKey(e.target.value);
              setMessage("");
              setError("");
            }}
          >
            {CALCULATORS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
                {overrideKeys.has(c.key) ? " — feltöltött verzió" : " — eredeti verzió"}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-foreground">
          Új verzió (.html, legfeljebb 5 MB)
          <input
            key={inputKey}
            type="file"
            accept=".html,text/html"
            disabled={busy}
            className={`${fileInputClass} mt-1.5 disabled:opacity-50`}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div>
          <button
            type="button"
            disabled={!file || busy}
            onClick={() => void onUpload()}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Feltöltés…" : "Kalkulátor frissítése"}
          </button>
        </div>

        {busy ? (
          <div className="max-w-md">
            <p className="text-sm font-medium text-foreground">
              Feltöltés folyamatban — {file?.name ?? ""} (
              {formatFileSize(file?.size ?? null)})
            </p>
            <div
              className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Feltöltés folyamatban"
            >
              <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        ) : null}

        {error ? <UploadErrorBox detail={error} /> : null}
        {message ? (
          <p className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
            {message}
          </p>
        ) : null}

        {overrides && overrides.length > 0 ? (
          <div className="mt-2 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] text-left text-sm text-foreground">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Kalkulátor</th>
                  <th className="px-4 py-3">Feltöltött fájl</th>
                  <th className="px-4 py-3">Frissítve</th>
                  <th className="px-4 py-3">Művelet</th>
                </tr>
              </thead>
              <tbody>
                {overrides.map((row) => (
                  <tr key={row.key} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-3 font-medium">{calculatorLabel(row.key)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.fileName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(row.updatedAt).toLocaleString("hu-HU")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={restoreBusy !== null || busy}
                        onClick={() => void onRestore(row.key)}
                        className="rounded-md border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-40"
                      >
                        {restoreBusy === row.key ? "Visszaállítás…" : "Eredeti visszaállítása"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {overrides === null
              ? "Betöltés…"
              : "Jelenleg minden kalkulátor az eredeti, beépített verzióval fut."}
          </p>
        )}
      </div>
    </section>
  );
}

/** Termékek sorrendje és kategóriája — kézi rendezés kategóriánként. */
export function ProductOrderPanel() {
  const loadPlacements = useServerFn(adminListProductPlacements);
  const savePlacements = useServerFn(adminSaveProductPlacements);
  const resetPlacements = useServerFn(adminResetProductPlacements);

  const [groups, setGroups] = useState<Record<string, string[]> | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const result = await loadPlacements();
      const effective = applyPlacements(result.placements);
      const next: Record<string, string[]> = {};
      for (const category of effective) next[category.key] = [...category.slugs];
      setGroups(next);
    } catch {
      const next: Record<string, string[]> = {};
      for (const category of productCategories) next[category.key] = [...category.slugs];
      setGroups(next);
    }
    setDirty(false);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function productName(slug: string) {
    return products.find((p) => p.slug === slug)?.name ?? slug;
  }

  /** Moves a product one step up or down inside its own category. */
  function move(categoryKey: string, index: number, delta: number) {
    setGroups((prev) => {
      if (!prev) return prev;
      const list = [...(prev[categoryKey] ?? [])];
      const target = index + delta;
      if (target < 0 || target >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(target, 0, item!);
      setDirty(true);
      setMessage("");
      return { ...prev, [categoryKey]: list };
    });
  }

  /** Moves a product to the end of another category. */
  function changeCategory(slug: string, from: string, to: string) {
    if (from === to) return;
    setGroups((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      next[from] = (prev[from] ?? []).filter((s) => s !== slug);
      next[to] = [...(prev[to] ?? []), slug];
      setDirty(true);
      setMessage("");
      return next;
    });
  }

  async function onSave() {
    if (!groups || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const items = productCategories.flatMap((category) =>
        (groups[category.key] ?? []).map((slug, index) => ({
          slug,
          category: category.key,
          sortOrder: index,
        })),
      );
      const result = await savePlacements({ data: { items } });
      if (!result.ok) throw new Error(result.error);
      setMessage("A sorrend és a kategóriák elmentve. A Termékeim oldal már ezt mutatja.");
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  }

  async function onReset() {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await resetPlacements();
      await refresh();
      setMessage("Visszaállt az eredeti kategória-beosztás és sorrend.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
    }
    setBusy(false);
  }

  return (
    <section className="mt-12 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-foreground">Termékek sorrendje és kategóriája</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        A nyilakkal rendezhetsz a kategórián belül, a legördülővel pedig áthelyezheted a
        terméket másik kategóriába (a lista végére kerül). A módosítás mentés után látszik a
        Termékeim oldalon.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy || !dirty}
          onClick={() => void onSave()}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {busy ? "Mentés…" : "Sorrend mentése"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onReset()}
          className="rounded-md border border-input px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-40"
        >
          Eredeti sorrend visszaállítása
        </button>
        {dirty ? (
          <span className="text-xs font-semibold text-muted-foreground">Nem mentett módosítás</span>
        ) : null}
      </div>

      {message ? <p className="mt-4 text-sm font-semibold text-primary">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-semibold text-destructive">{error}</p> : null}

      {groups === null ? (
        <p className="mt-6 text-xs text-muted-foreground">Betöltés…</p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {productCategories.map((category) => {
            const list = groups[category.key] ?? [];
            return (
              <div key={category.key} className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-bold text-foreground">
                  {category.title}{" "}
                  <span className="font-normal text-muted-foreground">({list.length})</span>
                </h3>
                {list.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">Nincs ide sorolt termék.</p>
                ) : (
                  <ol className="mt-3 space-y-2">
                    {list.map((slug, index) => (
                      <li
                        key={slug}
                        className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background px-2 py-1.5"
                      >
                        <span className="w-5 text-xs text-muted-foreground">{index + 1}.</span>
                        <span className="flex-1 text-xs font-semibold text-foreground">
                          {productName(slug)}
                        </span>
                        <button
                          type="button"
                          aria-label="Feljebb"
                          disabled={index === 0 || busy}
                          onClick={() => move(category.key, index, -1)}
                          className="rounded border border-input px-2 py-0.5 text-xs disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label="Lejjebb"
                          disabled={index === list.length - 1 || busy}
                          onClick={() => move(category.key, index, 1)}
                          className="rounded border border-input px-2 py-0.5 text-xs disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <select
                          aria-label="Kategória"
                          value={category.key}
                          disabled={busy}
                          onChange={(e) => changeCategory(slug, category.key, e.target.value)}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                        >
                          {productCategories.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
