// The GHL calendar calls are booked on ("Schedule an Appointment").
// Shared by the server-side booking API (src/lib/ghl.ts) and the embedded
// booking widget fallback, so both always point at the same calendar.
// Meeting length and slot spacing come from the calendar's own settings in
// GHL (Calendars → Calendar Settings), not from this site.
export const GHL_CALENDAR_ID = "oGxNpmrjXCXrlbFR8mDP";

export const GHL_CALENDAR_WIDGET_URL = `https://api.leadconnectorhq.com/widget/booking/${GHL_CALENDAR_ID}`;
