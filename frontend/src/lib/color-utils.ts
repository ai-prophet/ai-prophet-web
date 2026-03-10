/**
 * Probability parsing and heat-map color utilities.
 */

/** Parse a probability value from string or number, returning -1 if invalid. */
export function parseProb(p: string | number | undefined): number {
  if (typeof p === "number") return p >= 0 ? p : -1;
  if (typeof p === "string" && p.includes("%")) return parseFloat(p.replace("%", "")) / 100;
  if (typeof p === "string" && !isNaN(parseFloat(p))) { const n = parseFloat(p); return n >= 0 ? n : -1; }
  return -1;
}

/** Return a Tailwind heat-map background class for a probability value (0-1). */
export const heatColor = (v: number): string =>
  v === -1 ? "bg-overlay"
    : v <= 0.2 ? "bg-accent/10"
    : v <= 0.4 ? "bg-accent/20"
    : v <= 0.6 ? "bg-accent/30"
    : v <= 0.8 ? "bg-accent/45"
    : "bg-accent/60";
