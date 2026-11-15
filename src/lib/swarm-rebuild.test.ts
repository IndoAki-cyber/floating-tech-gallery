import { describe, expect, it } from "vitest";
import { SWARM_ROLES, swarmRole, SWARM_SPEEDS, WIREFRAME_DURATION_MS, SCROLL_WIREFRAME_DURATION_MS, buildDuration } from "./swarm-rebuild";

describe("Swarm rebuild rules", () => {
  it("assigns six distinct roles", () => {
    expect(SWARM_ROLES).toEqual(["boxes", "shapes", "images", "writing", "controls", "details"]);
  });
  it("assigns images exclusively to the image builder", () => { expect(swarmRole("IMG")).toBe(2); });
  it("assigns headings and paragraphs to the writing builder", () => {
    for (const tag of ["h1", "h2", "h3", "p"]) expect(swarmRole(tag)).toBe(3);
  });
  it("assigns containers and cards to the box builder", () => {
    expect(swarmRole("section")).toBe(0);
    expect(swarmRole("div", true)).toBe(0);
  });
  it("assigns links, controls, and details to separate builders", () => {
    expect(swarmRole("a")).toBe(1);
    expect(swarmRole("button")).toBe(4);
    expect(swarmRole("span")).toBe(5);
  });
  it("flashes wireframes for 200 milliseconds", () => {
    expect(WIREFRAME_DURATION_MS).toBe(200);
  });
  it("flashes scroll-triggered wireframes for 180 milliseconds", () => {
    expect(SCROLL_WIREFRAME_DURATION_MS).toBe(180);
  });
  it("supports 1x, 2x, and 3x speeds without shortening the wireframe flash", () => {
    expect(SWARM_SPEEDS).toEqual([1, 2, 3]);
    expect(buildDuration(1)).toBe(980);
    expect(buildDuration(2)).toBe(590);
    expect(buildDuration(3)).toBe(460);
  });
});