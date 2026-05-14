import { syncOwnedEventsGuests } from "./calendarSync";
import { HANDLER_SYNC_CALENDAR } from "./config";
import { installFifteenMinuteTrigger } from "./trigger";

export function syncCalendarGuests(): void {
  syncOwnedEventsGuests();
}

export function setupTrigger(): void {
  installFifteenMinuteTrigger(HANDLER_SYNC_CALENDAR);
}
