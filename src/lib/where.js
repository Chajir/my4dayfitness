// "Where are you training today?"
// The plan never changes. For one workout, exercises that need equipment you don't have
// are swapped for ones that do the same job (same movement / same kind of warm-up or cardio).
// The day in the plan rotation stays the same, and records are kept per exercise name.
import { LIBRARY, byId } from "../data/library";
import { constraints, isAllowed, swapItem, makeItem } from "../data/generator";

export const WHERE = [
  { id: "gym", label: "Gym" },
  { id: "home", label: "Home with dumbbells" },
  { id: "none", label: "No equipment" },
];
const RANK = { none: 0, home: 1, gym: 2 };

const byName = Object.fromEntries(LIBRARY.map((e) => [e.name, e]));
// Classic-program moves that aren't in the exercise database: what they need and what they do.
const EXTRA = {
  "Stability Ball Shoulder W's": { m: "mobility", role: "warmup", focus: "upper", eq: ["gym"] },
  "Stability Ball Shoulder L's": { m: "mobility", role: "warmup", focus: "upper", eq: ["gym"] },
  "Back Lying Mini Band Hip Internal Rotation": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Side Lying Mini Band Hip External Rotation": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Mini Band Hip Flexion": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Mini Band Hip Extension": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Foam Roll Hip Flexors": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Treadmill Butt Kick": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Treadmill Lateral Shuffle": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Treadmill High Knee Run": { m: "mobility", role: "warmup", focus: "lower", eq: ["gym"] },
  "Tall Kneel Kettlebell Halo": { m: "mobility", role: "warmup", focus: "upper", eq: ["db"] },
  "Perpendicular Med Ball Hip Toss": { m: "weights", p: "power", eq: ["gym"], ballistic: true },
};

const lookup = (it) => (it.exId && byId[it.exId]) || byName[it.name] || (EXTRA[it.name] && { id: null, name: it.name, ...EXTRA[it.name] }) || null;

// The equipment a plan was built for.
export function planBase(profile) {
  const plan = profile?.plan;
  if (!plan) return "gym";
  if (plan.source === "classic") return "gym";
  return profile.equipment || "gym";
}

// indoor-friendly cardio first (a home workout shouldn't send you outside unless nothing else fits)
const indoor = (e) => (/outdoor/i.test(e.name) ? 0 : 1);

const needsMore = (ex, eq) => ex && ex.eq && !ex.eq.some((e) => eq.has(e));

// Options worth showing for this plan (nothing to pick if the plan needs no equipment).
export function whereOptions(profile) {
  const base = planBase(profile);
  const opts = WHERE.filter((w) => RANK[w.id] <= RANK[base]);
  if (opts.length < 2) return [];
  const none = constraints({ equipment: "none" }).eq;
  const anyGear = (profile.plan.days || []).some((d) => d.sections.some((s) => s.items.some((it) => needsMore(lookup(it), none))));
  return anyGear ? opts : [];
}

// What to show as selected: the last choice if it still applies, otherwise the plan's own setup.
export function currentWhere(profile) {
  const opts = whereOptions(profile);
  if (!opts.length) return planBase(profile);
  return opts.some((o) => o.id === profile.where) ? profile.where : planBase(profile);
}

export const whereInfo = (profile, where) => ({
  ...profile,
  equipment: where,
  hasBar: where === "gym" ? true : where === "home" ? !!profile.hasBar : false,
});

function replacementFor(it, ex, profile, info, c, used) {
  const level = c.level;
  // nothing that needs a band, ball or foam roller when training away from the gym
  const ok = (e) => isAllowed(e, c) && !used.has(e.id) && !/band|ball|foam/i.test(e.name);
  if (ex.m === "cardio" || it.m === "cardio") {
    const mode = it.kind === "interval" ? "interval" : "steady";
    const cands = LIBRARY.filter((e) => e.m === "cardio" && ok(e)).sort((a, b) => indoor(b) - indoor(a));
    return cands.find((e) => (e.modes || []).includes(mode)) || cands[0];
  }
  if (ex.m === "mobility") {
    const same = LIBRARY.filter((e) => e.m === "mobility" && e.role === ex.role && ok(e));
    return same.find((e) => (ex.area ? e.area === ex.area : e.focus === ex.focus)) || same.find((e) => e.focus === "full") || same[0];
  }
  if (!ex.p) return null;
  const fits = (e) => e.p === ex.p && ok(e) && !!e.ballistic === !!ex.ballistic;
  const weights = LIBRARY.filter((e) => e.m === "weights" && fits(e) && e.lv[0] <= level);
  const pickW = weights.find((e) => !!e.compound === !!ex.compound) || weights[0];
  if (pickW) return pickW;
  let cali = [];
  for (let lv = level; lv >= 0 && !cali.length; lv--) cali = LIBRARY.filter((e) => e.m === "cali" && fits(e) && e.lv[0] <= lv && lv <= e.lv[1]);
  if (!cali.length) cali = LIBRARY.filter((e) => e.m === "cali" && e.p === ex.p && ok(e));
  return cali[0] || null;
}

// The day adapted to where you train today. Returns the same day if nothing needs to change.
export function adaptDay(day, profile, where) {
  if (!day || !where || RANK[where] >= RANK[planBase(profile)]) return day;
  const info = whereInfo(profile, where);
  const c = constraints(info);
  const used = new Set(day.sections.flatMap((s) => s.items.map((i) => lookup(i)?.id)).filter(Boolean));
  let changed = 0;
  const sections = day.sections.map((s) => ({
    ...s,
    items: s.items.map((it) => {
      const ex = lookup(it);
      if (!needsMore(ex, c.eq)) return it;
      const alt = replacementFor(it, ex, profile, info, c, used);
      if (!alt) return { ...it, needsGear: true };
      used.add(alt.id);
      changed++;
      const next =
        alt.m === "mobility"
          ? makeItem(alt, info, c, { role: alt.role === "cooldown" || ex.role === "cooldown" ? "cooldown" : "warmup" })
          : swapItem(it, alt, info);
      return { ...next, uid: it.uid, main: it.main, whereSwap: true, baseName: it.name };
    }),
  }));
  if (!changed && !sections.some((s) => s.items.some((i) => i.needsGear))) return day;
  return { ...day, where, sections };
}
