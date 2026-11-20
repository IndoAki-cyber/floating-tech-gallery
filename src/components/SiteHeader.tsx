import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-3 pt-4 sm:p-4 sm:pt-16 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="search-title" className="glass-panel w-full min-w-0 max-w-4xl rounded-3xl p-5 sm:p-8 animate-in slide-in-from-top-4" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 id="search-title" className="min-w-0 font-display text-2xl sm:text-3xl">What are you looking for today?</h2>
          <Button variant="ghost" size="icon" aria-label="Close search" onClick={onClose} className="h-11 w-11 shrink-0 rounded-full text-muted-foreground"><X /></Button>
        </div>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">Tell us how you live — we'll find the tech. Or just type.</p>
        <input aria-label="Search products" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “camera”, “battery”, “wood”…"
          className="mt-6 w-full rounded-2xl border bg-background px-4 py-4 text-base sm:px-6 sm:py-5 sm:text-xl outline-none focus:ring-2 focus:ring-ring" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {moods.map((m) => (
            <Button variant="ghost" key={m.mood} onClick={() => setMood(mood === m.mood ? null : m.mood)}
              className={`rounded-2xl h-auto min-h-11 min-w-0 flex-col items-start whitespace-normal border p-3 sm:p-4 text-left transition-colors hover:-translate-y-1 ${mood === m.mood ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>
              <div className="text-3xl">{m.emoji}</div>
              <div className="mt-2 font-bold">{m.mood}</div>
              <div className={`text-sm ${mood === m.mood ? "opacity-80" : "text-muted-foreground"}`}>{m.line}</div>
            </Button>
          ))}
        </div>
        <div className="mt-6 grid min-w-0 gap-3 sm:flex sm:items-center sm:gap-4">
          <span className="whitespace-nowrap font-bold">Budget up to {money(budget)}</span>
          <input aria-label="Maximum budget" type="range" min={100} max={2000} step={50} value={budget} onChange={(e) => setBudget(+e.target.value)} className="h-11 min-w-0 w-full accent-primary" />
        </div>
        <div className="mt-6 text-sm text-muted-foreground">{results.length} match{results.length === 1 ? "" : "es"}</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {results.map((p) => (
            <Link key={p.id} to="/product/$id" params={{ id: p.id }} onClick={onClose}
              className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-card p-3 transition-colors hover:border-primary">
              <img src={p.img} alt="" loading="lazy" decoding="async" className={`h-14 w-14 shrink-0 rounded-xl ${p.cutout ? "object-contain bg-secondary" : "object-cover"}`} />
              <div className="min-w-0">
                <div className="font-bold">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.category}</div>
              </div>
              <div className="shrink-0 text-sm font-bold sm:text-base">{money(p.price)}</div>
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
      <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-8 shadow-2xl animate-in slide-in-from-right" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 id="cart-title" className="min-w-0 font-display text-3xl">Your cart</h2>
          <Button variant="ghost" size="icon" aria-label="Close cart" onClick={() => setOpen(false)} className="h-11 w-11 shrink-0 rounded-full text-muted-foreground"><X /></Button>
        </div>
        <div className="mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-5">
          {!lines.length && <p className="py-16 text-center text-lg text-muted-foreground">Your cart is empty.</p>}
          {lines.map((l) => (
            <div key={l.id} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 rounded-2xl border bg-card p-3 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-4">
              <img src={l.product.img} alt="" decoding="async" className={`h-16 w-16 shrink-0 rounded-xl sm:h-24 sm:w-24 ${l.product.cutout ? "object-contain bg-secondary" : "object-cover"}`} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="grid min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-2">
                  <span className="font-bold">{l.product.name}</span>
                  <Button variant="ghost" onClick={() => remove(l.id)} aria-label={`Remove ${l.product.name}`} className="h-auto min-h-11 justify-start p-0 text-sm text-destructive hover:underline">Remove</Button>
                </div>
                <span className="text-muted-foreground">{money(l.product.price)}</span>
                <div className="mt-auto flex items-center gap-3">
                  <Button variant="ghost" aria-label={`Decrease ${l.product.name} quantity`} onClick={() => setQty(l.id, l.qty - 1)} className="h-11 w-11 shrink-0 rounded-full border p-0 hover:bg-secondary">−</Button>
                  <span className="w-6 text-center font-bold">{l.qty}</span>
                  <Button variant="ghost" aria-label={`Increase ${l.product.name} quantity`} onClick={() => setQty(l.id, l.qty + 1)} className="h-11 w-11 shrink-0 rounded-full border p-0 hover:bg-secondary">+</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="shrink-0 border-t pt-5">
          <div className="flex justify-between text-xl"><span>Subtotal</span><span className="font-bold">{money(total)}</span></div>
          <p className="mt-1 text-sm text-muted-foreground">Free shipping on all orders.</p>
          <Button variant="ghost" disabled={!lines.length} className="mt-4 h-auto min-h-12 w-full rounded-full bg-primary py-4 text-lg font-bold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-40">Checkout</Button>
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
      <div className="bg-primary px-4 py-2 text-center text-xs sm:text-sm font-medium text-primary-foreground">Free shipping & 30-day returns on every order</div>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1680px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-5 py-3 sm:flex sm:gap-4 sm:px-6 sm:py-5 md:gap-6 md:px-10">
          <Link to="/" className="min-w-0 font-display text-3xl">Lumen</Link>
          <nav className="hidden gap-8 text-lg lg:flex">
            <a href="/#deals" className="hover:text-primary">Hot deals</a>
            <a href="/#picks" className="hover:text-primary">For you</a>
            <a href="/#shop" className="hover:text-primary">Shop all</a>
          </nav>
          <Button variant="ghost" aria-label="Search products" onClick={() => setSearch(true)} className="col-span-2 row-start-2 h-auto min-h-11 min-w-0 justify-start gap-3 rounded-full border bg-card px-4 py-3 text-left text-muted-foreground transition-colors hover:border-primary sm:ml-auto sm:flex-1 md:max-w-md">
            <Search className="shrink-0" /><span className="min-w-0 flex-1 truncate">Find tech by how you live…</span>
            <kbd className="hidden rounded border px-2 text-xs sm:inline">/</kbd>
          </Button>
          <Button variant="ghost" aria-label={`Cart, ${count} items`} onClick={() => setOpen(true)} className="relative col-start-2 row-start-1 h-auto min-h-11 shrink-0 rounded-full border bg-card px-4 py-3 font-bold hover:border-primary sm:px-5">
            <ShoppingCart /> Cart
            {count > 0 && <span key={count} className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1 text-xs text-accent-foreground animate-in zoom-in">{count}</span>}
          </Button>
        </div>
      </header>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
      <CartDrawer />
    </>
  );
}
