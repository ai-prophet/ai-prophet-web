import { describe, it, expect } from "vitest";
import { parseProb, heatColor } from "../color-utils";

describe("parseProb", () => {
  it("returns number directly if valid", () => {
    expect(parseProb(0.5)).toBe(0.5);
    expect(parseProb(0)).toBe(0);
    expect(parseProb(1)).toBe(1);
  });

  it("returns -1 for negative numbers", () => {
    expect(parseProb(-1)).toBe(-1);
    expect(parseProb(-0.5)).toBe(-1);
  });

  it("parses percentage strings", () => {
    expect(parseProb("50%")).toBe(0.5);
    expect(parseProb("100%")).toBe(1);
    expect(parseProb("0%")).toBe(0);
    expect(parseProb("33.3%")).toBeCloseTo(0.333);
  });

  it("parses plain number strings", () => {
    expect(parseProb("0.75")).toBe(0.75);
    expect(parseProb("0")).toBe(0);
  });

  it("returns -1 for undefined/invalid", () => {
    expect(parseProb(undefined)).toBe(-1);
    expect(parseProb("abc")).toBe(-1);
  });
});

describe("heatColor", () => {
  it("returns overlay for invalid values", () => {
    expect(heatColor(-1)).toBe("bg-overlay");
  });

  it("returns appropriate color classes for probability ranges", () => {
    expect(heatColor(0.1)).toBe("bg-accent/10");
    expect(heatColor(0.3)).toBe("bg-accent/20");
    expect(heatColor(0.5)).toBe("bg-accent/30");
    expect(heatColor(0.7)).toBe("bg-accent/45");
    expect(heatColor(0.9)).toBe("bg-accent/60");
  });

  it("handles boundary values", () => {
    expect(heatColor(0.2)).toBe("bg-accent/10");
    expect(heatColor(0.4)).toBe("bg-accent/20");
    expect(heatColor(0.6)).toBe("bg-accent/30");
    expect(heatColor(0.8)).toBe("bg-accent/45");
  });
});
