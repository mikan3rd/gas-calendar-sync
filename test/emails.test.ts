import { describe, expect, test } from "bun:test";

import { guests } from "../src/_pureGuests";

describe("guests.parseGuestEmailsCsv", () => {
  test("trims, lowercases, drops empty segments", () => {
    expect(guests.parseGuestEmailsCsv(" A@X.COM , , b@y.com ")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  test("empty string or commas-only yields empty array", () => {
    expect(guests.parseGuestEmailsCsv("")).toEqual([]);
    expect(guests.parseGuestEmailsCsv(" , , ")).toEqual([]);
  });
});

describe("guests.resolvedLookaheadDaysFromNumber", () => {
  test("fractional values that floor to 0 fall back to 14", () => {
    expect(guests.resolvedLookaheadDaysFromNumber(0.5)).toBe(14);
  });

  test("positive integers are kept", () => {
    expect(guests.resolvedLookaheadDaysFromNumber(7)).toBe(7);
  });

  test("non-finite or non-positive falls back to 14", () => {
    expect(guests.resolvedLookaheadDaysFromNumber(0)).toBe(14);
    expect(guests.resolvedLookaheadDaysFromNumber(-1)).toBe(14);
    expect(guests.resolvedLookaheadDaysFromNumber(Infinity)).toBe(14);
    expect(guests.resolvedLookaheadDaysFromNumber(-Infinity)).toBe(14);
    expect(guests.resolvedLookaheadDaysFromNumber(NaN)).toBe(14);
  });
});
