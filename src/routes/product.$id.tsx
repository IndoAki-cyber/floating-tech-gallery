import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { getProduct, money, products } from "@/lib/showroom-images";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return { name: p.name, desc: p.desc };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} — Lumen` },
      { name: "description", content: loaderData?.desc ?? "" },
      { property: "og:title", content: `${loaderData?.name ?? "Product"} — Lumen` },
      { property: "og:description", content: loaderData?.desc ?? "" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const p = getProduct(id)!;
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const related = products.filter((o) => o.id !== p.id && o.moods.some((m) => p.moods.includes(m))).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1680px] px-6 py-12 md:px-10">
        <Link to="/" className="text-lg text-muted-foreground hover:text-primary">← Back to shop</Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-secondary">
            <img src={p.img} alt={p.name} className={`h-full w-full ${p.cutout ? "float-a object-contain p-12" : "object-cover"}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg uppercase tracking-wider text-muted-foreground">{p.category}</span>
            <h1 className="mt-2 font-display text-5xl md:text-6xl">{p.name}</h1>
            <div className="mt-4 text-lg">★ {p.rating} <span className="text-muted-foreground">· {p.reviews.toLocaleString()} reviews</span></div>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-bold">{money(p.price)}</span>
              {p.oldPrice && <span className="text-2xl text-muted-foreground line-through">{money(p.oldPrice)}</span>}
            </div>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">{p.desc}</p>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {p.specs.map((s) => <li key={s} className="rounded-2xl border bg-card p-4 font-medium">✓ {s}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 rounded-full border bg-card px-4 py-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-xl">−</button>
                <span className="w-6 text-center text-lg font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="text-xl">+</button>
              </div>
              <button onClick={() => { for (let i = 0; i < qty; i++) add(p.id); }} className="flex-1 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
                Add to cart · {money(p.price * qty)}
              </button>
            </div>
            <div className="mt-6 flex gap-6 text-muted-foreground"><span>🚚 Free delivery in 2–4 days</span><span>↩︎ 30-day returns</span></div>
          </div>
        </div>
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-4xl">Goes well with</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((o) => <ProductCard key={o.id} p={o} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
