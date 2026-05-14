function syncCalendarGuests(): void {
  syncOwnedEventsGuests();
}

function setupTrigger(): void {
  installFifteenMinuteTrigger(HANDLER_SYNC_CALENDAR);
}
