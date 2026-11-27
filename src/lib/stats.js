import { locale, t } from "../i18n";
// Streaks, PRs, next workout, formatting helpers.

export const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

export const startOfWeek = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
};

export function weekStreak(sessions) {
  if (!sessions.length) return 0;
  const weeks = new Set(sessions.map((s) => startOfWeek(s.startedAt).getTime()));
  let cur = startOfWeek(new Date());
  if (!weeks.has(cur.getTime())) cur.setDate(cur.getDate() - 7); // this week not started yet still keeps the streak
  let n = 0;
  while (weeks.has(cur.getTime())) {
    n++;
    cur.setDate(cur.getDate() - 7);
  }
  return n;
}

export const thisWeek = (sessions) => {
  const w = startOfWeek(new Date()).getTime();
  return sessions.filter((s) => startOfWeek(s.startedAt).getTime() === w);
};

export function nextDay(plan, sessions) {
  if (!plan?.days?.length) return null;
  const mine = sessions.filter((s) => s.planId === plan.id && !s.legacy);
  const last = mine[mine.length - 1];
  if (!last) {
    // continue from old-app history for the Classic plan
    const legacy = sessions.filter((s) => s.planId === plan.id);
    const l = legacy[legacy.length - 1];
    if (!l) return plan.days[0];
    const i = plan.days.findIndex((d) => d.id === l.dayId);
    return plan.days[(i + 1) % plan.days.length];
  }
  const i = plan.days.findIndex((d) => d.id === last.dayId);
  return plan.days[(i + 1) % plan.days.length];
}

export function lastFor(name, sessions, excludeId) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    if (s.id === excludeId) continue;
    const ex = s.exercises?.find((e) => e.name === name && e.sets?.length);
    if (ex) return { ...ex, date: s.startedAt };
  }
  return null;
}

export function personalRecords(sessions) {
  const best = {};
  sessions.forEach((s) =>
    (s.exercises || []).forEach((e) =>
      (e.sets || []).forEach((st) => {
        let val, label;
        if (e.kind === "reps" && e.weighted && st.weight > 0) {
          val = st.weight * 1000 + (st.reps || 0);
          label = `${st.weight} lb × ${st.reps}`;
        } else if (e.kind === "reps" && st.reps) {
          val = st.reps;
          label = `${st.reps} ${t("reps")}`;
        } else if (e.kind === "hold" && st.seconds) {
          val = st.seconds + (st.weight || 0) * 1000;
          label = st.weight ? `${st.weight} lb · ${st.seconds}s` : `${st.seconds}s`;
        } else if (e.kind === "cardio" && st.minutes) {
          val = st.distance ? st.distance * 1000 + st.minutes : st.minutes;
          label = st.distance ? `${st.distance} mi · ${st.minutes} min` : `${st.minutes} min`;
        } else return;
        if (!best[e.name] || val > best[e.name].val) best[e.name] = { val, label, date: s.startedAt, weighted: e.weighted };
      })
    )
  );
  return best;
}

export function sessionTotals(s) {
  let sets = 0,
    reps = 0,
    volume = 0;
  (s.exercises || []).forEach((e) =>
    (e.sets || []).forEach((st) => {
      sets++;
      reps += st.reps || 0;
      volume += (st.weight || 0) * (st.reps || 0);
    })
  );
  return { sets, reps, volume };
}

// rough calorie estimate from MET values and body weight
export function estimateKcal(s, weightKg) {
  if (!weightKg || !s.durationSec) return null;
  const types = new Set((s.exercises || []).map((e) => e.m));
  const met = types.has("cardio") && !types.has("weights") && !types.has("cali") ? 7.5 : types.has("cardio") ? 6.5 : 5;
  return Math.round(met * weightKg * (s.durationSec / 3600));
}

export const fmtDur = (sec) => {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const fmtDate = (d, opts = { weekday: "short", month: "short", day: "numeric" }) => new Date(d).toLocaleDateString(locale(), opts);

export function targetText(it) {
  const side = it.perSide ? ` / ${t("side")}` : "";
  if (it.kind === "reps") {
    const r = it.reps?.[0] === it.reps?.[1] ? it.reps[0] : `${it.reps[0]}–${it.reps[1]}`;
    return `${it.sets > 1 ? `${it.sets} × ` : ""}${r} ${t("reps")}${side}`;
  }
  if (it.kind === "hold") return `${it.sets > 1 ? `${it.sets} × ` : ""}${it.seconds}s${side}`;
  if (it.kind === "interval") return t("{n} rounds · {w}s on / {r}s off", { n: it.sets, w: it.work, r: it.rest });
  if (it.kind === "cardio") return `${it.minutes} min`;
  return "";
}

export function estMinutes(day) {
  let sec = 0;
  day.sections.forEach((s) =>
    s.items.forEach((it) => {
      const sides = it.perSide ? 2 : 1;
      if (it.kind === "reps") sec += it.sets * (40 * sides + (it.rest || 0)) - (it.rest || 0);
      else if (it.kind === "hold") sec += it.sets * (it.seconds * sides + (it.rest || 0)) - (it.rest || 0);
      else if (it.kind === "interval") sec += it.sets * (it.work + it.rest);
      else if (it.kind === "cardio") sec += it.minutes * 60;
      sec += 30; // transition
    })
  );
  return Math.max(10, Math.round(sec / 300) * 5);
}

export const cmToFtIn = (cm) => {
  const inches = Math.round(cm / 2.54);
  return [Math.floor(inches / 12), inches % 12];
};
