// Builds the small usage summary the owner dashboard reads (stats/{uid}).
// It deliberately contains NO health info: no pain areas, surgery, health answers,
// age, height or weight. Those stay in the user's private document.
import { APP_VERSION } from "../config";
import { startOfWeek, dayKey } from "./stats";

export function device() {
  const ua = navigator.userAgent || "";
  const kind = /iPhone|iPod/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : "Computer";
  const installed = !!(window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone);
  return { kind, installed };
}

export function buildUsage(user, data) {
  const p = data.profile || {};
  const real = (data.sessions || []).filter((s) => !s.legacy);
  const weekly = {};
  const cutoff = startOfWeek(new Date());
  cutoff.setDate(cutoff.getDate() - 7 * 25);
  let totalMinutes = 0;
  let sets = 0;
  real.forEach((s) => {
    const min = Math.round((s.durationSec || 0) / 60);
    totalMinutes += min;
    (s.exercises || []).forEach((e) => (sets += (e.sets || []).length));
    const w = startOfWeek(s.startedAt);
    if (w >= cutoff) {
      const k = dayKey(w);
      weekly[k] = weekly[k] || { w: 0, min: 0 };
      weekly[k].w += 1;
      weekly[k].min += min;
    }
  });
  const d = device();
  const classic = p.plan?.source === "classic";
  return {
    account: user.email || "",
    name: p.name || "",
    joinedAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime).toISOString() : null,
    lastActive: new Date().toISOString(),
    appVersion: APP_VERSION,
    device: d.kind,
    installed: d.installed,
    hasPlan: !!p.plan,
    planName: p.plan?.name || "",
    planSource: p.plan?.source || "",
    styles: classic ? [] : Object.entries(p.styles || {}).filter(([, v]) => v).map(([k]) => k),
    goal: classic ? "" : p.goal || "",
    level: classic ? null : (p.level ?? null),
    daysPerWeek: p.plan?.days?.length || 0,
    workouts: real.length,
    importedWorkouts: (data.sessions || []).length - real.length,
    totalMinutes,
    sets,
    lastWorkoutAt: real.length ? real.reduce((a, s) => (new Date(s.startedAt) > new Date(a) ? s.startedAt : a), real[0].startedAt) : null,
    weekly,
  };
}
