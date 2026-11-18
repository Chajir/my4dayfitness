// Rule-based plan generator. Pure function: intake -> plan.
// Kept isolated so an AI coach can replace or refine it later.
import { LIBRARY, byId, AREAS } from "./library";
import { imageFor } from "../lib/images";

export const GOALS = [
  { id: "fat_loss", label: "Lose fat", hint: "Burn more, keep muscle" },
  { id: "muscle", label: "Build muscle", hint: "Size and shape" },
  { id: "strength", label: "Get stronger", hint: "Lift or move more" },
  { id: "endurance", label: "Endurance", hint: "Go longer, recover faster" },
  { id: "health", label: "Feel better", hint: "General health and mobility" },
];
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const STYLE_LABEL = { weights: "Weights", cali: "Calisthenics", cardio: "Cardio" };

const HARD_CALI = new Set(["archer-pushup", "wall-hspu", "neg-pullup", "ctb-pullup", "box-pistol", "shrimp-squat", "nordic-neg", "pullup", "neutral-pullup", "bar-dip", "hanging-leg-raise"]);

const SCHEMES = {
  strength: { c: [4, [4, 6], 150], a: [3, [8, 10], 90] },
  muscle: { c: [4, [6, 10], 90], a: [3, [10, 12], 60] },
  fat_loss: { c: [3, [8, 12], 60], a: [3, [12, 15], 45] },
  endurance: { c: [3, [12, 15], 45], a: [2, [15, 20], 30] },
  health: { c: [3, [8, 10], 75], a: [2, [10, 12], 60] },
};

const CALI_SCHEMES = {
  strength: { c: [4, [5, 8], 120], a: [3, [8, 12], 75] },
  muscle: { c: [4, [8, 12], 90], a: [3, [10, 15], 60] },
  fat_loss: { c: [3, [10, 15], 60], a: [3, [12, 20], 45] },
  endurance: { c: [3, [15, 20], 45], a: [2, [15, 25], 30] },
  health: { c: [3, [8, 12], 75], a: [2, [10, 15], 60] },
};

const TEMPLATES = {
  fullA: { title: "Full Body A", focus: "full", slots: ["squat", "hpush", "hinge", "hpull", "core", "vpush"] },
  fullB: { title: "Full Body B", focus: "full", slots: ["hinge", "vpull", "lunge", "vpush", "core", "arms"] },
  fullC: { title: "Full Body C", focus: "full", slots: ["lunge", "hpull", "squat", "hpush", "core", "calves"] },
  upper: { title: "Upper Body", focus: "upper", slots: ["hpush", "hpull", "vpush", "vpull", "delts", "arms", "core"] },
  lower: { title: "Lower Body", focus: "lower", slots: ["squat", "hinge", "lunge", "core", "calves", "hinge"] },
  push: { title: "Push", focus: "upper", slots: ["hpush", "vpush", "delts", "arms", "hpush", "core"] },
  pull: { title: "Pull", focus: "upper", slots: ["vpull", "hpull", "delts", "arms", "hpull", "core"] },
  legs: { title: "Legs", focus: "lower", slots: ["squat", "hinge", "lunge", "calves", "core", "lunge"] },
};

function splitFor(n) {
  if (n <= 0) return [];
  if (n === 1) return ["fullA"];
  if (n === 2) return ["fullA", "fullB"];
  if (n === 3) return ["fullA", "fullB", "fullC"];
  if (n === 4) return ["upper", "lower", "upper", "lower"];
  if (n === 5) return ["upper", "lower", "push", "pull", "legs"];
  return ["push", "pull", "legs", "push", "pull", "legs"];
}

let uidN = 0;
const uid = () => `i${Date.now().toString(36)}${(uidN++).toString(36)}`;

export function equipmentSet(info) {
  const s = new Set(["none"]);
  if (info.equipment === "gym") ["gym", "db", "bar"].forEach((x) => s.add(x));
  if (info.equipment === "home") s.add("db");
  if (info.hasBar) s.add("bar");
  return s;
}

export function constraints(info) {
  const pain = new Set(info.pain || []);
  const past = new Set(info.past || []);
  const surgery = !!(info.surgeryRecent || info.parq?.surgery);
  const flagged = !!(info.parq?.heart || info.parq?.chest || info.parq?.dizzy || surgery);
  const avoid = new Set(pain);
  if (pain.has("knees") || pain.has("ankles") || pain.has("hips") || surgery || flagged || (info.age && info.age >= 65)) avoid.add("impact");
  let level = Number(info.level ?? 0);
  if (flagged) level = 0;
  else if (info.age >= 65) level = Math.min(level, 1);
  return { pain, past, avoid, flagged, level, eq: equipmentSet(info) };
}

export function isAllowed(ex, c) {
  return ex.eq.some((e) => c.eq.has(e)) && !ex.s.some((j) => c.avoid.has(j));
}

function score(ex, c, used, level) {
  let sc = 0;
  if (ex.compound) sc += 2;
  if (imageFor(ex.name)) sc += 0.5;
  ex.s.forEach((j) => c.past.has(j) && (sc -= 3));
  if (used.has(ex.id)) sc -= 4;
  if (ex.m === "weights" && ex.lv[0] > level) sc -= 10;
  return sc;
}

function pickStrength(pattern, modality, c, used, dayIdx) {
  const level = c.level;
  let cands = LIBRARY.filter((e) => e.m === modality && e.p === pattern && isAllowed(e, c));
  if (modality === "cali") {
    // progression: take the variation that fits the level, else the closest easier one
    let lvl = level;
    let fit = [];
    while (lvl >= 0 && !fit.length) {
      fit = cands.filter((e) => e.lv[0] <= lvl && lvl <= e.lv[1]);
      lvl--;
    }
    cands = fit;
  } else {
    cands = cands.filter((e) => e.lv[0] <= level);
  }
  if (!cands.length) return null;
  const ranked = cands
    .map((e, i) => ({ e, s: score(e, c, used, level) + (((i + dayIdx) % cands.length) === 0 ? 0.3 : 0) }))
    .sort((a, b) => b.s - a.s);
  return ranked[0].e;
}

function holdSeconds(level) {
  return [20, 30, 45][level] ?? 30;
}

export function makeItem(ex, info, c, opts = {}) {
  const goal = info.goal || "health";
  const base = { uid: uid(), exId: ex.id, name: ex.name, cue: ex.cue, kind: ex.kind, perSide: !!ex.perSide, weighted: ex.m === "weights" && !ex.weightless, p: ex.p, m: ex.m };
  if (opts.role === "warmup" || opts.role === "care") {
    if (ex.kind === "cardio") return { ...base, sets: 1, minutes: 5, rest: 0 };
    if (ex.kind === "hold") return { ...base, sets: 1, seconds: 30, rest: 0 };
    return { ...base, sets: 1, reps: [8, 10], rest: 0 };
  }
  if (opts.role === "cooldown") return { ...base, kind: "hold", sets: 1, seconds: ex.perSide ? 30 : 45, rest: 0 };
  if (ex.kind === "hold") {
    const sets = c.level === 0 ? 2 : 3;
    return { ...base, sets, seconds: ex.id === "farmer-carry" ? 30 : holdSeconds(c.level), rest: 45 };
  }
  const sch = (ex.m === "cali" ? CALI_SCHEMES : SCHEMES)[goal][opts.compound ? "c" : "a"];
  let [sets, reps, rest] = [sch[0], [...sch[1]], sch[2]];
  if (c.level === 0) sets = Math.max(2, sets - 1);
  if (info.age && info.age < 18 && reps[0] < 6) reps = [6, 8];
  if (ex.m === "cali" && HARD_CALI.has(ex.id)) reps = c.level === 2 ? [5, 8] : [3, 6];
  if (ex.m === "cali" && rest < 60) rest = 60;
  return { ...base, sets, reps, rest, main: !!opts.compound };
}

function cardioItem(ex, mode, info, c, minutesOverride) {
  const base = { uid: uid(), exId: ex.id, name: ex.name, m: "cardio", p: "cardio" };
  if (mode === "steady") {
    const map = { 30: 20, 45: 30, 60: 40 };
    let min = minutesOverride || map[info.minutes] || 25;
    if (c.level === 0 && !minutesOverride) min -= 5;
    return { ...base, kind: "cardio", sets: 1, minutes: min, rest: 0, cue: "Zone 2: you can talk in full sentences, but you're working." };
  }
  const rounds = [6, 8, 10][c.level];
  const work = [20, 30, 30][c.level];
  return { ...base, kind: "interval", sets: rounds, work, rest: 60 - work, cue: "Go hard on work, easy on rest." };
}

function pickCardio(mode, c, used, salt) {
  const cands = LIBRARY.filter((e) => e.m === "cardio" && e.modes.includes(mode) && isAllowed(e, c));
  if (!cands.length) return LIBRARY.find((e) => e.id === "brisk-walk");
  const fresh = cands.filter((e) => !used.has(e.id));
  const pool = fresh.length ? fresh : cands;
  return pool[salt % pool.length];
}

function warmups(focus, info, c, salt) {
  const general = LIBRARY.filter((e) => e.role === "warmup" && (e.focus === focus || (focus !== "cardio" && e.focus === "full")) && isAllowed(e, c));
  const picks = [];
  for (let i = 0; i < general.length && picks.length < 2; i++) picks.push(general[(i + salt) % general.length]);
  const care = [...c.pain, ...c.past]
    .flatMap((a) => LIBRARY.filter((e) => e.role === "care" && e.area === a))
    .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
    .slice(0, 2);
  return [...new Set([...picks, ...care])].map((e) => makeItem(e, info, c, { role: e.role === "care" ? "care" : "warmup" }));
}

function cooldowns(focus, info, c, salt) {
  const list = LIBRARY.filter((e) => e.role === "cooldown" && (e.focus === focus || e.focus === "full"));
  const picks = [list[salt % list.length], list[(salt + 1) % list.length]];
  return [...new Set(picks)].map((e) => makeItem(e, info, c, { role: "cooldown" }));
}

function coreFinisher(info, c, used) {
  const out = [];
  for (let k = 0; k < 2; k++) {
    const ex = pickStrength("core", "cali", c, used, k);
    if (ex) {
      used.add(ex.id);
      out.push(makeItem(ex, info, c, {}));
    }
  }
  return out;
}

export function generatePlan(info) {
  const c = constraints(info);
  const styles = info.styles || { cali: true };
  const n = Math.min(6, Math.max(2, Number(info.days) || 3));
  let wantWeights = !!styles.weights;
  let wantCali = !!styles.cali;
  const wantCardio = !!styles.cardio;
  const notes = [];
  if (wantWeights && !c.eq.has("db") && !c.eq.has("gym")) {
    wantWeights = false;
    wantCali = true;
    notes.push("Weights need dumbbells or a gym, so your strength days use bodyweight exercises for now. Change your equipment in Settings any time.");
  }
  const strengthMods = [wantWeights && "weights", wantCali && "cali"].filter(Boolean);

  const ratio = { fat_loss: 0.4, endurance: 0.5, muscle: 0.25, strength: 0.25, health: 0.35 }[info.goal || "health"];
  let cardioDays = 0;
  if (wantCardio && strengthMods.length) cardioDays = Math.min(n - 1, Math.max(1, Math.round(n * ratio)));
  else if (wantCardio) cardioDays = n;
  const strengthDays = n - cardioDays;

  const used = new Set();
  const slotCount = { 30: 4, 45: 5, 60: 7 }[info.minutes] || 5;
  const wantPower = strengthMods.length && c.level >= 1 && info.goal !== "health" && info.minutes >= 45;
  const finisher = wantCardio && strengthMods.length && ["fat_loss", "endurance"].includes(info.goal) && info.minutes >= 45;

  const strength = splitFor(strengthDays).map((tKey, d) => {
    const t = TEMPLATES[tKey];
    const main = [];
    const dayUsed = new Set();
    t.slots.slice(0, slotCount).forEach((slot, i) => {
      const order = strengthMods.length === 2 ? ((i + d) % 2 === 0 ? ["weights", "cali"] : ["cali", "weights"]) : strengthMods;
      let ex = null;
      for (const m of order) {
        ex = pickStrength(slot, m, c, new Set([...used, ...dayUsed]), d);
        if (ex && !dayUsed.has(ex.id)) break;
        ex = null;
      }
      if (!ex) return;
      dayUsed.add(ex.id);
      used.add(ex.id);
      main.push(makeItem(ex, info, c, { compound: i < 3 && !!ex.compound }));
    });
    const sections = [{ name: "Warm-Up", items: warmups(t.focus, info, c, d) }];
    if (wantPower) {
      let px = null;
      for (const m of strengthMods) if (!px) px = pickStrength("power", m, c, new Set([...used, ...dayUsed]), d);
      if (px) {
        used.add(px.id);
        const it = makeItem(px, info, c, {});
        Object.assign(it, { sets: 3, reps: px.m === "weights" ? [6, 8] : [5, 5], rest: 60, main: false });
        sections.push({ name: "Power", items: [it] });
      }
    }
    sections.push({ name: "Main Work", items: main });
    if (finisher) {
      const cx = pickCardio("interval", c, used, d);
      used.add(cx.id);
      const it = cardioItem(cx, "interval", info, c);
      it.sets = 5;
      sections.push({ name: "Finisher", items: [it] });
    }
    sections.push({ name: "Cool Down", items: cooldowns(t.focus, info, c, d) });
    const tag = strengthMods.map((m) => STYLE_LABEL[m]).join(" + ");
    return { title: t.title, tag, sections };
  });

  const cardioPattern = {
    endurance: ["steady", "interval", "steady"],
    fat_loss: ["interval", "steady"],
    health: ["steady", "steady", "interval"],
    muscle: ["steady", "interval"],
    strength: ["steady", "interval"],
  }[info.goal || "health"];
  const cardio = Array.from({ length: cardioDays }, (_, k) => {
    const mode = cardioPattern[k % cardioPattern.length];
    const cx = pickCardio(mode, c, used, k);
    used.add(cx.id);
    const main = [cardioItem(cx, mode, info, c)];
    if (mode === "interval" && info.minutes >= 45) {
      const cx2 = pickCardio("interval", c, used, k + 1);
      used.add(cx2.id);
      main.push(cardioItem(cx2, "interval", info, c));
    }
    const sections = [
      { name: "Warm-Up", items: [makeItem(byId["easy-cardio"], info, c, { role: "warmup" }), ...warmups("cardio", info, c, k).slice(1)] },
      { name: mode === "steady" ? "Steady Cardio" : "Intervals", items: main },
    ];
    if (info.minutes >= 45) sections.push({ name: "Core", items: coreFinisher(info, c, new Set()) });
    sections.push({ name: "Cool Down", items: cooldowns("cardio", info, c, k) });
    return { title: mode === "steady" ? "Cardio · Steady" : "Cardio · Intervals", tag: "Cardio", sections };
  });

  // interleave cardio days between strength days
  const days = [];
  let si = 0;
  let ci = 0;
  for (let i = 0; i < n; i++) {
    const wantCardioHere = ci < cardioDays && (si >= strengthDays || ((i + 0.5) * cardioDays) / n >= ci + 0.5);
    days.push(wantCardioHere ? cardio[ci++] : strength[si++]);
  }

  // safety notes
  const label = (id) => AREAS.find((a) => a.id === id)?.label.toLowerCase();
  if (c.pain.size) notes.push(`Because of pain in your ${[...c.pain].map(label).join(", ")}, exercises that load those areas were left out and joint-care moves were added to your warm-ups.`);
  if (c.past.size) notes.push(`For your past ${[...c.past].map(label).join(", ")} issues, gentler options were preferred. Start light and stop if anything hurts.`);
  if (c.avoid.has("impact")) notes.push("Jumping and running impact were left out to protect your joints.");
  if (c.flagged) notes.push("Based on your health answers, please get the OK from your doctor before starting. Your plan starts at beginner intensity.");

  const styleNames = [wantWeights && "Weights", wantCali && "Calisthenics", wantCardio && "Cardio"].filter(Boolean);
  return {
    id: uid(),
    source: "generated",
    name: `${styleNames.join(" + ")} · ${n} days`,
    createdAt: Date.now(),
    notes,
    days: days.map((d, i) => ({ id: `d${i + 1}`, label: `Day ${i + 1}`, ...d })),
  };
}

// Alternatives for the "swap exercise" button
export function alternativesFor(item, info) {
  const c = constraints(info || {});
  if (!info) c.eq = new Set(["gym", "db", "bar", "none"]);
  return LIBRARY.filter((e) => {
    if (e.id === item.exId) return false;
    if (item.m === "cardio") return e.m === "cardio";
    if (item.m === "mobility") return e.m === "mobility";
    return (e.m === "weights" || e.m === "cali") && e.p === item.p;
  })
    .map((e) => ({ ex: e, ok: isAllowed(e, c) }))
    .sort((a, b) => Number(b.ok) - Number(a.ok));
}

export function swapItem(item, ex, info) {
  const c = constraints(info || {});
  if (item.m === "cardio") {
    const mode = item.kind === "interval" ? "interval" : "steady";
    const modeOk = ex.modes.includes(mode) ? mode : ex.modes[0];
    const it = cardioItem(ex, modeOk, info || {}, c, item.kind === "cardio" ? item.minutes : undefined);
    if (item.kind === "interval" && modeOk === "interval") Object.assign(it, { sets: item.sets, work: item.work, rest: item.rest });
    return { ...it, uid: item.uid };
  }
  const fresh = makeItem(ex, info || { goal: "health" }, c, {});
  const keep = { uid: item.uid, sets: item.sets, rest: item.rest };
  if (fresh.kind === item.kind) Object.assign(fresh, keep, item.kind === "hold" ? { seconds: item.seconds } : { reps: item.reps });
  else fresh.uid = item.uid;
  return fresh;
}
