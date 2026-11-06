import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { money, products } from "@/lib/showroom-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Everyday Tech Showroom" },
      { name: "description", content: "Shop thoughtfully made headphones, cameras, laptops and more. Hot deals, staff picks and free shipping." },
      { property: "og:title", content: "Lumen — Everyday Tech Showroom" },
      { property: "og:description", content: "Shop thoughtfully made headphones, cameras, laptops and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Countdown() {
  const [s, setS] = useState(5 * 3600 + 42 * 60);
  useEffect(() => { const t = setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000); return () => clearInterval(t); }, []);
  const parts = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0"));
  return (
    <div className="flex gap-2">
      {parts.map((v, i) => <span key={i} className="rounded-xl bg-accent px-4 py-2 font-display text-3xl text-accent-foreground">{v}</span>)}
    </div>
  );
}

function Index() {
  const { add } = useCart();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [cat, setCat] = useState("All");
  const hero = products[0]!;
  const floaters = products.filter((p) => p.cutout).slice(1);
  const deals = products.filter((p) => p.hot);
  const picks = products.filter((p) => p.recommended).sort((a, b) => Number(a.cutout) - Number(b.cutout));
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  const shown = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* hero */}
      <section className="relative overflow-hidden" onMouseMove={(e) => setMouse({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })}>
        <div className="blob absolute -left-20 top-10 h-[28rem] w-[28rem] bg-primary/20" />
        <div className="blob absolute right-0 bottom-0 h-[30rem] w-[30rem] bg-accent/20" style={{ animationDelay: "-8s" }} />
        <div className="relative mx-auto grid max-w-[1680px] items-center gap-12 px-6 py-20 md:px-10 lg:min-h-[78vh] lg:grid-cols-2">
          <div>
            <span className="glass inline-block rounded-full px-5 py-2 text-base">New season · Up to 25% off</span>
            <h1 className="mt-8 font-display text-6xl leading-[1.02] md:text-8xl">Tech that feels <em className="text-primary">at home.</em></h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-muted-foreground md:text-2xl">Headphones, cameras, laptops and more — picked for how they look, sound and feel in real life.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#shop" className="rounded-full bg-primary px-9 py-5 text-lg font-bold text-primary-foreground transition-transform hover:scale-105">Shop now</a>
              <a href="#deals" className="rounded-full border-2 border-foreground px-9 py-5 text-lg font-bold transition-colors hover:bg-foreground hover:text-background">See hot deals</a>
            </div>
            <div className="mt-12 flex gap-10 text-muted-foreground">
              <div><div className="font-display text-4xl text-foreground">12k+</div>happy customers</div>
              <div><div className="font-display text-4xl text-foreground">4.8★</div>average rating</div>
            </div>
          </div>
          <div className="relative h-[560px]">
            <div className="glass absolute inset-10 rounded-full" style={{ transform: `translate(${mouse.x * -20}px, ${mouse.y * -20}px)` }} />
            <Link to="/product/$id" params={{ id: hero.id }}>
              <img src={hero.img} alt={hero.name} width={1024} height={1024} className="float-a absolute inset-0 m-auto h-[80%] w-[80%] object-contain drop-shadow-2xl"
                style={{ translate: `${mouse.x * 30}px ${mouse.y * 30}px` }} />
            </Link>
            {floaters.map((o, i) => (
              <Link key={o.id} to="/product/$id" params={{ id: o.id }}
                className={`absolute ${["right-0 top-0", "bottom-4 left-0", "left-4 top-6"][i]} ${i % 2 ? "float-b" : "float-a"}`}
                style={{ animationDelay: `${-i * 2}s`, translate: `${mouse.x * (50 + i * 20)}px ${mouse.y * (50 + i * 20)}px` }}>
                <img src={o.img} alt={o.name} className="h-32 w-32 object-contain transition-transform hover:scale-125" />
              </Link>
            ))}
            <div className="glass float-b absolute bottom-10 right-4 rounded-2xl px-6 py-4">
              <div className="text-muted-foreground">{hero.name}</div>
              <div className="flex items-center gap-4">
                <span className="font-display text-3xl">{money(hero.price)}</span>
                <button onClick={() => add(hero.id)} className="rounded-full bg-primary px-4 py-2 font-bold text-primary-foreground hover:scale-105">+ Add</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* trust bar */}
      <section className="border-y bg-secondary/60">
        <div className="mx-auto grid max-w-[1680px] grid-cols-2 gap-6 px-6 py-8 text-lg md:grid-cols-4 md:px-10">
          {["🚚 Free 2–4 day delivery", "↩︎ 30-day easy returns", "🛡 2-year warranty", "💬 Real humans on chat"].map((t) => <div key={t} className="font-medium">{t}</div>)}
        </div>
      </section>

      {/* hot deals — dark band */}
      <section id="deals" className="bg-foreground py-24 text-background">
        <div className="mx-auto max-w-[1680px] px-6 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-lg font-bold uppercase tracking-widest text-accent">🔥 Hot deals</span>
              <h2 className="mt-3 font-display text-5xl md:text-6xl">Gone when the clock hits zero.</h2>
            </div>
            <Countdown />
          </div>
          <div className="mt-12 flex snap-x gap-8 overflow-x-auto pb-4">
            {deals.map((p) => (
              <div key={p.id} className="w-[340px] shrink-0 snap-start text-foreground md:w-[380px]"><ProductCard p={p} variant="deal" /></div>
            ))}
          </div>
        </div>
      </section>

      {/* recommended — editorial bento */}
      <section id="picks" className="mx-auto max-w-[1680px] px-6 py-24 md:px-10">
        <span className="text-lg font-bold uppercase tracking-widest text-primary">★ Recommended for you</span>
        <h2 className="mt-3 font-display text-5xl md:text-6xl">Our team actually uses these.</h2>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {picks[0] && (
            <Link to="/product/$id" params={{ id: picks[0].id }} className="group relative overflow-hidden rounded-[2rem] lg:col-span-2 lg:row-span-2">
              <img src={picks[0].img} alt={picks[0].name} loading="lazy" className="h-full min-h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="glass-panel absolute bottom-6 left-6 right-6 rounded-2xl p-6 md:right-auto md:max-w-md">
                <div className="text-sm uppercase tracking-wider text-muted-foreground">Pick of the month</div>
                <div className="mt-1 font-display text-3xl">{picks[0].name}</div>
                <p className="mt-2 text-muted-foreground">{picks[0].desc}</p>
                <div className="mt-3 text-2xl font-bold">{money(picks[0].price)}</div>
              </div>
            </Link>
          )}
          {picks.slice(1, 3).map((p) => <ProductCard key={p.id} p={p} variant="pick" />)}
        </div>
      </section>

      {/* shop all with category tabs */}
      <section id="shop" className="bg-secondary/50 py-24">
        <div className="mx-auto max-w-[1680px] px-6 md:px-10">
          <h2 className="font-display text-5xl md:text-6xl">Shop everything</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`rounded-full border px-6 py-3 text-lg font-medium transition-colors ${cat === c ? "border-foreground bg-foreground text-background" : "bg-card hover:border-foreground"}`}>{c}</button>
            ))}
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* newsletter */}
      <section className="mx-auto max-w-[1680px] px-6 py-24 md:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-12 text-primary-foreground md:p-20">
          <h2 className="max-w-2xl font-display text-5xl md:text-6xl">Get first dibs on deals.</h2>
          <p className="mt-4 max-w-xl text-xl opacity-80">One email a week. No spam, just the good stuff.</p>
          <form className="mt-8 flex max-w-xl flex-wrap gap-3" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@email.com" className="flex-1 rounded-full bg-background px-6 py-4 text-lg text-foreground outline-none" />
            <button className="rounded-full bg-foreground px-8 py-4 text-lg font-bold text-background hover:scale-105">Subscribe</button>
          </form>
          <img src={products[1]!.img} alt="" className="float-b pointer-events-none absolute -bottom-10 -right-10 hidden h-80 w-80 object-contain opacity-90 md:block" />
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto grid max-w-[1680px] gap-10 px-6 py-16 text-lg md:grid-cols-4 md:px-10">
          <div><div className="font-display text-3xl">Lumen</div><p className="mt-3 text-muted-foreground">Everyday tech, thoughtfully chosen.</p></div>
          {[["Shop", ["Audio", "Cameras", "Laptops", "Accessories"]], ["Help", ["Shipping", "Returns", "Warranty", "Contact"]], ["Company", ["About", "Stores", "Careers", "Press"]]].map(([h, items]) => (
            <div key={h as string}><div className="font-bold">{h as string}</div>
              <ul className="mt-3 space-y-2 text-muted-foreground">{(items as string[]).map((i) => <li key={i} className="cursor-pointer hover:text-foreground">{i}</li>)}</ul></div>
          ))}
        </div>
        <div className="pb-8 text-center text-muted-foreground">© 2026 Lumen</div>
      </footer>
    </div>
  );
}
