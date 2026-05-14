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
