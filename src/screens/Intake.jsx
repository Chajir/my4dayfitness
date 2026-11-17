import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { AREAS } from "../data/library";
import { GOALS, LEVELS, generatePlan, constraints } from "../data/generator";
import { equinoxPlan } from "../data/equinox";
import { Chip, Icon, Thumb } from "../components/ui";
import { estMinutes, targetText, cmToFtIn } from "../lib/stats";

const STYLE_CARDS = [
  { id: "weights", title: "Weights", text: "Barbells, dumbbells, machines", glyph: "▲" },
  { id: "cali", title: "Calisthenics", text: "Your bodyweight, no weights", glyph: "◆" },
  { id: "cardio", title: "Cardio", text: "Run, bike, row, intervals", glyph: "♥" },
];

export default function Intake({ mode, onDone, onCancel }) {
  const { profile, setProfile, user } = useStore();
  const [d, setD] = useState(() => ({
    units: "imperial",
    styles: { weights: true, cardio: true },
    goal: "muscle",
    level: 1,
    days: 4,
    minutes: 45,
    equipment: "gym",
    hasBar: false,
    pain: [],
    past: [],
    parq: {},
    source: "generated",
    ...(profile || {}),
  }));
  const set = (patch) => setD((p) => ({ ...p, ...patch }));

  const preset = d.source === "equinox";
  const allSteps = ["start", "about", "health", "styles", "goal", "schedule", "equipment", "review"];
  const steps = useMemo(() => {
    let s = allSteps;
    if (mode === "info") s = ["about", "health", "review"];
    if (preset) s = s.filter((x) => !["styles", "goal", "schedule", "equipment"].includes(x));
    return s;
  }, [mode, preset]);
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => {
    setI((x) => Math.min(x + 1, steps.length - 1));
    window.scrollTo(0, 0);
  };
  const back = () => (i === 0 ? onCancel?.() : setI(i - 1));

  const plan = useMemo(() => (step === "review" ? (preset ? (mode === "info" && profile?.plan?.source === "equinox" ? profile.plan : equinoxPlan()) : generatePlan(d)) : null), [step, preset, d]);
  const [agree, setAgree] = useState(!!profile?.consent);

  const canNext = {
    about: d.age >= 13 && d.heightCm > 90 && d.weightKg > 25,
    styles: Object.values(d.styles || {}).some(Boolean),
  }[step] ?? true;

  const finish = () => {
    setProfile({ ...d, plan, consent: true });
    onDone();
  };

  return (
    <div className="min-h-screen max-w-md mx-auto px-5 pt-safe pb-36">
      <header className="flex items-center gap-3 h-14">
        {(i > 0 || onCancel) && (
          <button onClick={back} className="h-10 w-10 -ml-2 grid place-items-center text-mute">
            <Icon name="left" />
          </button>
        )}
        <div className="flex-1 flex gap-1">
          {steps.map((s, k) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${k <= i ? "bg-brand" : "bg-white/10"}`} />
          ))}
        </div>
      </header>

      <div key={step} className="rise pt-4">
        {step === "start" && (
          <>
            <Title kicker={`Welcome${d.name ? `, ${d.name}` : ""}`} title="How do you want to train?" />
            <div className="space-y-3">
              <BigOption active={!preset} onClick={() => set({ source: "generated" })} title="Build my plan" text="Tell us about you, pick weights, calisthenics, cardio or any mix, and we'll build a plan around it." badge="Personal" />
              <BigOption active={preset} onClick={() => set({ source: "equinox" })} title="Equinox 4-Day Program" text="A ready-made 4-day gym program: resistance days A, B, C and power intervals. Exercise photos included." badge="Ready-made" />
            </div>
          </>
        )}

        {step === "about" && <About d={d} set={set} />}
        {step === "health" && <Health d={d} set={set} />}

        {step === "styles" && (
          <>
            <Title kicker="Training style" title="What do you want to do?" sub="Pick one or more. Mix them however you like." />
            <div className="space-y-3">
              {STYLE_CARDS.map((s) => {
                const on = !!d.styles?.[s.id];
                return (
                  <button key={s.id} onClick={() => set({ styles: { ...d.styles, [s.id]: !on } })} className={`w-full text-left card p-5 flex items-center gap-4 ${on ? "!border-hot/70 bg-hot/[0.06]" : ""}`}>
                    <span className={`h-12 w-12 rounded-xl grid place-items-center text-xl ${on ? "bg-brand text-white" : "bg-ink-700 text-mute"}`}>{s.glyph}</span>
                    <span className="flex-1">
                      <span className="block font-display text-2xl font-bold uppercase">{s.title}</span>
                      <span className="text-sm text-mute">{s.text}</span>
                    </span>
                    <span className={`h-6 w-6 rounded-full border-2 grid place-items-center ${on ? "bg-hot border-hot" : "border-white/20"}`}>{on && <Icon name="check" size={14} />}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-sm text-mute mt-5">
              {Object.entries(d.styles || {})
                .filter(([, v]) => v)
                .map(([k]) => STYLE_CARDS.find((c) => c.id === k).title)
                .join(" + ") || "Pick at least one"}
            </p>
          </>
        )}

        {step === "goal" && (
          <>
            <Title kicker="Goal" title="What matters most right now?" />
            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((g) => (
                <button key={g.id} onClick={() => set({ goal: g.id })} className={`card px-5 py-4 text-left flex justify-between items-center ${d.goal === g.id ? "!border-hot/70 bg-hot/[0.06]" : ""}`}>
                  <span>
                    <span className="block font-semibold">{g.label}</span>
                    <span className="text-sm text-mute">{g.hint}</span>
                  </span>
                  {d.goal === g.id && <Icon name="check" className="text-hot" />}
                </button>
              ))}
            </div>
            <h3 className="label mt-8 mb-3">Experience</h3>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l, k) => (
                <button key={l} onClick={() => set({ level: k })} className={`card h-14 text-sm font-semibold ${d.level === k ? "!border-hot/70 bg-hot/[0.06]" : ""}`}>
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-mute mt-3">
              {["New to training, or coming back after a long break.", "Training consistently for 6+ months.", "Years of training, comfortable with advanced moves."][d.level]}
            </p>
          </>
        )}

        {step === "schedule" && (
          <>
            <Title kicker="Schedule" title="How often can you train?" />
            <h3 className="label mb-3">Days per week</h3>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button key={n} onClick={() => set({ days: n })} className={`card h-16 font-display text-3xl font-bold ${d.days === n ? "!bg-white !text-ink" : ""}`}>
                  {n}
                </button>
              ))}
            </div>
            <h3 className="label mt-8 mb-3">Time per workout</h3>
            <div className="grid grid-cols-3 gap-2">
              {[30, 45, 60].map((n) => (
                <button key={n} onClick={() => set({ minutes: n })} className={`card h-16 ${d.minutes === n ? "!bg-white !text-ink" : ""}`}>
                  <span className="font-display text-3xl font-bold">{n}</span>
                  <span className="text-xs ml-1">{n === 60 ? "min+" : "min"}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "equipment" && (
          <>
            <Title kicker="Equipment" title="Where do you train?" />
            <div className="space-y-2">
              {[
                ["gym", "Full gym", "Barbells, machines, cables, cardio machines"],
                ["home", "Home with dumbbells", "Dumbbells or kettlebells, maybe a bench"],
                ["none", "No equipment", "Bodyweight only, anywhere"],
              ].map(([id, t, s]) => (
                <button key={id} onClick={() => set({ equipment: id })} className={`w-full card px-5 py-4 text-left flex justify-between items-center ${d.equipment === id ? "!border-hot/70 bg-hot/[0.06]" : ""}`}>
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="text-sm text-mute">{s}</span>
                  </span>
                  {d.equipment === id && <Icon name="check" className="text-hot" />}
                </button>
              ))}
            </div>
            {d.equipment !== "gym" && (
              <button onClick={() => set({ hasBar: !d.hasBar })} className="mt-4 w-full card px-5 py-4 flex justify-between items-center">
                <span className="font-semibold">I have a pull-up bar</span>
                <Toggle on={d.hasBar} />
              </button>
            )}
            {d.styles?.weights && d.equipment === "none" && <p className="text-sm text-hot/90 mt-4">Weights need dumbbells or a gym. With no equipment, your strength days will use bodyweight exercises instead.</p>}
          </>
        )}

        {step === "review" && plan && (
          <>
            <Title kicker="Your plan" title={plan.name} />
            {plan.notes.map((n, k) => (
              <div key={k} className={`rounded-2xl px-4 py-3 mb-2 text-sm flex gap-3 ${/doctor/.test(n) ? "bg-hot/10 text-hot" : "bg-ink-800 text-white/80"}`}>
                <Icon name="info" size={18} className="shrink-0 mt-0.5" />
                <span>{n}</span>
              </div>
            ))}
            <div className="space-y-3 mt-4">
              {plan.days.map((day) => (
                <DayCard key={day.id} day={day} />
              ))}
            </div>
            <p className="text-xs text-mute mt-4">You can swap any exercise and adjust sets, reps or weight while you train.</p>
            {!profile?.consent && (
              <button onClick={() => setAgree(!agree)} className="mt-6 flex gap-3 text-left text-sm text-white/80">
                <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 grid place-items-center ${agree ? "bg-hot border-hot" : "border-white/30"}`}>{agree && <Icon name="check" size={12} />}</span>
                <span>I understand this app gives general fitness guidance, not medical advice, and I'll check with a doctor if I have health concerns.</span>
              </button>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-ink via-ink to-transparent pt-8 pb-safe px-5 z-30">
        <div className="max-w-md mx-auto">
          {step === "review" ? (
            <button className="btn-primary w-full" disabled={!agree} onClick={finish}>
              Start with this plan
            </button>
          ) : (
            <button className="btn-primary w-full" disabled={!canNext} onClick={next}>
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Title({ kicker, title, sub }) {
  return (
    <div className="mb-6">
      {kicker && <div className="label mb-2 !text-hot">{kicker}</div>}
      <h1 className="h-display text-[2.6rem]">{title}</h1>
      {sub && <p className="text-mute mt-2">{sub}</p>}
    </div>
  );
}

function BigOption({ active, onClick, title, text, badge }) {
  return (
    <button onClick={onClick} className={`w-full text-left card p-5 transition ${active ? "!border-hot/70 bg-hot/[0.06]" : ""}`}>
      <div className="flex justify-between items-start">
        <span className="font-display text-2xl font-bold uppercase">{title}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${active ? "bg-brand text-white" : "bg-ink-700 text-mute"}`}>{badge}</span>
      </div>
      <p className="text-sm text-mute mt-2 leading-relaxed">{text}</p>
    </button>
  );
}

function Toggle({ on }) {
  return (
    <span className={`w-12 h-7 rounded-full p-1 transition ${on ? "bg-hot" : "bg-ink-600"}`}>
      <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`} />
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label block mb-2">{label}</span>
      {children}
    </label>
  );
}

function About({ d, set }) {
  const imp = d.units !== "metric";
  const [ft, inch] = d.heightCm ? cmToFtIn(d.heightCm) : ["", ""];
  const num = (v) => (v === "" ? "" : Number(v));
  return (
    <>
      <Title kicker="About you" title="The basics" sub="Used to size your plan and estimate calories. Only you can see it." />
      <div className="space-y-5">
        <Field label="First name">
          <input className="field" value={d.name || ""} onChange={(e) => set({ name: e.target.value })} placeholder="Optional" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age">
            <input className="field" type="number" inputMode="numeric" value={d.age ?? ""} onChange={(e) => set({ age: num(e.target.value) })} />
          </Field>
          <Field label="Sex">
            <select className="field appearance-none" value={d.sex || ""} onChange={(e) => set({ sex: e.target.value })}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </Field>
        </div>
        <div className="flex gap-2">
          <Chip active={imp} onClick={() => set({ units: "imperial" })}>
            lb / ft
          </Chip>
          <Chip active={!imp} onClick={() => set({ units: "metric" })}>
            kg / cm
          </Chip>
        </div>
        {imp ? (
          <div className="grid grid-cols-3 gap-3">
            <Field label="Height ft">
              <input className="field" type="number" inputMode="numeric" value={ft} onChange={(e) => set({ heightCm: Math.round(((Number(e.target.value) || 0) * 12 + (Number(inch) || 0)) * 2.54) })} />
            </Field>
            <Field label="in">
              <input className="field" type="number" inputMode="numeric" value={inch} onChange={(e) => set({ heightCm: Math.round(((Number(ft) || 0) * 12 + (Number(e.target.value) || 0)) * 2.54) })} />
            </Field>
            <Field label="Weight lb">
              <input className="field" type="number" inputMode="decimal" value={d.weightKg ? Math.round(d.weightKg * 2.20462) : ""} onChange={(e) => set({ weightKg: Number(e.target.value) / 2.20462 })} />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height cm">
              <input className="field" type="number" inputMode="numeric" value={d.heightCm ?? ""} onChange={(e) => set({ heightCm: num(e.target.value) })} />
            </Field>
            <Field label="Weight kg">
              <input className="field" type="number" inputMode="decimal" value={d.weightKg ? Math.round(d.weightKg * 10) / 10 : ""} onChange={(e) => set({ weightKg: num(e.target.value) })} />
            </Field>
          </div>
        )}
        {d.age !== undefined && d.age !== "" && d.age < 13 && <p className="text-sm text-hot">You need to be at least 13 to use this app.</p>}
        <div className="card p-4 flex gap-3 items-start">
          <Icon name="heart" className="text-hot shrink-0 mt-0.5" />
          <p className="text-sm text-mute">
            <span className="text-white font-semibold">Apple Health sync is coming</span> with the iPhone app version. For now, enter your numbers here.
          </p>
        </div>
      </div>
    </>
  );
}

function Health({ d, set }) {
  const toggle = (key, id) => {
    const cur = new Set(d[key] || []);
    cur.has(id) ? cur.delete(id) : cur.add(id);
    const patch = { [key]: [...cur] };
    // an area can't be both "hurts now" and "past"
    const other = key === "pain" ? "past" : "pain";
    if (cur.has(id)) patch[other] = (d[other] || []).filter((x) => x !== id);
    set(patch);
  };
  const yesNo = (key, label) => (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/90">{label}</span>
      <div className="flex gap-1 shrink-0">
        {["No", "Yes"].map((t) => {
          const v = t === "Yes";
          const on = !!d.parq?.[key] === v;
          return (
            <button key={t} onClick={() => set({ parq: { ...d.parq, [key]: v } })} className={`h-9 px-4 rounded-lg text-sm font-semibold ${on ? (v ? "bg-hot text-white" : "bg-white text-ink") : "bg-ink-700 text-mute"}`}>
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
  const flagged = constraints(d).flagged;
  return (
    <>
      <Title kicker="Body check" title="Anything we should work around?" sub="Your plan skips exercises that load these areas and adds joint-care moves." />
      <h3 className="label mb-3">Hurts right now</h3>
      <div className="flex flex-wrap gap-2">
        {AREAS.map((a) => (
          <Chip key={a.id} active={d.pain?.includes(a.id)} onClick={() => toggle("pain", a.id)} className={d.pain?.includes(a.id) ? "!bg-hot !border-hot !text-white" : ""}>
            {a.label}
          </Chip>
        ))}
      </div>
      <h3 className="label mt-7 mb-3">Past injuries (healed, but careful)</h3>
      <div className="flex flex-wrap gap-2">
        {AREAS.map((a) => (
          <Chip key={a.id} active={d.past?.includes(a.id)} onClick={() => toggle("past", a.id)}>
            {a.label}
          </Chip>
        ))}
      </div>

      <h3 className="label mt-7 mb-1">Health questions</h3>
      <div className="card px-4">
        {yesNo("surgery", "Surgery in the last 12 months?")}
        {d.parq?.surgery && (
          <div className="pb-3">
            <input className="field" placeholder="What was it? (optional)" value={d.surgeryNotes || ""} onChange={(e) => set({ surgeryNotes: e.target.value })} />
          </div>
        )}
        {yesNo("heart", "Has a doctor said you have a heart condition or high blood pressure?")}
        {yesNo("chest", "Do you get chest pain during activity?")}
        {yesNo("dizzy", "Do you lose balance from dizziness or have you fainted recently?")}
      </div>
      <Field label="">
        <textarea className="field !h-20 py-3 mt-4" placeholder="Anything else? (other conditions, notes for yourself)" value={d.conditions || ""} onChange={(e) => set({ conditions: e.target.value })} />
      </Field>
      {(flagged || d.parq?.surgery) && <p className="text-sm text-hot mt-3">Please check with your doctor before starting. We'll keep your plan at beginner intensity.</p>}
    </>
  );
}

function DayCard({ day }) {
  const [open, setOpen] = useState(false);
  const items = day.sections.flatMap((s) => s.items);
  const main = day.sections.filter((s) => !/warm|cool|prep/i.test(s.name)).flatMap((s) => s.items);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full p-4 text-left flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="label">
            {day.label} · {day.tag}
          </div>
          <div className="font-display text-2xl font-bold uppercase truncate">{day.title}</div>
          <div className="text-xs text-mute mt-0.5">
            ~{estMinutes(day)} min · {items.length} exercises
          </div>
        </div>
        <Icon name="right" className={`text-mute transition ${open ? "rotate-90" : ""}`} />
      </button>
      {!open && (
        <div className="px-4 pb-4 -mt-1 text-sm text-white/70">
          {main.slice(0, 4).map((m) => m.name).join(" · ")}{main.length > 4 ? ` +${main.length - 4} more` : ""}
        </div>
      )}
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {day.sections.map((s) => (
            <div key={s.name}>
              <div className="label mb-2">{s.name}</div>
              <div className="space-y-2">
                {s.items.map((it) => (
                  <div key={it.uid} className="flex items-center gap-3">
                    <Thumb item={it} className="h-10 w-14 rounded-lg text-[10px] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{it.name}</div>
                      <div className="text-xs text-mute">{targetText(it)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
