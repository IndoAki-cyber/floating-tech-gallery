import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SWARM_BUILDERS, SWARM_SPEEDS, CURSOR_TRAVEL_MS, REVEAL_DURATION_MS, SCROLL_WIREFRAME_DURATION_MS, type SwarmSpeed } from "@/lib/swarm-rebuild";

type Cursor = { x: number; y: number };
const SELECTOR = "header, section, footer, article, h1, h2, h3, p, button, a, img, input, form, [data-swarm-item]";

export function ScrollSwarmBuilder({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const elements = useRef<HTMLElement[]>([]);
  const pending = useRef(new Set<HTMLElement>());
  const queue = useRef(new Set<HTMLElement>());
  const observer = useRef<IntersectionObserver | null>(null);
  const animations = useRef<Animation[]>([]);
  const generation = useRef(0);
  const running = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelWait = useRef<(() => void) | null>(null);
  const speedRef = useRef<SwarmSpeed>(1);
  const activeTargets = useRef<HTMLElement[]>([]);
  const [speed, setSpeed] = useState<SwarmSpeed>(1);
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);
  const [busy, setBusy] = useState(false);
  const [boot, setBoot] = useState(true);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [frames, setFrames] = useState<DOMRect[]>([]);
  const [travel, setTravel] = useState(CURSOR_TRAVEL_MS);

  const cleanup = useCallback(() => {
    generation.current++;
    observer.current?.disconnect();
    if (timer.current !== null) clearTimeout(timer.current);
    cancelWait.current?.();
    cancelWait.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    elements.current.forEach((element) => element.classList.remove("swarm-pending"));
    pending.current.clear();
    queue.current.clear();
    activeTargets.current = [];
    running.current = false;
    root.current?.setAttribute("data-swarm-phase", "ready");
  }, []);

  const disable = useCallback(() => {
    cleanup();
    enabledRef.current = false;
    setEnabled(false);
    setBusy(false);
    setBoot(false);
    setFrames([]);
    setCursors([]);
  }, [cleanup]);

  const position = useCallback((targets: HTMLElement[]) => {
    setCursors(SWARM_BUILDERS.map((_, index) => {
      const element = targets[index];
      const rect = element?.getBoundingClientRect();
      return rect ? {
        x: Math.max(8, Math.min(window.innerWidth - 82, rect.left + Math.min(rect.width / 2, 64))),
        y: Math.max(20, Math.min(window.innerHeight - 100, rect.top + Math.min(rect.height / 2, 44))),
      } : {
        x: 16 + index * Math.max(42, (window.innerWidth - 110) / 6),
        y: 70 + (index % 2) * 45,
      };
    }));
  }, []);

  const drain = useCallback(() => {
    if (running.current || !enabledRef.current) return;
    running.current = true;
    const run = generation.current;
    const wait = (ms: number) => new Promise<void>((resolve) => {
      cancelWait.current = resolve;
      timer.current = setTimeout(() => { cancelWait.current = null; resolve(); }, ms);
    });
    void (async () => {
      setBusy(true);
      await wait(40);
      while (generation.current === run && enabledRef.current) {
        const visible = Array.from(queue.current).filter((element) => {
          const rect = element.getBoundingClientRect();
          return pending.current.has(element) && rect.bottom > 0 && rect.top < window.innerHeight;
        }).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        const batch = visible.slice(0, 6);
        if (!batch.length) break;
        batch.forEach((element) => queue.current.delete(element));
        activeTargets.current = batch;
        const travelTime = CURSOR_TRAVEL_MS / speedRef.current;
        setTravel(travelTime);
        position(batch);
        await wait(travelTime);
        if (generation.current !== run) return;
        // A fast scroll must never build elements that have already left the screen.
        const arrived = batch.filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < window.innerHeight;
        });
        batch.filter((element) => !arrived.includes(element)).forEach((element) => queue.current.add(element));
        activeTargets.current = arrived;
        position(arrived);
        setFrames(arrived.map((element) => element.getBoundingClientRect()));
        await wait(SCROLL_WIREFRAME_DURATION_MS);
        if (generation.current !== run) return;
        setFrames([]);
        const revealTime = REVEAL_DURATION_MS / speedRef.current;
        arrived.forEach((element) => {
          element.dataset['swarmBuilt'] = "true";
          pending.current.delete(element);
          observer.current?.unobserve(element);
          element.classList.remove("swarm-pending");
          if (element.animate) {
            const computed = getComputedStyle(element);
            const base = computed.transform === "none" ? "" : computed.transform;
            animations.current.push(element.animate([
              { opacity: 0, transform: `${base} scale(0.97)` },
              { opacity: computed.opacity, transform: `${base} scale(1)` },
            ], { duration: revealTime, easing: "cubic-bezier(.2,.7,.2,1)" }));
          }
        });
        await wait(revealTime);
      }
      if (generation.current === run) {
        running.current = false;
        activeTargets.current = [];
        setBusy(false);
        setFrames([]);
        position([]);
      }
    })();
  }, [position]);

  const start = useCallback((reset: boolean) => {
    cleanup();
    const content = root.current;
    if (!content) return;
    if (!window.IntersectionObserver || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      disable();
      return;
    }
    enabledRef.current = true;
    setEnabled(true);
    setBoot(false);
    setFrames([]);
    elements.current = Array.from(content.querySelectorAll<HTMLElement>(SELECTOR)).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    });
    // Re-enabling leaves previously built elements untouched; Replay deliberately resets them.
    elements.current.forEach((element) => {
      if (reset || element.dataset['swarmBuilt'] !== "true") {
        element.classList.add("swarm-pending");
        pending.current.add(element);
      }
    });
    position([]);
    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target instanceof HTMLElement && pending.current.has(entry.target)) {
          queue.current.add(entry.target);
        }
      });
      drain();
    }, { rootMargin: "0px 0px 60px 0px", threshold: 0 });
    pending.current.forEach((element) => observer.current?.observe(element));
  }, [cleanup, disable, drain, position]);

  useEffect(() => {
    start(true);
    return cleanup;
  }, [start, cleanup]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!enabledRef.current) return;
        position(activeTargets.current);
        if (activeTargets.current.length) setFrames((previous) => previous.length ? activeTargets.current.map((element) => element.getBoundingClientRect()) : previous);
        drain();
      });
    };
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const changed = () => { if (media?.matches) disable(); };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    media?.addEventListener?.("change", changed);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media?.removeEventListener?.("change", changed);
    };
  }, [position, drain, disable]);

  return <>
    <div ref={root} className="swarm-content" data-swarm-phase={boot ? "boot" : "ready"}>{children}</div>
    <noscript><style>{`.swarm-content[data-swarm-phase="boot"] > * { visibility: visible; }`}</style></noscript>
    <div className="swarm-layer" aria-hidden="true">
      {cursors.map((cursor, index) => <div key={SWARM_BUILDERS[index]} className={`swarm-cursor swarm-builder-${index}`}
        style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`, transitionDuration: `${travel}ms` }}>
        <svg width="25" height="30" viewBox="0 0 25 30" fill="none"><path d="M2 2L22 17L12 19L7 28L2 2Z" fill="currentColor" stroke="var(--swarm-cursor-edge)" strokeWidth="2" strokeLinejoin="round" /></svg>
        <span className="swarm-name">{SWARM_BUILDERS[index]}</span>
      </div>)}
      {frames.map((rect, index) => <div key={index} className={`swarm-wireframe swarm-builder-${index}`}
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }} />)}
    </div>
    <div className="swarm-controls" role="group" aria-label="Swarm rebuild controls">
      <Button variant="ghost" size="sm" className="swarm-control" aria-label="Replay Build" title="Replay Build" onClick={() => start(true)}><RotateCcw /><span>Replay</span></Button>
      <span className="swarm-control-divider" />
      {SWARM_SPEEDS.map((value) => <Button key={value} variant={speed === value ? "secondary" : "ghost"} size="sm" className="swarm-speed"
        aria-label={`${value}x build speed`} aria-pressed={speed === value} onClick={() => { speedRef.current = value; setSpeed(value); }}>{value}x</Button>)}
      {busy && <><span className="swarm-control-divider" /><Button variant="ghost" size="sm" className="swarm-control" aria-label="Skip build animation" onClick={disable}>Skip<SkipForward /></Button></>}
    </div>
    <Button variant="outline" size="sm" className="swarm-live-toggle" aria-pressed={enabled}
      onClick={() => {
        if (enabled) {
          elements.current.forEach((element) => { element.dataset['swarmBuilt'] = "true"; });
          disable();
        } else start(false);
      }}>Live Build: {enabled ? "ON" : "OFF"}</Button>
  </>;
}