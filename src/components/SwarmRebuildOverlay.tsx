import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SWARM_BUILDERS, SWARM_SPEEDS, CURSOR_TRAVEL_MS,
  WIREFRAME_DURATION_MS, REVEAL_DURATION_MS, type SwarmSpeed,
} from "@/lib/swarm-rebuild";

type Cursor = { x: number; y: number; visible: boolean };
type Frame = { element: HTMLElement; builder: number };
const SELECTOR = "header, section, footer, article, h1, h2, h3, p, button, a, img, input, form, [data-swarm-item]";

export function SwarmRebuildOverlay({ children }: { children: ReactNode }) {
  const content = useRef<HTMLDivElement>(null);
  const targets = useRef<HTMLElement[]>([]);
  const animations = useRef<Animation[]>([]);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveWait = useRef<(() => void) | null>(null);
  const speedRef = useRef<SwarmSpeed>(1);
  const [speed, setSpeed] = useState<SwarmSpeed>(1);
  const [phase, setPhase] = useState<"boot" | "building" | "ready">("boot");
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [frameRects, setFrameRects] = useState<DOMRect[]>([]);
  const [travel, setTravel] = useState(CURSOR_TRAVEL_MS);

  const restore = useCallback(() => {
    generation.current += 1;
    if (timer.current !== null) clearTimeout(timer.current);
    resolveWait.current?.();
    resolveWait.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    targets.current.forEach((element) => element.classList.remove("swarm-pending"));
    content.current?.removeAttribute("inert");
    content.current?.removeAttribute("aria-busy");
    content.current?.setAttribute("data-swarm-phase", "ready");
  }, []);

  const finish = useCallback(() => {
    restore();
    setPhase("ready");
    setFrames([]);
    setCursors([]);
  }, [restore]);

  const replay = useCallback(() => {
    restore();
    const root = content.current;
    if (!root) return;
    // Respect the device's accessibility setting, including manual replays.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    const run = generation.current;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    targets.current = elements;
    if (elements.length === 0) { finish(); return; }
    elements.forEach((element) => element.classList.add("swarm-pending"));
    root.setAttribute("inert", "");
    root.setAttribute("aria-busy", "true");
    root.setAttribute("data-swarm-phase", "building");
    setPhase("building");
    setFrames([]);
    setCursors(SWARM_BUILDERS.map((_, index) => ({
      x: 24 + index * Math.max(40, (window.innerWidth - 140) / 6),
      y: 90 + (index % 3) * 52,
      visible: true,
    })));

    const wait = (ms: number) => new Promise<void>((resolve) => {
      resolveWait.current = resolve;
      timer.current = setTimeout(() => {
        resolveWait.current = null;
        resolve();
      }, ms);
    });

    void (async () => {
      // Allow the initial cursor positions and hidden targets to paint first.
      await wait(50);
      for (let offset = 0; offset < elements.length; offset += SWARM_BUILDERS.length) {
        if (generation.current !== run) return;
        const batch = elements.slice(offset, offset + SWARM_BUILDERS.length);
        const travelTime = CURSOR_TRAVEL_MS / speedRef.current;
        setTravel(travelTime);
        setCursors(SWARM_BUILDERS.map((_, index) => {
          const element = batch[index];
          if (!element) return { x: 0, y: 0, visible: false };
          const rect = element.getBoundingClientRect();
          return {
            x: Math.max(8, Math.min(window.innerWidth - 82, rect.left + Math.min(rect.width / 2, 64))),
            y: rect.top + Math.min(rect.height / 2, 44),
            visible: true,
          };
        }));
        await wait(travelTime);
        if (generation.current !== run) return;
        setFrames(batch.map((element, builder) => ({ element, builder })));
        setFrameRects(batch.map((element) => element.getBoundingClientRect()));
        await wait(WIREFRAME_DURATION_MS);
        if (generation.current !== run) return;
        setFrames([]);
        const revealTime = REVEAL_DURATION_MS / speedRef.current;
        batch.forEach((element) => {
          element.classList.remove("swarm-pending");
          if (typeof element.animate === "function") {
            const transform = getComputedStyle(element).transform;
            const base = transform === "none" ? "" : transform;
            const animation = element.animate([
              { opacity: 0, transform: `${base} scale(0.97)` },
              { opacity: 1, transform: `${base} scale(1)` },
            ], { duration: revealTime, easing: "cubic-bezier(.2,.7,.2,1)" });
            animations.current.push(animation);
          }
        });
        await wait(revealTime);
      }
      if (generation.current === run) finish();
    })();
  }, [finish, restore]);

  useEffect(() => {
    replay();
    return restore;
  }, [replay, restore]);

  useEffect(() => {
    if (!frames.length) return;
    const update = () => setFrameRects(frames.map(({ element }) => element.getBoundingClientRect()));
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [frames]);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const changed = () => { if (media?.matches) finish(); };
    media?.addEventListener?.("change", changed);
    return () => media?.removeEventListener?.("change", changed);
  }, [finish]);

  return (
    <>
      <div ref={content} className="swarm-content" data-swarm-phase={phase}
        onClickCapture={(event) => { if (phase !== "ready") { event.preventDefault(); event.stopPropagation(); } }}>
        {children}
      </div>
      <noscript><style>{`.swarm-content[data-swarm-phase="boot"] > * { visibility: visible; }`}</style></noscript>
      <div className="swarm-layer" aria-hidden="true">
        {cursors.map((cursor, index) => (
          <div key={SWARM_BUILDERS[index]} className={`swarm-cursor swarm-builder-${index}`}
            style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`, opacity: cursor.visible ? 1 : 0, transitionDuration: `${travel}ms` }}>
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none">
              <path d="M2 2L22 17L12 19L7 28L2 2Z" fill="currentColor" stroke="var(--swarm-cursor-edge)" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <span className="swarm-name">{SWARM_BUILDERS[index]}</span>
          </div>
        ))}
        {frames.map((frame, index) => {
          const rect = frameRects[index];
          return rect ? <div key={index} className={`swarm-wireframe swarm-builder-${frame.builder}`}
            style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }} /> : null;
        })}
      </div>
      <div className="swarm-controls" role="group" aria-label="Swarm rebuild controls">
        <Button variant="ghost" size="sm" className="swarm-control" onClick={replay} aria-label="Replay Build" title="Replay Build">
          <RotateCcw aria-hidden="true" /><span>Replay</span>
        </Button>
        <span className="swarm-control-divider" />
        {SWARM_SPEEDS.map((value) => (
          <Button key={value} variant={speed === value ? "secondary" : "ghost"} size="sm" className="swarm-speed"
            aria-label={`${value}x build speed`} aria-pressed={speed === value}
            onClick={() => { speedRef.current = value; setSpeed(value); }}>{value}x</Button>
        ))}
        {phase !== "ready" && <>
          <span className="swarm-control-divider" />
          <Button variant="ghost" size="sm" className="swarm-control" onClick={finish} aria-label="Skip build animation">
            <span>Skip</span><SkipForward aria-hidden="true" />
          </Button>
        </>}
      </div>
    </>
  );
}