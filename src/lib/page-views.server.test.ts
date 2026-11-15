import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, getProduct } = vi.hoisted(() => ({
  rpc: vi.fn().mockResolvedValue({ error: null }),
  getProduct: vi.fn((slug: string) => ["rlb-bank-konverter", "admin-product"].includes(slug) ? { slug } : undefined),
}));
vi.mock("./products", () => ({ getProduct }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { rpc } }));

import { recordServedPageView, servedPageTarget } from "./page-views.server";

function request(path: string, options: { host?: string; method?: string; headers?: Record<string, string> } = {}) {
  return new Request(`https://${options.host ?? "xlntbi.hu"}${path}`, {
    method: options.method ?? "GET",
    headers: { accept: "text/html", "sec-fetch-dest": "document", "user-agent": "Mozilla/5.0", ...options.headers },
  });
}
const html = () => new Response("<h1>Page</h1>", { headers: { "content-type": "text/html; charset=utf-8" } });

describe("server-owned page-view recording", () => {
  beforeEach(() => rpc.mockClear());

  it.each(["/termek/rlb-bank-konverter", "/en/product/rlb-bank-konverter", "/termek/admin-product"])("counts a served catalog page: %s", async (path) => {
    await recordServedPageView(request(path), html());
    expect(rpc).toHaveBeenCalledOnce();
    expect(rpc).toHaveBeenCalledWith("increment_page_view", expect.objectContaining({
      _page_type: "product", _page_key: path.split("/").pop(),
      _year: new Date().getUTCFullYear(), _month: new Date().getUTCMonth() + 1,
    }));
  });

  it.each(["/ev-konyveles", "/en/sole-trader-bookkeeping", "/en/tax-advisory"])("preserves service language keys: %s", async (path) => {
    await recordServedPageView(request(path), html());
    expect(rpc).toHaveBeenCalledWith("increment_page_view", expect.objectContaining({ _page_type: "service", _page_key: path }));
  });

  it.each(["/termek/arbitrary", "/en/product/arbitrary", "/arbitrary", "/admin/statisztika", "/api/public/test", "/_serverFn/test", "/termek/rlb-bank-konverter/extra"])("rejects arbitrary counter targets: %s", async (path) => {
    expect(servedPageTarget(path)).toBeNull();
    await recordServedPageView(request(path), html());
    expect(rpc).not.toHaveBeenCalled();
  });

  it("ignores injected query keys", async () => {
    await recordServedPageView(request("/ev-konyveles?pageType=product&pageKey=arbitrary&_year=2000"), html());
    expect(rpc).toHaveBeenCalledWith("increment_page_view", expect.objectContaining({ _page_type: "service", _page_key: "/ev-konyveles" }));
  });

  it.each([
    { host: "localhost" }, { host: "id-preview.lovable.app" },
    { method: "POST" }, { method: "HEAD" },
    { headers: { "sec-fetch-dest": "empty" } },
    { headers: { "user-agent": "Googlebot" } },
    { headers: { purpose: "prefetch" } },
    { headers: { "sec-purpose": "prefetch" } },
    { headers: { accept: "application/json" } },
  ])("rejects non-document requests %j", async (options) => {
    await recordServedPageView(request("/ev-konyveles", options), html());
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([301, 404, 500])("does not count status %s", async (status) => {
    await recordServedPageView(request("/ev-konyveles"), new Response("", { status, headers: { "content-type": "text/html" } }));
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does not count RPC or JSON responses", async () => {
    await recordServedPageView(request("/ev-konyveles"), Response.json({ ok: true }));
    expect(rpc).not.toHaveBeenCalled();
  });
});