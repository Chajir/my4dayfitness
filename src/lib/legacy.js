// Imports workouts logged in the old version of the app (Firestore "history/{uid}").
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

// old timestamps look like "11/17/2026, 2:30:00 PM"
function parseOld(ts) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i.exec(ts || "");
  if (!m) {
    const d = new Date(ts);
    return isNaN(d) ? null : d;
  }
  let h = Number(m[4]);
  if (m[7]) {
    const pm = m[7].toUpperCase() === "PM";
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]), h, Number(m[5]), Number(m[6] || 0));
}

export async function importLegacy(uid) {
  const snap = await getDoc(doc(db, "history", uid));
  if (!snap.exists()) return [];
  const out = [];
  Object.entries(snap.data()).forEach(([key, list]) => {
    if (!Array.isArray(list)) return;
    list.forEach((entry, i) => {
      const date = parseOld(entry.timestamp);
      if (!date) return;
      let parsed = {};
      try {
        parsed = JSON.parse(entry.data || "{}");
      } catch {}
      const exercises = Object.entries(parsed).map(([name, r]) => {
        const weight = Number(r?.weight) || 0;
        const reps = Array.isArray(r?.reps) ? r.reps.map(Number).filter(Boolean) : Number(r?.reps) ? [Number(r.reps)] : [];
        return { name, kind: "reps", weighted: weight > 0, sets: reps.length ? reps.map((x) => ({ reps: x, weight })) : weight ? [{ reps: 0, weight }] : [] };
      });
      const dayNum = /^Day (\d)$/.exec(key)?.[1];
      out.push({
        id: `legacy-${key}-${i}-${date.getTime()}`,
        planId: dayNum ? "equinox-4day" : "legacy",
        dayId: dayNum ? `d${dayNum}` : key,
        title: key === "CrossFit" ? "CrossFit WOD" : dayNum ? `Day ${dayNum}` : key,
        startedAt: date.toISOString(),
        finishedAt: date.toISOString(),
        durationSec: 0,
        legacy: true,
        exercises,
      });
    });
  });
  return out;
}
