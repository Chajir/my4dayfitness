import { lastFor } from "./stats";

export function initSets(it, sessions) {
  const last = lastFor(it.name, sessions);
  const ls = (k) => last?.sets?.[k] || last?.sets?.[last.sets.length - 1];
  const n = Math.max(1, it.sets || 1);
  if (it.kind === "reps")
    return Array.from({ length: n }, (_, k) => ({ reps: ls(k)?.reps || it.reps?.[1] || 10, weight: it.weighted ? ls(k)?.weight ?? "" : undefined, done: false }));
  if (it.kind === "hold") return Array.from({ length: n }, (_, k) => ({ seconds: it.seconds, weight: it.weighted ? ls(k)?.weight ?? "" : undefined, done: false }));
  if (it.kind === "interval") return Array.from({ length: n }, () => ({ done: false }));
  if (it.kind === "cardio") return [{ minutes: it.minutes, distance: "", done: false }];
  return [{ done: false }];
}

export function startWorkout(plan, day, sessions) {
  const items = day.sections.flatMap((s) => s.items.map((it) => ({ ...it, section: s.name })));
  return {
    id: `s${Date.now().toString(36)}`,
    planId: plan.id,
    dayId: day.id,
    label: day.label,
    title: day.title,
    startedAt: new Date().toISOString(),
    idx: 0,
    items,
    log: Object.fromEntries(items.map((it) => [it.uid, { sets: initSets(it, sessions), skipped: false }])),
  };
}

export function toSession(active) {
  const finishedAt = new Date();
  return {
    id: active.id,
    planId: active.planId,
    dayId: active.dayId,
    title: `${active.label} · ${active.title}`,
    startedAt: active.startedAt,
    finishedAt: finishedAt.toISOString(),
    durationSec: Math.round((finishedAt - new Date(active.startedAt)) / 1000),
    exercises: active.items
      .map((it) => {
        const lg = active.log[it.uid];
        const sets = (lg?.sets || [])
          .filter((s) => s.done)
          .map(({ done, ...rest }) => {
            const out = {};
            Object.entries(rest).forEach(([k, v]) => v !== "" && v !== undefined && (out[k] = Number(v)));
            return out;
          });
        return { name: it.name, kind: it.kind, weighted: !!it.weighted, m: it.m, section: it.section, skipped: !!lg?.skipped, sets };
      })
      .filter((e) => e.sets.length || e.skipped),
  };
}
