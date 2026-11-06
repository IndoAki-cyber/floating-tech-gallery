import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./showroom-images";

type Line = { id: string; qty: number };
type Ctx = {
  lines: (Line & { product: Product })[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
};

const CartCtx = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setRaw(JSON.parse(localStorage.getItem("cart") || "[]")); } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(raw)); }, [raw]);

  const lines = raw.flatMap((l) => { const p = getProduct(l.id); return p ? [{ ...l, product: p }] : []; });
  const value: Ctx = {
    lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    total: lines.reduce((s, l) => s + l.qty * l.product.price, 0),
    open,
    setOpen,
    add: (id) => {
      setRaw((r) => r.some((l) => l.id === id) ? r.map((l) => l.id === id ? { ...l, qty: l.qty + 1 } : l) : [...r, { id, qty: 1 }]);
      setOpen(true);
    },
    setQty: (id, qty) => setRaw((r) => qty <= 0 ? r.filter((l) => l.id !== id) : r.map((l) => l.id === id ? { ...l, qty } : l)),
    remove: (id) => setRaw((r) => r.filter((l) => l.id !== id)),
  };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
