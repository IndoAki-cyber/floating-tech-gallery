import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { money, type Product } from "@/lib/showroom-images";

export function ProductCard({ p, variant = "default" }: { p: Product; variant?: "default" | "deal" | "pick" }) {
  const { add } = useCart();
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <div className={`group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-card transition-[transform,box-shadow] duration-300 hover:-translate-y-2 hover:shadow-xl ${variant === "deal" ? "border-accent/40" : ""}`}>
      {variant === "deal" && off > 0 && <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">−{off}% today</span>}
      {variant === "pick" && <span className="absolute left-4 top-4 z-10 rounded-full bg-background/90 px-4 py-1.5 text-sm font-bold">★ Staff pick</span>}
      <Link to="/product/$id" params={{ id: p.id }} className="block aspect-[4/3] overflow-hidden bg-secondary p-4 sm:p-6">
        <img src={p.img} alt={p.name} loading="lazy" decoding="async" width={1024} height={1024}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${p.cutout ? "float-a object-contain p-5 sm:p-8" : "object-cover"}`} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <span className="text-sm uppercase tracking-wider text-muted-foreground">{p.category}</span>
        <Link to="/product/$id" params={{ id: p.id }} className="mt-1 font-display text-2xl hover:text-primary">{p.name}</Link>
        <div className="mt-2 text-sm text-muted-foreground">★ {p.rating} · {p.reviews.toLocaleString()} reviews</div>
        <div className="mt-auto grid grid-cols-1 gap-4 pt-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <span className="text-2xl font-bold">{money(p.price)}</span>
            {p.oldPrice && <span className="ml-2 text-muted-foreground line-through">{money(p.oldPrice)}</span>}
          </div>
          <Button onClick={() => add(p.id)} className="h-auto min-h-11 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95">Add to cart</Button>
        </div>
      </div>
    </div>
  );
}
