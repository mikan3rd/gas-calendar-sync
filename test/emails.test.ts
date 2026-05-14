import { describe, expect, test } from "bun:test";

/** Same rules as getTargetGuestEmails in config.ts — update both if changed. */
function parseGuestEmailsCsv(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

describe("parseGuestEmailsCsv", () => {
  test("trims, lowercases, drops empty segments", () => {
    expect(parseGuestEmailsCsv(" A@X.COM , , b@y.com ")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  test("empty string or commas-only yields empty array", () => {
    expect(parseGuestEmailsCsv("")).toEqual([]);
    expect(parseGuestEmailsCsv(" , , ")).toEqual([]);
  });
});

/** Mirrors numeric branch of getLookaheadDays in src/config.ts — update both if changed. */
function resolvedLookaheadDays(n: number): number {
  if (!Number.isFinite(n)) return 14;
  const days = Math.floor(n);
  return days > 0 ? days : 14;
}

describe("resolvedLookaheadDays", () => {
  test("fractional values that floor to 0 fall back to 14", () => {
    expect(resolvedLookaheadDays(0.5)).toBe(14);
  });

  test("positive integers are kept", () => {
    expect(resolvedLookaheadDays(7)).toBe(7);
  });

  test("non-finite or non-positive falls back to 14", () => {
    expect(resolvedLookaheadDays(0)).toBe(14);
    expect(resolvedLookaheadDays(NaN)).toBe(14);
  });
});
