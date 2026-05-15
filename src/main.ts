import { syncOwnedEventsGuests } from "./calendarSync";
import { HANDLER_SYNC_CALENDAR } from "./config";
import { installFifteenMinuteTrigger } from "./trigger";

export { applyCiScriptProperties } from "./ciScriptProperties";
export { deploySmokeTest } from "./deploySmoke";

export function syncCalendarGuests(): void {
  syncOwnedEventsGuests();
}

export function setupTrigger(): void {
  installFifteenMinuteTrigger(HANDLER_SYNC_CALENDAR);
}
