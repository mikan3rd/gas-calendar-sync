import { guests } from "./_pureGuests";

export const PROP_GUEST_EMAILS = "SYNC_GUEST_EMAILS";
export const PROP_LOOKAHEAD_DAYS = "SYNC_LOOKAHEAD_DAYS";

/** Must match the global function name passed to installFifteenMinuteTrigger. */
export const HANDLER_SYNC_CALENDAR = "syncCalendarGuests";

export function getTargetGuestEmails(): string[] {
  const raw =
    PropertiesService.getScriptProperties().getProperty(PROP_GUEST_EMAILS);
  if (!raw) {
    throw new Error(
      `Script Property "${PROP_GUEST_EMAILS}" is not set (comma-separated emails).`,
    );
  }
  const emails = guests.parseGuestEmailsCsv(raw);
  if (emails.length === 0) {
    throw new Error(
      `Script Property "${PROP_GUEST_EMAILS}" has no valid emails (empty or commas only).`,
    );
  }
  return emails;
}

export function getLookaheadDays(): number {
  const raw =
    PropertiesService.getScriptProperties().getProperty(PROP_LOOKAHEAD_DAYS);
  if (!raw) return 14;
  return guests.resolvedLookaheadDaysFromNumber(Number(raw));
}
