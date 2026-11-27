// Saved plans. Changing your plan keeps the old one, so you can switch back with one tap.
// Each plan keeps its own place in the rotation (the next day is worked out per plan),
// so switching back and forth never mixes up days.
const SETUP_KEYS = ["source", "styles", "goal", "level", "days", "minutes", "equipment", "hasBar", "variety", "where"];
const MAX_SAVED = 4;

export const setupOf = (p) => Object.fromEntries(SETUP_KEYS.filter((k) => p?.[k] !== undefined).map((k) => [k, p[k]]));

// Fields to add when a new plan replaces the current one.
export function keepPrevious(profile, newPlan) {
  const cur = profile?.plan;
  const others = (profile?.plans || []).filter((e) => e.plan?.id !== newPlan.id && e.plan?.id !== cur?.id);
  if (!cur || cur.id === newPlan.id) return { plans: (profile?.plans || []).filter((e) => e.plan?.id !== newPlan.id) };
  return { plans: [{ plan: cur, setup: setupOf(profile), savedAt: Date.now() }, ...others].slice(0, MAX_SAVED) };
}

// Profile changes to switch to a saved plan.
export function switchTo(profile, id) {
  const entry = (profile.plans || []).find((e) => e.plan.id === id);
  if (!entry) return null;
  return { ...entry.setup, plan: entry.plan, ...keepPrevious(profile, entry.plan) };
}

export const removeSaved = (profile, id) => ({ plans: (profile.plans || []).filter((e) => e.plan.id !== id) });
