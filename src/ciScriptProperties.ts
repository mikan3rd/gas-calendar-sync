import { PROP_GUEST_EMAILS, PROP_LOOKAHEAD_DAYS } from "./config";

/** Invoked from CI via Apps Script API `scripts.run` (primitive args only). */
export function applyCiScriptProperties(
  guestEmailsCsv: string,
  lookaheadDaysCsv: string,
): void {
  const guest = String(guestEmailsCsv ?? "").trim();
  if (!guest) {
    throw new Error("applyCiScriptProperties: guestEmailsCsv is empty");
  }
  const props = PropertiesService.getScriptProperties();
  props.setProperty(PROP_GUEST_EMAILS, guest);
  const lookahead = String(lookaheadDaysCsv ?? "").trim();
  if (lookahead.length > 0) {
    props.setProperty(PROP_LOOKAHEAD_DAYS, lookahead);
  } else {
    props.deleteProperty(PROP_LOOKAHEAD_DAYS);
  }
}
