import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ProductDetail } from "@/components/ProductDetail";
import { getProduct, resolveProductSlug } from "@/lib/products";

export const Route = createFileRoute("/termek/$slug")({
  loader: ({ params }) => {
    const canonical = resolveProductSlug(params.slug);
    if (canonical !== params.slug) {
      throw redirect({ to: "/termek/$slug", params: { slug: canonical }, statusCode: 301 });
    }
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },

  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return {};
    const pageUrl = `https://xlntbi.hu/termek/${product.slug}`;
    return {
      meta: [
        { title: product.metaTitle },
        { name: "description", content: product.metaDescription },
        { property: "og:title", content: product.metaTitle },
        { property: "og:description", content: product.metaDescription },
        { property: "og:type", content: "product" },
        { property: "og:url", content: pageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: product.metaTitle },
        { name: "twitter:description", content: product.metaDescription },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  return <ProductDetail slug={product.slug} h1={product.name} />;
}
