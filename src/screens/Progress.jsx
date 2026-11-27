import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { ConfirmButton, Icon, Sheet, Stepper, ExName } from "../components/ui";
import { dayKey, fmtDate, fmtDur, personalRecords, sessionTotals, weekStreak } from "../lib/stats";
import { t as tr, planText, exName, locale, getLang } from "../i18n";

export default function Progress() {
  const { sessions, deleteSession, data, logBodyWeight, profile } = useStore();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [open, setOpen] = useState(null);
  const [showAllPr, setShowAllPr] = useState(false);
  const metric = profile.units === "metric";

  const prs = useMemo(
    () =>
      Object.entries(personalRecords(sessions))
        .sort((a, b) => new Date(b[1].date) - new Date(a[1].date)),
    [sessions]
  );
  const trained = useMemo(() => {
    const m = new Map();
    sessions.forEach((s) => m.set(dayKey(s.startedAt), (m.get(dayKey(s.startedAt)) || 0) + 1));
    return m;
  }, [sessions]);
  const thisMonth = sessions.filter((s) => {
    const d = new Date(s.startedAt);
    const n = new Date();
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  // calendar grid (Monday first)
  const first = (month.getDay() + 6) % 7;
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];

  const log = data.bodyLog || [];
  const lastW = log.at(-1)?.weight ?? profile.weightKg;
  const toUnit = (kg) => (metric ? Math.round(kg * 10) / 10 : Math.round(kg * 2.20462 * 10) / 10);
  const [w, setW] = useState(lastW ? toUnit(lastW) : "");

  return (
    <div className="max-w-md mx-auto px-5 pt-safe">
      <h1 className="h-display text-5xl pt-4 pb-6">{tr("Progress")}</h1>

      <div className="grid grid-cols-3 gap-2">
        <Big label={tr("Workouts")} value={sessions.length} />
        <Big label={tr("This month")} value={thisMonth} />
        <Big label={tr("Week streak")} value={weekStreak(sessions)} icon />
      </div>

      {/* calendar */}
      <section className="card p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <button className="h-9 w-9 grid place-items-center text-mute" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <Icon name="left" size={18} />
          </button>
          <div className="font-semibold">{month.toLocaleDateString(locale(), { month: "long", year: "numeric" })}</div>
          <button className="h-9 w-9 grid place-items-center text-mute" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <Icon name="right" size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {(getLang() === "es" ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"]).map((d, i) => (
            <div key={i} className="text-[11px] text-mute pb-1">
              {d}
            </div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const n = trained.get(dayKey(d));
            const today = dayKey(d) === dayKey(new Date());
            return (
              <div key={i} className="aspect-square grid place-items-center">
                <span className={`h-9 w-9 rounded-full grid place-items-center text-sm ${n ? "bg-brand font-semibold" : today ? "border border-white/40" : "text-white/60"}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* body weight */}
      <section className="card p-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="label">{tr("Body weight")}</div>
            <div className="font-display text-3xl font-bold mt-1">
              {lastW ? toUnit(lastW) : "—"} <span className="text-base text-mute">{metric ? "kg" : "lb"}</span>
            </div>
          </div>
          <Spark points={log.map((e) => e.weight)} />
        </div>
        <div className="flex gap-2 mt-3 items-center">
          <Stepper value={w} onChange={setW} step={metric ? 0.5 : 1} unit={metric ? "kg" : "lb"} wide />
          <button className="btn-ghost flex-1" onClick={() => w && logBodyWeight(dayKey(new Date()), metric ? Number(w) : Number(w) / 2.20462)}>
            {tr("Log today")}
          </button>
        </div>
      </section>

      {/* PRs */}
      <section className="mt-8">
        <h3 className="h-display text-2xl mb-3 flex items-center gap-2">
          <Icon name="trophy" size={20} className="text-hot" /> {tr("Personal records")}
        </h3>
        {!prs.length && <p className="text-sm text-mute">{tr("Finish a workout and your bests show up here.")}</p>}
        <div className="space-y-2">
          {(showAllPr ? prs : prs.slice(0, 6)).map(([name, r]) => (
            <div key={name} className="card px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{exName(name)}</div>
                <div className="text-[11px] text-mute">{fmtDate(r.date)}</div>
              </div>
              <div className="font-semibold text-sm shrink-0">{r.label}</div>
            </div>
          ))}
        </div>
        {prs.length > 6 && (
          <button className="text-sm text-mute mt-2 py-2" onClick={() => setShowAllPr(!showAllPr)}>
            {showAllPr ? tr("Show less") : tr("Show all {n}", { n: prs.length })}
          </button>
        )}
      </section>

      {/* history */}
      <section className="mt-8 mb-6">
        <h3 className="h-display text-2xl mb-3">{tr("History")}</h3>
        {!sessions.length && <p className="text-sm text-mute">{tr("No workouts yet.")}</p>}
        <div className="space-y-2">
          {[...sessions].reverse().map((s) => {
            const t = sessionTotals(s);
            return (
              <button key={s.id} onClick={() => setOpen(s)} className="w-full card px-4 py-3 flex items-center justify-between text-left active:bg-ink-700">
                <div className="min-w-0">
                  <div className="font-medium truncate">{planText(s.title)}</div>
                  <div className="text-xs text-mute">
                    {fmtDate(s.startedAt)}
                    {s.legacy ? ` · ${tr("old app")}` : ""}
                  </div>
                </div>
                <div className="text-right text-xs text-mute shrink-0">
                  {s.durationSec ? <div className="text-white/80 text-sm">{fmtDur(s.durationSec)}</div> : null}
                  {t.sets ? tr("{n} sets", { n: t.sets }) : ""}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Sheet
        open={!!open}
        title={planText(open?.title) || ""}
        subtitle={open ? `${fmtDate(open.startedAt, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${open.durationSec ? ` · ${fmtDur(open.durationSec)}` : ""}` : ""}
        onClose={() => setOpen(null)}
      >
        {open && (
          <>
            <div className="space-y-3 pt-1">
              {open.exercises.map((e, i) => (
                <div key={i} className="border-b border-white/5 pb-3">
                  <div className="text-sm font-medium"><ExName name={e.name} /></div>
                  <div className="text-xs text-mute mt-1">
                    {e.skipped && !e.sets.length
                      ? tr("Skipped")
                      : e.sets
                          .map((s) =>
                            s.minutes ? `${s.minutes} min${s.distance ? ` · ${s.distance} mi` : ""}` : s.weight ? `${s.weight} lb × ${s.reps ?? `${s.seconds}s`}` : s.reps ? `${s.reps} ${tr("reps")}` : s.seconds ? `${s.seconds}s` : "✓"
                          )
                          .join("  ·  ") || tr("Logged")}
                  </div>
                </div>
              ))}
            </div>
            <ConfirmButton
              className="btn w-full h-12 mt-5 text-hot bg-hot/10"
              confirmText={tr("Tap again to delete")}
              onConfirm={() => {
                deleteSession(open.id);
                setOpen(null);
              }}
            >
              <Icon name="trash" size={16} /> {tr("Delete workout")}
            </ConfirmButton>
          </>
        )}
      </Sheet>
    </div>
  );
}

function Big({ label, value, icon }) {
  return (
    <div className="card p-3">
      <div className="label !text-[10px]">{label}</div>
      <div className="font-display text-4xl font-bold mt-1 flex items-center gap-1">
        {icon && <Icon name="flame" size={20} className={value ? "text-hot" : "text-mute"} />}
        {value}
      </div>
    </div>
  );
}

function Spark({ points }) {
  if (points.length < 2) return <div className="text-xs text-mute w-28 text-right">{tr("Log a few days to see a trend")}</div>;
  const p = points.slice(-20);
  const min = Math.min(...p);
  const max = Math.max(...p);
  const span = max - min || 1;
  const d = p.map((v, i) => `${(i / (p.length - 1)) * 110 + 5},${40 - ((v - min) / span) * 30 - 5}`).join(" ");
  return (
    <svg width="120" height="40" viewBox="0 0 120 40">
      <polyline points={d} fill="none" stroke="#FF3D6E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
