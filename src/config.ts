const PROP_GUEST_EMAILS = "SYNC_GUEST_EMAILS";
const PROP_LOOKAHEAD_DAYS = "SYNC_LOOKAHEAD_DAYS";

/** Must match the trigger handler / entry function name (single place to rename). */
const HANDLER_SYNC_CALENDAR = "syncCalendarGuests";

function getTargetGuestEmails(): string[] {
  const raw =
    PropertiesService.getScriptProperties().getProperty(PROP_GUEST_EMAILS);
  if (!raw) {
    throw new Error(
      `Script Property "${PROP_GUEST_EMAILS}" is not set (comma-separated emails).`,
    );
  }
  // Keep normalization in sync with parseGuestEmailsCsv in test/emails.test.ts
  const emails = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
  if (emails.length === 0) {
    throw new Error(
      `Script Property "${PROP_GUEST_EMAILS}" has no valid emails (empty or commas only).`,
    );
  }
  return emails;
}

function getLookaheadDays(): number {
  const raw =
    PropertiesService.getScriptProperties().getProperty(PROP_LOOKAHEAD_DAYS);
  if (!raw) return 14;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 14;
}
