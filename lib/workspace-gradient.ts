const GRADIENT_PAIRS: [string, string][] = [
  ["#BED3CC", "#7FA394"], // sea -> sea-deep
  ["#EFC8C8", "#C98D8D"], // coral -> coral-deep
  ["#A08D8D", "#5A4A4A"], // umber-light -> umber-deep
  ["#BED3CC", "#C98D8D"], // sea -> coral-deep
  ["#EFC8C8", "#7FA394"], // coral -> sea-deep
];

function hashSeed(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Deterministic abstract gradient for the Workspace card — same seed always yields the same look. */
export function workspaceGradient(seed: string) {
  const hash = hashSeed(seed || "liyo");
  const [from, to] = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const angle = hash % 360;
  return { from, to, angle, backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` };
}
