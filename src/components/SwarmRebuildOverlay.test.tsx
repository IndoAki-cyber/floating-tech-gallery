import { act, fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SwarmRebuildOverlay } from "./SwarmRebuildOverlay";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Swarm restoration", () => {
  it("builds visible elements once, flashes for 180ms, and waits for below-fold elements", async () => {
    vi.useFakeTimers();
    let notify: IntersectionObserverCallback = () => {};
    const unobserve = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe() {} unobserve = unobserve; disconnect() {}
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const top = this.id === "below" ? 2000 : 20;
      return { x: 0, y: top, top, left: 0, right: 200, bottom: top + 100, width: 200, height: 100, toJSON: () => ({}) };
    });
    const { container } = render(<SwarmRebuildOverlay><h1 id="visible">Product</h1><section id="below">More products</section></SwarmRebuildOverlay>);
    const visible = container.querySelector<HTMLElement>("#visible");
    const below = container.querySelector<HTMLElement>("#below");
    if (!visible || !below) throw new Error("Missing targets");
    expect(container.querySelectorAll(".swarm-cursor")).toHaveLength(6);
    expect(below.classList.contains("swarm-pending")).toBe(true);
    const entry: IntersectionObserverEntry = { isIntersecting: true, target: visible, boundingClientRect: visible.getBoundingClientRect(), intersectionRect: visible.getBoundingClientRect(), intersectionRatio: 1, rootBounds: null, time: 0 };
    act(() => notify([entry], {} as IntersectionObserver));
    await act(async () => { await vi.advanceTimersByTimeAsync(460); });
    expect(container.querySelectorAll(".swarm-wireframe")).toHaveLength(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(179); });
    expect(visible.dataset['swarmBuilt']).toBeUndefined();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(visible.dataset['swarmBuilt']).toBe("true");
    expect(visible.classList.contains("swarm-pending")).toBe(false);
    expect(unobserve).toHaveBeenCalledWith(visible);
    expect(below.classList.contains("swarm-pending")).toBe(true);
    act(() => notify([entry], {} as IntersectionObserver));
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(visible.classList.contains("swarm-pending")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Live Build: ON" }));
    expect(below.classList.contains("swarm-pending")).toBe(false);
  });
  it("reveals everything immediately when disabled and restores clickable controls", () => {
    vi.stubGlobal("IntersectionObserver", class {
      observe() {} unobserve() {} disconnect() {}
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 100, width: 200, height: 100, toJSON: () => ({}),
    });
    const click = vi.fn();
    const { container } = render(<SwarmRebuildOverlay><section><h1>Product</h1><button onClick={click}>Buy</button></section></SwarmRebuildOverlay>);
    expect(container.querySelectorAll(".swarm-pending").length).toBe(3);
    fireEvent.click(screen.getByRole("button", { name: "Live Build: ON" }));
    expect(container.querySelectorAll(".swarm-pending").length).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "Buy" }));
    expect(click).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Replay Build" }));
    expect(container.querySelectorAll(".swarm-pending").length).toBe(3);
    fireEvent.click(screen.getByRole("button", { name: "Live Build: ON" }));
    expect(container.querySelectorAll(".swarm-pending").length).toBe(0);
  });
  it("leaves the page visible if IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<SwarmRebuildOverlay><section><h1>Product</h1></section></SwarmRebuildOverlay>);
    expect(container.querySelectorAll(".swarm-pending").length).toBe(0);
    expect(screen.getByRole("button", { name: "Live Build: OFF" })).toBeTruthy();
  });
});
