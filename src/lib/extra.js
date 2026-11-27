// Extra sessions: a short cardio, core or stretch workout on top of the plan
// (e.g. weights in the morning, cardio in the afternoon). They count in history and the calendar,
// but never move the plan to its next day.
import { LIBRARY, byId } from "../data/library";
import { constraints, isAllowed, makeItem, cardioItem, pickCardio } from "../data/generator";
import { whereInfo } from "./where";

export const EXTRA_KINDS = [
  { id: "steady", title: "Cardio · Steady", text: "Easy, steady pace" },
  { id: "intervals", title: "Cardio · Intervals", text: "Short hard efforts" },
  { id: "core", title: "Core", text: "Abs and trunk" },
  { id: "stretch", title: "Stretch & Mobility", text: "Loosen up and recover" },
];
export const EXTRA_MINUTES = [15, 20, 30];

let n = 0;
const uid = () => `x${Date.now().toString(36)}${(n++).toString(36)}`;
const fresh = (it) => ({ ...it, uid: uid() });

export function buildExtra(kind, minutes, profile, where, salt = 0) {
  const info = { ...whereInfo(profile, where), goal: profile.goal || "health", level: profile.level ?? 1 };
  const c = constraints(info);
  const ok = (e) => isAllowed(e, c) && !/band|ball|foam/i.test(e.name);
  const mob = (role, count, off = 0) => {
    const list = LIBRARY.filter((e) => e.m === "mobility" && e.role === role && e.kind !== "cardio" && ok(e));
    return Array.from({ length: Math.min(count, list.length) }, (_, k) => list[(salt + off + k) % list.length]);
  };
  const warm = () => ({ name: "Warm-Up", items: [fresh(makeItem(byId["easy-cardio"], info, c, { role: "warmup" }))].map((it) => ({ ...it, minutes: 3 })) });
  const cool = (k) => ({ name: "Cool Down", items: mob("cooldown", k).map((e) => fresh(makeItem(e, info, c, { role: "cooldown" }))) });
  let sections;
  if (kind === "steady" || kind === "intervals") {
    const mode = kind === "steady" ? "steady" : "interval";
    const ex = pickCardio(mode, c, new Set(), salt);
    const main = fresh(cardioItem(ex, mode, info, c, mode === "steady" ? Math.max(8, minutes - 6) : undefined));
    if (mode === "interval") main.sets = Math.max(4, Math.round(((minutes - 6) * 60) / ((main.work || 30) + (main.rest || 30))));
    sections = [warm(), { name: mode === "steady" ? "Steady Cardio" : "Intervals", items: [main] }, cool(1)];
  } else if (kind === "core") {
    const cores = LIBRARY.filter((e) => e.p === "core" && e.m === "cali" && ok(e) && e.lv[0] <= c.level);
    const count = minutes >= 30 ? 5 : minutes >= 20 ? 4 : 3;
    const picks = Array.from({ length: Math.min(count, cores.length) }, (_, k) => cores[(salt + k) % cores.length]);
    sections = [
      { name: "Warm-Up", items: mob("warmup", 2).map((e) => fresh(makeItem(e, info, c, { role: "warmup" }))) },
      { name: "Core", items: picks.map((e) => fresh(makeItem(e, info, c, {}))) },
      cool(1),
    ];
  } else {
    const count = minutes >= 30 ? 10 : minutes >= 20 ? 7 : 5;
    const half = Math.ceil(count / 2);
    sections = [
      { name: "Warm-Up", items: mob("warmup", half).map((e) => fresh(makeItem(e, info, c, { role: "warmup" }))) },
      { name: "Cool Down", items: mob("cooldown", count - half, 3).map((e) => fresh(makeItem(e, info, c, { role: "cooldown" }))) },
    ];
  }
  const k = EXTRA_KINDS.find((x) => x.id === kind);
  return { id: `extra-${kind}`, label: "Extra", title: k.title, tag: k.title, sections: sections.filter((s) => s.items.length), ...(where && where !== "gym" ? { where } : {}) };
}
