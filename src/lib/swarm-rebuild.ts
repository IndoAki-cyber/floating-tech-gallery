export const SWARM_BUILDERS = ["Alex", "Sam", "Dev", "UI", "Maya", "Kai"] as const;
export const SWARM_SPEEDS = [1, 2, 3] as const;
export type SwarmSpeed = (typeof SWARM_SPEEDS)[number];
export const WIREFRAME_DURATION_MS = 200;
export const SCROLL_WIREFRAME_DURATION_MS = 180;
export const CURSOR_TRAVEL_MS = 420;
export const REVEAL_DURATION_MS = 360;
export const SWARM_ROLES = ["boxes", "shapes", "images", "writing", "controls", "details"] as const;
export const LIVE_CURSOR_TRAVEL_MS = 220;
export const LIVE_REVEAL_DURATION_MS = 280;

export function swarmRole(tag: string, isCard = false): number {
  const name = tag.toLowerCase();
  if (name === "img") return 2;
  if (["h1", "h2", "h3", "p"].includes(name)) return 3;
  if (["button", "input", "form"].includes(name)) return 4;
  if (isCard || ["header", "section", "footer", "article"].includes(name)) return 0;
  if (name === "a") return 1;
  return 5;
}

export function buildDuration(speed: SwarmSpeed) {
  return CURSOR_TRAVEL_MS / speed + WIREFRAME_DURATION_MS + REVEAL_DURATION_MS / speed;
}