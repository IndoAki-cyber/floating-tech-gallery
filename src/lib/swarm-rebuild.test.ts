import { describe, expect, it } from "vitest";
import { SWARM_BUILDERS, SWARM_SPEEDS, WIREFRAME_DURATION_MS, buildDuration } from "./swarm-rebuild";

describe("Swarm rebuild rules", () => {
  it("provides six named cursors", () => {
    expect(SWARM_BUILDERS).toEqual(["Alex", "Sam", "Dev", "UI", "Maya", "Kai"]);
  });
  it("flashes wireframes for 200 milliseconds", () => {
    expect(WIREFRAME_DURATION_MS).toBe(200);
  });
  it("supports 1x, 2x, and 3x speeds without shortening the wireframe flash", () => {
    expect(SWARM_SPEEDS).toEqual([1, 2, 3]);
    expect(buildDuration(1)).toBe(980);
    expect(buildDuration(2)).toBe(590);
    expect(buildDuration(3)).toBe(460);
  });
});