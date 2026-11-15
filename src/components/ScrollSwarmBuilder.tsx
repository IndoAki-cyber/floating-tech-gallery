import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SWARM_ROLES, SWARM_SPEEDS, LIVE_CURSOR_TRAVEL_MS, LIVE_REVEAL_DURATION_MS, SCROLL_WIREFRAME_DURATION_MS, swarmRole, type SwarmSpeed } from "@/lib/swarm-rebuild";

type Cursor = { x: number; y: number };
const SELECTOR = "header, section, footer, article, h1, h2, h3, p, button, a, img, input, form, span, li, .group, [data-swarm-item]";
const roleOf = (element: HTMLElement) => swarmRole(element.tagName, element.classList.contains("group"));

export function ScrollSwarmBuilder({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const elements = useRef<HTMLElement[]>([]);
  const pending = useRef(new Set<HTMLElement>());
  const queue = useRef(new Set<HTMLElement>());
  const observer = useRef<IntersectionObserver | null>(null);
  const mutations = useRef<MutationObserver | null>(null);
  const animations = useRef<Animation[]>([]);
  const generation = useRef(0);
  const running = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelWait = useRef<(() => void) | null>(null);
  const speedRef = useRef<SwarmSpeed>(1);
  const activeTargets = useRef<HTMLElement[]>([]);
  const pointer = useRef<Cursor | null>(null);
  const orbit = useRef(0);
  const revealing = useRef<{ start: number; duration: number } | null>(null);
  const [speed, setSpeed] = useState<SwarmSpeed>(1);
  const [enabled, setEnabled] = useState(true);
  const enabledRef = useRef(true);
  const [busy, setBusy] = useState(false);
  const [boot, setBoot] = useState(true);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [frames, setFrames] = useState<{ rect: DOMRect; role: number }[]>([]);
  const [travel, setTravel] = useState(LIVE_CURSOR_TRAVEL_MS);

  const cleanup = useCallback(() => {
    generation.current++;
    observer.current?.disconnect();
    mutations.current?.disconnect();
    if (timer.current !== null) clearTimeout(timer.current);
    cancelWait.current?.();
    cancelWait.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    elements.current.forEach((element) => element.classList.remove("swarm-pending"));
    pending.current.clear();
    queue.current.clear();
    activeTargets.current = [];
    revealing.current = null;
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
    const center = pointer.current ?? { x: window.innerWidth / 2, y: Math.min(150, window.innerHeight / 3) };
    const reveal = revealing.current;
    const progress = reveal ? Math.min(1, (performance.now() - reveal.start) / reveal.duration) : 0;
    setCursors(SWARM_ROLES.map((_, index) => {
      const element = targets.find((target) => roleOf(target) === index);
      const rect = element?.getBoundingClientRect();
      const angle = orbit.current + index * Math.PI / 3;
      return rect ? {
        x: Math.max(4, Math.min(window.innerWidth - 20, rect.left + (index === 2 || index === 3 ? rect.width * progress : Math.min(rect.width / 2, 32)))),
        y: Math.max(4, Math.min(window.innerHeight - 24, rect.top + (index === 2 ? rect.height * progress : index === 3 ? Math.min(rect.height, 22) : Math.min(rect.height / 2, 24)))),
      } : {
        x: Math.max(4, Math.min(window.innerWidth - 20, center.x + Math.cos(angle) * 34)),
        y: Math.max(4, Math.min(window.innerHeight - 24, center.y + Math.sin(angle) * 28)),
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
        }).sort((a, b) => {
          // Reveal containers before their children so no built element stays hidden by its parent.
          if (a.contains(b)) return -1;
          if (b.contains(a)) return 1;
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        });
        const roles = new Set<number>();
        const batch = visible.filter((element) => {
          const role = roleOf(element);
          if (roles.has(role)) return false;
          // A child cannot be revealed while an unbuilt parent still hides it.
          if (visible.some((parent) => parent !== element && parent.contains(element) && pending.current.has(parent))) return false;
          roles.add(role);
          return true;
        });
        if (!batch.length) break;
        batch.forEach((element) => queue.current.delete(element));
        activeTargets.current = batch;
        revealing.current = null;
        const travelTime = LIVE_CURSOR_TRAVEL_MS / speedRef.current;
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
        setFrames(arrived.map((element) => ({ rect: element.getBoundingClientRect(), role: roleOf(element) })));
        await wait(SCROLL_WIREFRAME_DURATION_MS);
        if (generation.current !== run) return;
        setFrames([]);
        const revealTime = LIVE_REVEAL_DURATION_MS / speedRef.current;
        revealing.current = { start: performance.now(), duration: revealTime };
        arrived.forEach((element) => {
          element.dataset['swarmBuilt'] = "true";
          pending.current.delete(element);
          observer.current?.unobserve(element);
          element.classList.remove("swarm-pending");
          if (element.animate) {
            const computed = getComputedStyle(element);
            const base = computed.transform === "none" ? "" : computed.transform;
             const animation = element.animate([
              { opacity: 0, transform: `${base} scale(${roleOf(element) === 2 ? "0.12" : "0.98"})`, transformOrigin: roleOf(element) === 2 ? "top left" : computed.transformOrigin, clipPath: roleOf(element) === 3 ? "inset(0 100% 0 0)" : "inset(0)" },
              { opacity: computed.opacity, transform: `${base} scale(1)`, transformOrigin: roleOf(element) === 2 ? "top left" : computed.transformOrigin, clipPath: "inset(0)" },
             ], { duration: revealTime, easing: "cubic-bezier(.2,.7,.2,1)" });
             animations.current.push(animation);
             animation.onfinish = () => {
               animations.current = animations.current.filter((active) => active !== animation);
             };
          }
        });
        await wait(revealTime);
        revealing.current = null;
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
    // Category changes can insert new cards without remounting the landing page.
    mutations.current = new MutationObserver(() => {
      elements.current = elements.current.filter((element) => {
        if (content.contains(element)) return true;
        pending.current.delete(element);
        queue.current.delete(element);
        observer.current?.unobserve(element);
        return false;
      });
      const known = new Set(elements.current);
      content.querySelectorAll<HTMLElement>(SELECTOR).forEach((element) => {
        if (known.has(element) || element.dataset['swarmBuilt'] === "true") return;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        elements.current.push(element);
        element.classList.add("swarm-pending");
        pending.current.add(element);
        observer.current?.observe(element);
      });
    });
    mutations.current.observe(content, { childList: true, subtree: true });
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
        if (activeTargets.current.length) setFrames((previous) => previous.length ? activeTargets.current.map((element) => ({ rect: element.getBoundingClientRect(), role: roleOf(element) })) : previous);
        drain();
      });
    };
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const changed = () => { if (media?.matches) disable(); };
    const moved = (event: PointerEvent) => { pointer.current = { x: event.clientX, y: event.clientY }; };
    let orbitFrame = 0;
    let previous = 0;
    const tick = (now: number) => {
      if (now - previous >= 32 && enabledRef.current) {
        orbit.current = now / 1100;
        position(activeTargets.current);
        previous = now;
      }
      orbitFrame = requestAnimationFrame(tick);
    };
    orbitFrame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", moved, { passive: true });
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    media?.addEventListener?.("change", changed);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(orbitFrame);
      window.removeEventListener("pointermove", moved);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media?.removeEventListener?.("change", changed);
    };
  }, [position, drain, disable]);

  return <>
    <div ref={root} className="swarm-content" data-swarm-phase={boot ? "boot" : "ready"}>{children}</div>
    <noscript><style>{`.swarm-content[data-swarm-phase="boot"] > * { visibility: visible; }`}</style></noscript>
    <div className="swarm-layer" aria-hidden="true">
      {cursors.map((cursor, index) => <div key={SWARM_ROLES[index]} data-swarm-role={SWARM_ROLES[index]} className={`swarm-cursor swarm-builder-${index}`}
        style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`, transitionDuration: `${revealing.current ? 40 : travel}ms` }}>
        <svg width="14" height="18" viewBox="0 0 25 30" fill="none"><path d="M2 2L22 17L12 19L7 28L2 2Z" fill="currentColor" stroke="var(--swarm-cursor-edge)" strokeWidth="2" strokeLinejoin="round" /></svg>
      </div>)}
      {frames.map(({ rect, role }, index) => <div key={index} className={`swarm-wireframe swarm-builder-${role}`}
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