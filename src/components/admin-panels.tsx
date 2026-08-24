import { useServerFn } from "@tanstack/react-start";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  adminApproveTransfer,
  adminCreateUser,
  adminDeleteUser,
  adminListOrders,
  adminListUsers,
  adminResendDownload,
} from "@/lib/admin.functions";
import { formatPrice } from "@/lib/products";
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

export type AdminSession = { email: string | null; userId: string };

export const AdminSessionContext = createContext<AdminSession>({ email: null, userId: "" });

export function useAdminSession(): AdminSession {
  return useContext(AdminSessionContext);
}

export const inputClass =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

export function LoginPanel() {
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

export function OrdersPanel({ email }: { email: string | null }) {
  const load = useServerFn(adminListOrders);
  const approve = useServerFn(adminApproveTransfer);
  const resend = useServerFn(adminResendDownload);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [payFilter, setPayFilter] = useState<"all" | "paid" | "unpaid">("all");
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
        const date = new Date(order.createdAt);
        if (activeYear !== null && date.getFullYear() !== activeYear) return false;
        if (activeMonth !== "all" && date.getMonth() !== activeMonth) return false;
        return true;
      }),
    [orders, payFilter, activeYear, activeMonth],
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

export function UsersPanel({ currentUserId }: { currentUserId: string }) {
  const load = useServerFn(adminListUsers);
  const createUser = useServerFn(adminCreateUser);
  const deleteUser = useServerFn(adminDeleteUser);

  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
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

  return (
    <section className="mt-8">
      <p className="text-sm text-muted-foreground">
        Admin felhasználók kezelése: új létrehozása vagy meglévő törlése.
      </p>

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
              <button
                type="button"
                disabled={busy === user.id || user.id === currentUserId}
                onClick={() => void onDelete(user)}
                className="rounded-md border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-40"
              >
                {busy === user.id ? "Törlés…" : "Törlés"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
