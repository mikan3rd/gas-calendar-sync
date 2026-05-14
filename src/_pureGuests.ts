export const guests = {
  parseGuestEmailsCsv(raw: string): string[] {
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
  },

  resolvedLookaheadDaysFromNumber(n: number): number {
    if (!Number.isFinite(n)) return 14;
    const days = Math.floor(n);
    return days > 0 ? days : 14;
  },
};
