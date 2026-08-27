import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, RefreshCw, TicketPercent } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  adminCreateCoupon,
  adminDisableCoupon,
  adminListCoupons,
} from "@/lib/admin.functions";
import { productCategories } from "@/lib/product-categories";
import { products } from "@/lib/products";
import { getStripeEnvironment } from "@/lib/stripe";

type Env = "sandbox" | "live";
type Coupon = Awaited<ReturnType<typeof adminListCoupons>>["coupons"][number];

const STATUS_LABEL: Record<string, string> = {
  valid: "Érvényes",
  expired: "Lejárt",
  disabled: "Kikapcsolva",
  used_up: "Elfogyott",
};

const STATUS_CLASS: Record<string, string> = {
  valid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  expired: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  disabled: "bg-muted text-muted-foreground",
  used_up: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function huf(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value).toLocaleString("hu-HU")} Ft`;
}

function dateHu(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("hu-HU", { timeZone: "Europe/Budapest" });
}

function discountLabel(c: Coupon): string {
  if (c.discountType === "percent" && c.percentOff) return `${c.percentOff}%`;
  if (c.discountType === "amount" && c.amountOff != null) return huf(c.amountOff);
  return "—";
}

/** Admin coupon management: list, filter, create, and disable coupons. */
export function CouponAdminPanel() {
  const [env, setEnv] = useState<Env>(() => getStripeEnvironment());
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "invalid">("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const listFn = useServerFn(adminListCoupons);
  const createFn = useServerFn(adminCreateCoupon);
  const disableFn = useServerFn(adminDisableCoupon);

  const refresh = useCallback(
    async (environment: Env) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listFn({ data: { environment } });
        setCoupons(result.coupons ?? []);
      } catch {
        setError("A kuponok betöltése sikertelen.");
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    },
    [listFn],
  );

  useEffect(() => {
    void refresh(env);
  }, [env, refresh]);

  const visible = useMemo(() => {
    const needle = search.trim().toUpperCase();
    return coupons.filter((c) => {
      if (needle && !c.code.toUpperCase().includes(needle)) return false;
      if (statusFilter === "valid" && c.status !== "valid") return false;
      if (statusFilter === "invalid" && c.status === "valid") return false;
      return true;
    });
  }, [coupons, search, statusFilter]);

  function exportCsv() {
    const header = [
      "Kuponkód",
      "Környezet",
      "Kedvezmény",
      "Állapot",
      "Lejárat",
      "Beváltások",
      "Limit",
      "Minimum",
      "Termékek",
      "Létrehozva",
      "Létrehozó",
    ];
    const lines = visible.map((c) =>
      [
        c.code,
        c.environment === "live" ? "Éles" : "Teszt",
        discountLabel(c),
        STATUS_LABEL[c.status] ?? c.status,
        c.expiresAt ? dateHu(c.expiresAt) : "Korlátlan",
        c.timesRedeemed,
        c.maxRedemptions ?? "Korlátlan",
        c.minAmount ? huf(c.minAmount) : "Nincs",
        c.allProducts ? "Minden termék" : c.productNames.join(", "),
        c.createdAt ? dateHu(c.createdAt) : "—",
        c.createdBy ?? "—",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";"),
    );
    const blob = new Blob([`\uFEFF${[header.join(";"), ...lines].join("\r\n")}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kuponok-${env}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDisable(code: string) {
    if (!confirm(`Biztosan kikapcsolod a(z) ${code} kupont?`)) return;
    const res = await disableFn({ data: { code, environment: env } });
    if (!res.ok) {
      alert(res.error ?? "A kikapcsolás sikertelen.");
      return;
    }
    void refresh(env);
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <TicketPercent className="h-5 w-5 text-primary" aria-hidden="true" />
            Kuponok
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Itt láthatod az összes eddigi kupont, szűrhetsz környezet és állapot szerint, és új
            kupont is létrehozhatsz — amit a Stripe is elfogad.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {showForm ? "Mégse" : "Új kupon"}
        </button>
      </div>

      {showForm ? (
        <CouponCreateForm
          env={env}
          onCreated={() => {
            setShowForm(false);
            void refresh(env);
          }}
          createFn={createFn}
        />
      ) : null}

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Környezet</span>
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value as Env)}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="live">Éles</option>
            <option value="sandbox">Teszt</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Állapot</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "valid" | "invalid")}
            className="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="all">Mind</option>
            <option value="valid">Érvényes</option>
            <option value="invalid">Érvénytelen</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Keresés</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kuponkód"
            className="mt-1 min-w-[14rem] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <button
          type="button"
          onClick={() => void refresh(env)}
          className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          Frissítés
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          CSV export
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[70rem] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Kód</th>
              <th className="px-3 py-2">Kedvezmény</th>
              <th className="px-3 py-2">Állapot</th>
              <th className="px-3 py-2">Lejárat</th>
              <th className="px-3 py-2">Beváltások</th>
              <th className="px-3 py-2">Minimum</th>
              <th className="px-3 py-2">Termékek</th>
              <th className="px-3 py-2">Létrehozva</th>
              <th className="px-3 py-2 text-right">Művelet</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">
                  Ebben a környezetben még nincs kupon.
                </td>
              </tr>
            ) : null}
            {visible.map((c) => (
              <tr key={`${c.environment}-${c.code}`} className="border-t border-border align-top">
                <td className="px-3 py-2 font-semibold text-foreground">{c.code}</td>
                <td className="whitespace-nowrap px-3 py-2 text-primary">
                  {discountLabel(c)}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[c.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                  {c.disabledAt ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      kikapcsolva: {dateHu(c.disabledAt)}
                    </span>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {c.expiresAt ? dateHu(c.expiresAt) : "Korlátlan"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {c.timesRedeemed}
                  {c.maxRedemptions ? ` / ${c.maxRedemptions}` : " / ∞"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {c.minAmount ? huf(c.minAmount) : "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {c.allProducts ? "Minden termék" : c.productNames.join(", ") || "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {c.createdAt ? dateHu(c.createdAt) : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {c.status === "valid" || c.status === "used_up" ? (
                    <button
                      type="button"
                      onClick={() => void handleDisable(c.code)}
                      className="rounded-md border border-destructive/40 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      Kikapcsolás
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Create coupon form
// ---------------------------------------------------------------------------

type CreateFn = ReturnType<typeof useServerFn<typeof adminCreateCoupon>>;

function CouponCreateForm({
  env,
  onCreated,
  createFn,
}: {
  env: Env;
  onCreated: () => void;
  createFn: CreateFn;
}) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [percentOff, setPercentOff] = useState("10");
  const [amountOff, setAmountOff] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [allProducts, setAllProducts] = useState(true);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [unlimited, setUnlimited] = useState(true);
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [noMin, setNoMin] = useState(true);
  const [minAmount, setMinAmount] = useState("");
  const [formEnv, setFormEnv] = useState<Env>(env);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group products by category for the checklist.
  const grouped = useMemo(
    () =>
      productCategories.map((cat) => ({
        title: cat.title,
        items: cat.slugs
          .map((slug) => products.find((p) => p.slug === slug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p)),
      })),
    [],
  );

  function toggleSlug(slug: string) {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        environment: formEnv,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        discountType,
        percentOff: discountType === "percent" ? Number(percentOff) || null : null,
        amountOff: discountType === "amount" ? Math.round((Number(amountOff) || 0) * 100) : null,
        currency: "huf",
        productSlugs: allProducts ? [] : selectedSlugs,
        allProducts,
        maxRedemptions: unlimited ? null : Math.round(Number(maxRedemptions) || 0),
        minAmount: noMin ? null : Math.round((Number(minAmount) || 0) * 100),
      };
      const res = await createFn({ data: payload });
      if (!res.ok) {
        setError(res.error ?? "A kupon létrehozása sikertelen.");
        return;
      }
      onCreated();
    } catch (err: any) {
      setError(err?.message ?? "Váratlan hiba.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-lg border border-border bg-card p-5"
      aria-label="Új kupon létrehozása"
    >
      <h3 className="text-lg font-semibold text-foreground">Új kupon létrehozása</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Kuponkód *</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="pl. NYAR2026"
            required
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm uppercase text-foreground"
          />
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Környezet *</span>
          <select
            value={formEnv}
            onChange={(e) => setFormEnv(e.target.value as Env)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="sandbox">Teszt</option>
            <option value="live">Éles</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Érvényesség vége</span>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Üres = korlátlan (csak lejáratkor kapcsol ki).
          </span>
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm">
          <span className="block text-xs font-medium text-muted-foreground">Kedvezmény típusa *</span>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percent" | "amount")}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="percent">Százalék (%)</option>
            <option value="amount">Fix összeg (Ft)</option>
          </select>
        </label>
        {discountType === "percent" ? (
          <label className="text-sm">
            <span className="block text-xs font-medium text-muted-foreground">Kedvezmény (%) *</span>
            <input
              type="number"
              min={1}
              max={100}
              value={percentOff}
              onChange={(e) => setPercentOff(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        ) : (
          <label className="text-sm">
            <span className="block text-xs font-medium text-muted-foreground">Kedvezmény (Ft) *</span>
            <input
              type="number"
              min={1}
              value={amountOff}
              onChange={(e) => setAmountOff(e.target.value)}
              required
              placeholder="pl. 5000"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        )}
        <div />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <fieldset className="text-sm">
          <legend className="text-xs font-medium text-muted-foreground">Beváltási limit</legend>
          <label className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={unlimited}
              onChange={(e) => setUnlimited(e.target.checked)}
            />
            Korlátlan (a lejálatig)
          </label>
          {!unlimited ? (
            <label className="mt-1 block">
              <span className="block text-xs text-muted-foreground">Maximum beváltások</span>
              <input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          ) : null}
        </fieldset>
        <fieldset className="text-sm">
          <legend className="text-xs font-medium text-muted-foreground">Minimum rendelési összeg</legend>
          <label className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              checked={noMin}
              onChange={(e) => setNoMin(e.target.checked)}
            />
            Nincs minimum
          </label>
          {!noMin ? (
            <label className="mt-1 block">
              <span className="block text-xs text-muted-foreground">Minimum (Ft)</span>
              <input
                type="number"
                min={1}
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          ) : null}
        </fieldset>
      </div>

      <fieldset className="mt-4 text-sm">
        <legend className="text-xs font-medium text-muted-foreground">Termékek</legend>
        <label className="mt-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={allProducts}
            onChange={(e) => setAllProducts(e.target.checked)}
          />
          Minden termékre (alapértelmezett)
        </label>
        {!allProducts ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((cat) => (
              <div key={cat.title} className="rounded-md border border-border p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cat.title}
                </p>
                <div className="space-y-1">
                  {cat.items.map((p) => (
                    <label key={p.slug} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedSlugs.includes(p.slug)}
                        onChange={() => toggleSlug(p.slug)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </fieldset>

      {error ? (
        <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          Kupon létrehozása
        </button>
      </div>
    </form>
  );
}
