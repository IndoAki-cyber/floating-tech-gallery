import { type ReactNode } from "react";
import { ScrollSwarmBuilder } from "@/components/ScrollSwarmBuilder";

// One shared overlay handles replay and live scroll building without duplicating cursors.
export function SwarmRebuildOverlay({ children }: { children: ReactNode }) {
  return <ScrollSwarmBuilder>{children}</ScrollSwarmBuilder>;
}
