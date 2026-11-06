import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { money, type Product } from "@/lib/showroom-images";

export function ProductCard({ p, variant = "default" }: { p: Product; variant?: "default" | "deal" | "pick" }) {
  const { add } = useCart();
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${variant === "deal" ? "border-accent/40" : ""}`}>
      {variant === "deal" && off > 0 && <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-foreground">−{off}% today</span>}
      {variant === "pick" && <span className="absolute left-4 top-4 z-10 rounded-full bg-background/90 px-4 py-1.5 text-sm font-bold">★ Staff pick</span>}
      <Link to="/product/$id" params={{ id: p.id }} className="block aspect-square overflow-hidden bg-secondary">
        <img src={p.img} alt={p.name} loading="lazy" width={1024} height={1024}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${p.cutout ? "float-a object-contain p-8" : "object-cover"}`} />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-sm uppercase tracking-wider text-muted-foreground">{p.category}</span>
        <Link to="/product/$id" params={{ id: p.id }} className="mt-1 font-display text-2xl hover:text-primary">{p.name}</Link>
        <div className="mt-2 text-sm text-muted-foreground">★ {p.rating} · {p.reviews.toLocaleString()} reviews</div>
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="text-2xl font-bold">{money(p.price)}</span>
            {p.oldPrice && <span className="ml-2 text-muted-foreground line-through">{money(p.oldPrice)}</span>}
          </div>
          <button onClick={() => add(p.id)} className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95">Add to cart</button>
        </div>
      </div>
    </div>
  );
}
