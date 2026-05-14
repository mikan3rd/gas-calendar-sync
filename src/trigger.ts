/** Account/plan may disallow 15m; see ClockTriggerBuilder. */
export function installFifteenMinuteTrigger(handlerFunction: string): void {
  const triggers = ScriptApp.getProjectTriggers();
  for (const t of triggers) {
    if (t.getHandlerFunction() === handlerFunction) {
      ScriptApp.deleteTrigger(t);
    }
  }

  ScriptApp.newTrigger(handlerFunction).timeBased().everyMinutes(15).create();
}
