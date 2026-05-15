import { syncOwnedEventsGuests } from "./calendarSync";
import { HANDLER_SYNC_CALENDAR } from "./config";
import { installFifteenMinuteTrigger } from "./trigger";

export { applyCiScriptProperties } from "./ciScriptProperties";

export function syncCalendarGuests(): void {
  syncOwnedEventsGuests();
}

export function setupTrigger(): void {
  installFifteenMinuteTrigger(HANDLER_SYNC_CALENDAR);
}

/** CI 反映確認用（カレンダー非接触）。GAS エディタで `deploySmokeTest` を実行。 */
export function deploySmokeTest(): string {
  return "deploy-smoke-ok";
}
