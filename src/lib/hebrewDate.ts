// Hebrew + Gregorian date display helpers
import { HDate, HebrewCalendar, Locale } from "@hebcal/core";

const GREG_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

// Date in numbers + Hebrew month name (e.g. "30 אפריל 2026")
export const formatGregorian = (d: Date) =>
  `${d.getDate()} ${GREG_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const formatTime = (d: Date) =>
  d.toLocaleTimeString("he-IL", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

// Hebrew date in letters only (גימטריה) — e.g. "י״ג בְּאִיָּר תשפ״ו"
export const formatHebrew = (d: Date): string => {
  try {
    const hd = new HDate(d);
    return hd.renderGematriya();
  } catch {
    return "";
  }
};

export const formatWeekday = (d: Date) => `יום ${WEEKDAYS[d.getDay()]}`;

// Parashat hashavua in Hebrew — finds upcoming/current Saturday's parasha,
// falling back forward up to 6 weeks when current week has none (חגים).
export const formatParasha = (d: Date): string => {
  try {
    const sat = new Date(d);
    const diff = (6 - sat.getDay() + 7) % 7;
    sat.setDate(sat.getDate() + diff);

    for (let i = 0; i < 6; i++) {
      const probe = new Date(sat);
      probe.setDate(probe.getDate() + i * 7);
      const events = HebrewCalendar.calendar({
        start: new HDate(probe),
        end: new HDate(probe),
        sedrot: true,
        il: true,
        locale: "he",
      });
      const parsha = events.find((e) => e.getDesc().startsWith("Parashat"));
      if (parsha) {
        // Try to render the event itself in Hebrew first (handles all parshiot reliably)
        try {
          const heRendered = (parsha as any).render?.("he");
          if (heRendered && /[֐-׿]/.test(heRendered)) return heRendered;
        } catch { /* ignore */ }
        const englishName = parsha.getDesc().replace("Parashat ", "");
        const translated = Locale.gettext(englishName, "he");
        if (translated && /[֐-׿]/.test(translated)) return `פרשת ${translated}`;
        return `פרשת ${englishName}`;
      }
    }
    return "";
  } catch {
    return "";
  }
};
