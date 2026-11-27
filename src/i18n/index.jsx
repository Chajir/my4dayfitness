// Language support (English / Español). Display-only: nothing here changes how
// workouts, timers, saving or history work. Exercises are always stored under their
// English names; Spanish is only shown on screen. The choice is saved on this device only.
import { createContext, useContext, useEffect, useState } from "react";
import { ES } from "./es";
import { EX_ES } from "./exercises.es";
import { CUE_ES, HOWTO_ES } from "./coaching.es";
import { howTo } from "../data/howto";
import { slug } from "../lib/images";

const KEY = "fit:lang";
let current = "en";

function initial() {
  try {
    if (localStorage.getItem(KEY) === "es") return "es";
  } catch {}
  return "en"; // English unless the person picks Español
}

// Translate an English UI string. {name} placeholders are filled from vars.
// Anything without a translation stays in English.
export function t(text, vars) {
  let s = current === "es" ? (ES[text] ?? text) : text;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m));
  return s;
}

// Exercise name for display. The stored (English) name is never changed.
export const exName = (name) => (current === "es" && EX_ES[name]) || name;
// English name shown underneath, only in Spanish and only when different.
export const exSub = (name) => (current === "es" && EX_ES[name] && EX_ES[name] !== name ? name : null);

// Short tip shown under the exercise name.
export const cueText = (cue) => (cue && current === "es" ? CUE_ES[cue] || cue : cue);
// "How to do it" (setup / movement / avoid).
export const howToFor = (name) => (current === "es" && HOWTO_ES[slug(name)]) || howTo(name);

export const getLang = () => current;
export const locale = () => (current === "es" ? "es-US" : undefined);

// Text the plan builder stored inside a plan (titles, sections, notes, plan names).
const NOTE_PATTERNS = [
  [/^Because of pain in your (.+), exercises that load those areas were left out and joint-care moves were added to your warm-ups\.$/, (m, a) => t("Because of pain in your {areas}, exercises that load those areas were left out and joint-care moves were added to your warm-ups.", { areas: areas(a) })],
  [/^For your past (.+) issues, gentler options were preferred\. Start light and stop if anything hurts\.$/, (m, a) => t("For your past {areas} issues, gentler options were preferred. Start light and stop if anything hurts.", { areas: areas(a) })],
];
const LOWER = Object.fromEntries(Object.entries(ES).map(([k, v]) => [k.toLowerCase(), v]));
const areas = (list) => list.split(", ").map((x) => (LOWER[x.toLowerCase()] ?? x).toLowerCase()).join(", ");

export function planText(s) {
  if (!s || current !== "es") return s;
  if (ES[s]) return ES[s];
  const day = /^Day (\d+)$/.exec(s);
  if (day) return `${ES["Day"]} ${day[1]}`;
  for (const [re, fn] of NOTE_PATTERNS) if (re.test(s)) return s.replace(re, fn);
  // composite names like "Weights + Cardio · 4 days" or "Cardio · Steady"
  return s
    .replace(/(\d+) days$/, (m, n) => `${n} ${ES["days"]}`)
    .split(/( \+ | · )/)
    .map((p) => ES[p] ?? (/^Day (\d+)$/.test(p) ? p.replace("Day", ES["Day"]) : p))
    .join("");
}

const Ctx = createContext({ lang: "en", setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => (current = initial()));
  current = lang;
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l) => {
    if (l !== "en" && l !== "es") return;
    try {
      localStorage.setItem(KEY, l);
    } catch {}
    current = l;
    setLangState(l);
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
