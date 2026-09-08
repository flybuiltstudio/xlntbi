import { createFileRoute } from "@tanstack/react-router";
import { ROUTE_PAIRS } from "@/lib/i18n/routes";
import { productSlugs } from "@/lib/products";
import { listCustomProductSlugs } from "@/lib/product-overrides.server";
import { sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = "https://xlntbi.hu";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const entries: SitemapEntry[] = [];
          for (const pair of ROUTE_PAIRS) {
            entries.push({ path: pair.hu });
            entries.push({ path: pair.en });
          }

          const slugs = new Set<string>(productSlugs);
          for (const slug of await listCustomProductSlugs()) slugs.add(slug);
          for (const slug of [...slugs].sort()) {
            entries.push({ path: `/termek/${slug}` });
            entries.push({ path: `/en/product/${slug}` });
          }

          return new Response(sitemapXML(BASE_URL, entries), {
            headers: {
              "Content-Type": "application/xml",
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (error) {
          console.error(error);
          return new Response("Sitemap unavailable", {
            status: 500,
            headers: { "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
