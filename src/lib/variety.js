// Exercise variety: the plan's exercises rotate with similar alternatives over time.
//  - Main lifts change every 4 weeks (so people can add weight and see progress within a block).
//  - Everything else (accessories, warm-ups, cool-downs, cardio, power) changes every week.
//  - Only alternatives that fit the person's equipment, level and pain areas are used.
//  - An exercise the person swapped by hand is "locked" and never rotates.
//  - Week 1 of a plan always shows the plan exactly as built.
import { LIBRARY, byId } from "../data/library";
import { constraints, isAllowed, swapItem } from "../data/generator";
import { startOfWeek } from "./stats";
import { hasMedia } from "./images";

const WEEK = 7 * 86400000;
const BLOCK = 4; // weeks a main lift stays the same

export const varietyOn = (profile) => profile?.variety ?? profile?.plan?.source !== "classic";

export function weekIndex(plan, date = new Date()) {
  const start = startOfWeek(plan?.createdAt || Date.now());
  return Math.max(0, Math.round((startOfWeek(date) - start) / WEEK));
}

const poolCache = new Map();

function poolFor(item, profile) {
  const base = byId[item.exId];
  if (!base) return [];
  const info = profile?.plan?.source === "classic" ? { ...profile, equipment: "gym" } : profile || {};
  const key = `${base.id}|${info.equipment}|${info.hasBar}|${info.level}|${(info.pain || []).join()}|${info.parq?.surgery}`;
  if (poolCache.has(key)) return poolCache.get(key);
  const c = constraints(info);
  const lvl = c.level;
  const fits = (e) => {
    if (e.id === base.id || !isAllowed(e, c)) return false;
    if (e.m !== base.m) return false; // weights stay weights, calisthenics stay calisthenics
    if (base.m === "cardio") return (e.modes || []).some((m) => (base.modes || []).includes(m));
    if (base.m === "mobility") return e.role === base.role && e.kind === base.kind && (base.area ? e.area === base.area : e.focus === base.focus);
    if (e.p !== base.p) return false;
    if (!!e.ballistic !== !!base.ballistic) return false; // explosive moves only swap with explosive moves
    if (e.m === "cali") return e.lv[0] <= lvl && lvl <= e.lv[1];
    return e.lv[0] <= lvl;
  };
  const alts = LIBRARY.filter(fits)
    .sort((a, b) => Number(hasMedia(b.name)) - Number(hasMedia(a.name)) || Number(!!b.compound === !!base.compound) - Number(!!a.compound === !!base.compound) || a.id.localeCompare(b.id))
    .slice(0, 3);
  const pool = [base, ...alts];
  poolCache.set(key, pool);
  return pool;
}

// Returns the day as it should be done in the given week.
export function dayForWeek(day, profile, date = new Date()) {
  const plan = profile?.plan;
  if (!day || !plan || !varietyOn(profile)) return day;
  const w = weekIndex(plan, date);
  if (w === 0) return day;
  const used = new Set(day.sections.flatMap((s) => s.items.map((i) => i.exId)).filter(Boolean));
  let slot = 0;
  return {
    ...day,
    week: w + 1,
    sections: day.sections.map((s) => ({
      ...s,
      items: s.items.map((it) => {
        slot++;
        if (it.locked || !it.exId) return it;
        const pool = poolFor(it, profile);
        if (pool.length < 2) return it;
        const main = it.main || !!byId[it.exId]?.compound;
        const step = main ? Math.floor(w / BLOCK) : w;
        if (step % pool.length === 0) return it; // this week it's the original
        // walk the pool from this week's position; skip anything already in today's workout
        let pick = null;
        for (let k = 0; k < pool.length; k++) {
          const cand = pool[(step + k * (slot % 2 ? 1 : pool.length - 1)) % pool.length];
          if (cand.id === it.exId) break; // fell back to the original
          if (!used.has(cand.id)) {
            pick = cand;
            break;
          }
        }
        if (!pick) return it;
        used.add(pick.id);
        const next = swapItem(it, pick, profile);
        return { ...next, uid: it.uid, main: it.main, rotated: true, baseName: it.name };
      }),
    })),
  };
}

export const rotatedCount = (day) => day.sections.reduce((n, s) => n + s.items.filter((i) => i.rotated).length, 0);
