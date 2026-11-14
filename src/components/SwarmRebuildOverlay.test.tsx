import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SwarmRebuildOverlay } from "./SwarmRebuildOverlay";

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Swarm restoration", () => {
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
