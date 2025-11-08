import { entities } from "./entities";

export type BubbleLink = {
  source: string;
  target: string;
  weight: number; // 0 - 1 intensity
};

export const bubbleLinks: BubbleLink[] = [
  { source: "seed-oils", target: "ozempic-style", weight: 0.72 },
  { source: "seed-oils", target: "vibe-shift", weight: 0.41 },
  { source: "seed-oils", target: "civic-ai", weight: 0.22 },
  { source: "ai-doom", target: "civic-ai", weight: 0.68 },
  { source: "ai-doom", target: "anora", weight: 0.36 },
  { source: "ai-doom", target: "vibe-shift", weight: 0.31 },
  { source: "vibe-shift", target: "analog-film", weight: 0.77 },
  { source: "analog-film", target: "cottagecore", weight: 0.52 },
  { source: "analog-film", target: "ozempic-style", weight: 0.25 },
  { source: "cottagecore", target: "seed-oils", weight: 0.35 },
  { source: "ozempic-style", target: "civic-ai", weight: 0.18 },
  { source: "anora", target: "vibe-shift", weight: 0.43 },
];

export const totalEntities = entities.length;
