export const SWARM_BUILDERS = ["Alex", "Sam", "Dev", "UI", "Maya", "Kai"] as const;
export const SWARM_SPEEDS = [1, 2, 3] as const;
export type SwarmSpeed = (typeof SWARM_SPEEDS)[number];
export const WIREFRAME_DURATION_MS = 200;
export const SCROLL_WIREFRAME_DURATION_MS = 180;
export const CURSOR_TRAVEL_MS = 420;
export const REVEAL_DURATION_MS = 360;

export function buildDuration(speed: SwarmSpeed) {
  return CURSOR_TRAVEL_MS / speed + WIREFRAME_DURATION_MS + REVEAL_DURATION_MS / speed;
}