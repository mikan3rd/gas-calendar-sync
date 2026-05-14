function syncOwnedEventsGuests(): void {
  const emails = getTargetGuestEmails();
  const lookaheadDays = getLookaheadDays();
  const cal = CalendarApp.getDefaultCalendar();
  const start = new Date();
  const end = new Date(start.getTime() + lookaheadDays * 24 * 60 * 60 * 1000);

  const events = cal.getEvents(start, end);
  let added = 0;
  let skippedNotOwned = 0;
  let skippedAlreadyGuest = 0;
  let addGuestErrors = 0;

  for (const event of events) {
    if (!event.isOwnedByMe()) {
      skippedNotOwned++;
      continue;
    }

    const guestEmails = new Set(
      event.getGuestList().map((g) => g.getEmail().toLowerCase()),
    );

    for (const email of emails) {
      if (guestEmails.has(email)) {
        skippedAlreadyGuest++;
        continue;
      }
      try {
        event.addGuest(email);
        guestEmails.add(email);
        added++;
      } catch (e) {
        addGuestErrors++;
        console.error(
          JSON.stringify({
            message: "addGuest failed",
            email,
            eventTitle: event.getTitle(),
            error: e instanceof Error ? e.message : String(e),
          }),
        );
      }
    }
  }

  console.log(
    JSON.stringify({
      message: "syncCalendarGuests done",
      window: { start: start.toISOString(), end: end.toISOString() },
      stats: {
        added,
        skippedNotOwned,
        skippedAlreadyGuest,
        addGuestErrors,
        events: events.length,
      },
    }),
  );
}
