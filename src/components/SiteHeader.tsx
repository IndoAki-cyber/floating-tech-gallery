import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { moods, money, products, type Mood } from "@/lib/showroom-images";

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [budget, setBudget] = useState(2000);
  const results = useMemo(
    () => products.filter((p) =>
      (!q || `${p.name} ${p.category} ${p.desc}`.toLowerCase().includes(q.toLowerCase())) &&
      (!mood || p.moods.includes(mood)) && p.price <= budget),
    [q, mood, budget],
  );
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 pt-16 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="glass-panel w-full max-w-4xl rounded-3xl p-8 animate-in slide-in-from-top-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">What are you looking for today?</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-2xl text-muted-foreground hover:bg-secondary">×</button>
        </div>
        <p className="mt-2 text-lg text-muted-foreground">Tell us how you live — we'll find the tech. Or just type.</p>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “camera”, “battery”, “wood”…"
          className="mt-6 w-full rounded-2xl border bg-background px-6 py-5 text-xl outline-none focus:ring-2 focus:ring-ring" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {moods.map((m) => (
            <button key={m.mood} onClick={() => setMood(mood === m.mood ? null : m.mood)}
              className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 ${mood === m.mood ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>
              <div className="text-3xl">{m.emoji}</div>
              <div className="mt-2 font-bold">{m.mood}</div>
              <div className={`text-sm ${mood === m.mood ? "opacity-80" : "text-muted-foreground"}`}>{m.line}</div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-4">
          <span className="whitespace-nowrap font-bold">Budget up to {money(budget)}</span>
          <input type="range" min={100} max={2000} step={50} value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div className="mt-6 text-sm text-muted-foreground">{results.length} match{results.length === 1 ? "" : "es"}</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {results.map((p) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.id }} onClick={onClose}
              className="flex items-center gap-4 rounded-2xl border bg-card p-3 transition-colors hover:border-primary">
              <img src={p.img} alt="" className={`h-20 w-20 rounded-xl ${p.cutout ? "object-contain bg-secondary" : "object-cover"}`} />
              <div className="flex-1">
                <div className="font-bold">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.category}</div>
              </div>
              <div className="font-bold">{money(p.price)}</div>
            </Link>
          ))}
          {!results.length && <div className="col-span-full py-8 text-center text-muted-foreground">Nothing fits that yet — try a bigger budget or another mood.</div>}
        </div>
      </div>
    </div>
  );
}

function CartDrawer() {
  const { lines, total, open, setOpen, setQty, remove } = useCart();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm animate-in fade-in" onClick={() => setOpen(false)}>
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background p-8 shadow-2xl animate-in slide-in-from-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Your cart</h2>
          <button onClick={() => setOpen(false)} className="rounded-full px-3 py-1 text-2xl text-muted-foreground hover:bg-secondary">×</button>
        </div>
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto">
          {!lines.length && <p className="py-16 text-center text-lg text-muted-foreground">Your cart is empty.</p>}
          {lines.map((l) => (
            <div key={l.id} className="flex gap-4 rounded-2xl border bg-card p-3">
              <img src={l.product.img} alt="" className={`h-24 w-24 rounded-xl ${l.product.cutout ? "object-contain bg-secondary" : "object-cover"}`} />
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <span className="font-bold">{l.product.name}</span>
                  <button onClick={() => remove(l.id)} aria-label={`Remove ${l.product.name}`} className="text-sm text-destructive hover:underline">Remove</button>
                </div>
                <span className="text-muted-foreground">{money(l.product.price)}</span>
                <div className="mt-auto flex items-center gap-3">
                  <button onClick={() => setQty(l.id, l.qty - 1)} className="h-8 w-8 rounded-full border hover:bg-secondary">−</button>
                  <span className="w-6 text-center font-bold">{l.qty}</span>
                  <button onClick={() => setQty(l.id, l.qty + 1)} className="h-8 w-8 rounded-full border hover:bg-secondary">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-6">
          <div className="flex justify-between text-xl"><span>Subtotal</span><span className="font-bold">{money(total)}</span></div>
          <p className="mt-1 text-sm text-muted-foreground">Free shipping on all orders.</p>
          <button disabled={!lines.length} className="mt-4 w-full rounded-full bg-primary py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-40">Checkout</button>
        </div>
      </aside>
    </div>
  );
}

export function SiteHeader() {
  const { count, setOpen } = useCart();
  const [search, setSearch] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "/" && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); setSearch(true); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <>
      <div className="bg-primary py-2 text-center text-sm font-medium text-primary-foreground">Free shipping & 30-day returns on every order</div>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1680px] items-center gap-6 px-6 py-5 md:px-10">
          <Link to="/" className="font-display text-3xl">Lumen</Link>
          <nav className="hidden gap-8 text-lg lg:flex">
            <a href="/#deals" className="hover:text-primary">Hot deals</a>
            <a href="/#picks" className="hover:text-primary">For you</a>
            <a href="/#shop" className="hover:text-primary">Shop all</a>
          </nav>
          <button onClick={() => setSearch(true)} className="ml-auto flex flex-1 items-center gap-3 rounded-full border bg-card px-5 py-3 text-left text-muted-foreground transition-colors hover:border-primary md:max-w-md">
            <span>🔍</span><span className="flex-1">Find tech by how you live…</span>
            <kbd className="hidden rounded border px-2 text-xs sm:inline">/</kbd>
          </button>
          <button onClick={() => setOpen(true)} className="relative rounded-full border bg-card px-5 py-3 font-bold hover:border-primary">
            🛒 Cart
            {count > 0 && <span key={count} className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1 text-xs text-accent-foreground animate-in zoom-in">{count}</span>}
          </button>
        </div>
      </header>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
      <CartDrawer />
    </>
  );
}
