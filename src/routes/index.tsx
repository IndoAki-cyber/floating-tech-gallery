import { createFileRoute } from "@tanstack/react-router";
import { useState, type MouseEvent } from "react";
import { products } from "@/lib/showroom-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Liquid Glass Tech Showroom" },
      { name: "description", content: "Explore next-gen devices in an interactive liquid glass showroom." },
      { property: "og:title", content: "Lumen — Liquid Glass Tech Showroom" },
      { property: "og:description", content: "Explore next-gen devices in an interactive liquid glass showroom." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [t, setT] = useState({ x: 0, y: 0, mx: 50, my: 50 });
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setT({ x: (py - 0.5) * -14, y: (px - 0.5) * 14, mx: px * 100, my: py * 100 });
  };
  return (
    <div
      onMouseMove={move}
      onMouseLeave={() => setT({ x: 0, y: 0, mx: 50, my: 50 })}
      className={`glass relative overflow-hidden rounded-3xl transition-transform duration-200 ease-out ${className}`}
      style={{ transform: `perspective(900px) rotateX(${t.x}deg) rotateY(${t.y}deg)` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: `radial-gradient(circle at ${t.mx}% ${t.my}%, oklch(1 0 0 / 18%), transparent 45%)` }}
      />
      {children}
    </div>
  );
}

function Index() {
  const [active, setActive] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const p = products[active];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      onMouseMove={(e) => setMouse({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })}
    >
      {/* liquid background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="blob absolute left-[5%] top-[10%] h-96 w-96 bg-primary/40" />
        <div className="blob absolute right-[5%] top-[30%] h-[28rem] w-[28rem] bg-accent/40" style={{ animationDelay: "-6s" }} />
        <div className="blob absolute bottom-[5%] left-[35%] h-80 w-80 bg-primary/30" style={{ animationDelay: "-12s" }} />
      </div>

      <div className="relative z-10">
        <header className="mx-auto mt-6 flex max-w-6xl items-center justify-between rounded-full glass px-6 py-3">
          <span className="font-display text-lg font-bold">LUMEN<span className="text-liquid">.</span></span>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            {["Showroom", "Devices", "Experience", "Visit"].map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="transition-colors hover:text-foreground">{n}</a>
            ))}
          </nav>
          <button className="rounded-full bg-liquid px-5 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 active:scale-95">Book a visit</button>
        </header>

        {/* hero */}
        <section id="showroom" className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">Now showing · {p.tag}</span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] md:text-7xl">
              Touch the <span className="text-liquid">future</span> of tech.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">A liquid glass showroom where tomorrow's devices float, glow and wait for you.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#devices" className="rounded-full bg-liquid px-7 py-3 font-bold text-primary-foreground transition-transform hover:scale-105">Explore devices</a>
              <a href="#visit" className="glass rounded-full px-7 py-3 font-bold transition-colors hover:bg-glass">Visit in person</a>
            </div>
          </div>

          <div className="relative h-[460px]">
            <div
              className="absolute inset-8 rounded-full glass transition-transform duration-300"
              style={{ transform: `translate(${mouse.x * -20}px, ${mouse.y * -20}px)` }}
            />
            <img
              key={p.id}
              src={p.img}
              alt={p.name}
              width={1024}
              height={1024}
              className="float-a absolute inset-0 m-auto h-[85%] w-[85%] object-contain drop-shadow-2xl animate-in fade-in zoom-in-90 duration-500"
              style={{ translate: `${mouse.x * 30}px ${mouse.y * 30}px` }}
            />
            {products.filter((_, i) => i !== active).slice(0, 2).map((o, i) => (
              <img
                key={o.id}
                src={o.img}
                alt=""
                width={1024}
                height={1024}
                className={`${i ? "float-b bottom-0 left-0" : "float-a right-0 top-0"} absolute h-28 w-28 object-contain opacity-70 blur-[1px]`}
                style={{ animationDelay: `${-i * 3}s`, translate: `${mouse.x * (50 + i * 20)}px ${mouse.y * (50 + i * 20)}px` }}
              />
            ))}
            <div className="glass float-b absolute bottom-6 right-2 rounded-2xl px-5 py-3">
              <div className="text-xs text-muted-foreground">{p.name}</div>
              <div className="font-display text-xl font-bold">{p.price}</div>
            </div>
          </div>
        </section>

        {/* selector */}
        <section className="mx-auto max-w-6xl px-6">
          <div className="glass flex flex-wrap justify-center gap-2 rounded-full p-2">
            {products.map((o, i) => (
              <button
                key={o.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${i === active ? "bg-liquid text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <img src={o.img} alt="" className="h-6 w-6 object-contain" />
                {o.name}
              </button>
            ))}
          </div>
        </section>

        {/* devices */}
        <section id="devices" className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="font-display text-4xl font-bold">The <span className="text-liquid">collection</span></h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((o, i) => (
              <TiltCard key={o.id} className="group cursor-pointer p-5">
                <div onClick={() => { setActive(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                  <div className="relative h-48">
                    <img src={o.img} alt={o.name} loading="lazy" width={1024} height={1024}
                      className="float-a h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                      style={{ animationDelay: `${-i * 1.5}s` }} />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{o.tag}</span>
                  <h3 className="mt-1 font-display text-xl font-bold">{o.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{o.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold">{o.price}</span>
                    <span className="rounded-full glass px-3 py-1 text-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground">View →</span>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* experience */}
        <section id="experience" className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
          {[
            ["120+", "Devices to try hands-on"],
            ["4", "Immersive demo zones"],
            ["0", "Pressure. Just play."],
          ].map(([n, l]) => (
            <TiltCard key={l} className="p-8">
              <div className="font-display text-5xl font-extrabold text-liquid">{n}</div>
              <div className="mt-2 text-muted-foreground">{l}</div>
            </TiltCard>
          ))}
        </section>

        <section id="visit" className="mx-auto max-w-6xl px-6 pb-16">
          <TiltCard className="p-10 text-center md:p-16">
            <h2 className="font-display text-4xl font-bold md:text-5xl">Come <span className="text-liquid">feel</span> it.</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">Open daily, 10am – 9pm. Walk in or reserve a guided session.</p>
            <button className="mt-8 rounded-full bg-liquid px-8 py-3 font-bold text-primary-foreground transition-transform hover:scale-105">Reserve a session</button>
          </TiltCard>
        </section>

        <footer className="pb-10 text-center text-sm text-muted-foreground">© 2026 Lumen Showroom</footer>
      </div>
    </div>
  );
}
