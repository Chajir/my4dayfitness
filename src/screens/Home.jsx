import { useState } from "react";
import { useStore } from "../lib/store";
import { Icon, Thumb, Chip, Sheet } from "../components/ui";
import PlanSheet from "../components/PlanSheet";
import { whereOptions, currentWhere, adaptDay } from "../lib/where";
import { buildExtra, EXTRA_KINDS, EXTRA_MINUTES } from "../lib/extra";
import DaySheet from "../components/DaySheet";
import { nextDay, thisWeek, weekStreak, startOfWeek, estMinutes, fmtDate, fmtDur, dayKey } from "../lib/stats";
import { startWorkout } from "../lib/workout";
import { constraints } from "../data/generator";
import { unlockAudio } from "../lib/device";
import { hasMedia } from "../lib/images";
import { dayForWeek } from "../lib/variety";
import { t, planText, exName, locale } from "../i18n";

export default function Home({ onStart }) {
  const { profile, sessions, sync, setProfile } = useStore();
  const plan = profile.plan;
  const opts = whereOptions(profile);
  const where = currentWhere(profile);
  const up = adaptDay(dayForWeek(nextDay(plan, sessions), profile), profile, where);
  const swaps = up.sections.reduce((n, s) => n + s.items.filter((i) => i.whereSwap).length, 0);
  const [preview, setPreview] = useState(null);
  const [plansOpen, setPlansOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const allWeek = thisWeek(sessions);
  const week = allWeek.filter((s) => !s.extra);
  const extras = allWeek.length - week.length;
  const streak = weekStreak(sessions);
  const target = plan.days.length;
  const hour = new Date().getHours();
  const greet = t(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  const flagged = constraints(profile).flagged;

  const start = (day) => {
    unlockAudio();
    setPreview(null);
    onStart(startWorkout(plan, adaptDay(dayForWeek(plan.days.find((d) => d.id === day.id) || day, profile), profile, where), sessions));
  };
  const startExtra = (kind, minutes) => {
    unlockAudio();
    setExtraOpen(false);
    onStart(startWorkout(plan, buildExtra(kind, minutes, profile, where, sessions.length), sessions, { extra: true }));
  };

  const monday = startOfWeek(new Date());
  const trained = new Set(sessions.map((s) => dayKey(s.startedAt)));
  const days = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + k);
    return d;
  });
  const upItems = up.sections.flatMap((s) => s.items);
  const mainItems = up.sections.filter((s) => !/warm|cool|prep/i.test(s.name)).flatMap((s) => s.items);

  return (
    <div className="max-w-md mx-auto px-5 pt-safe">
      <header className="flex items-end justify-between pt-4 pb-6">
        <div>
          <div className="text-mute text-sm">{fmtDate(new Date(), { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1 className="h-display text-4xl mt-1">
            {greet}
            {profile.name ? `, ${profile.name}` : ""}
          </h1>
        </div>
        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${sync === "ok" ? "text-go" : sync === "local" ? "text-mute" : "text-white/40"}`} title={sync === "ok" ? t("Synced") : t("Saved on this phone")}>
          <Icon name={sync === "ok" ? "cloud" : "phone"} size={14} />
          {sync === "ok" ? t("Synced") : sync === "local" ? t("On phone") : "…"}
        </div>
      </header>

      {flagged && (
        <div className="rounded-2xl bg-hot/10 text-hot text-sm px-4 py-3 mb-4 flex gap-3">
          <Icon name="info" size={18} className="shrink-0 mt-0.5" />
          {t("Based on your health answers, check with your doctor before pushing hard.")}
        </div>
      )}

      {/* Up next */}
      <section className="relative rounded-3xl p-[1.5px] bg-brand rise">
        <div className="rounded-[calc(1.5rem-1.5px)] bg-ink-900 overflow-hidden">
          <div className="relative h-40">
            <Thumb item={upItems.find((i) => hasMedia(i.name)) || mainItems[0] || upItems[0]} className="absolute inset-0 h-full w-full text-5xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/50 to-transparent" />
            <div className="absolute left-5 bottom-3 right-5">
              <div className="label !text-white/80">
                {t("Up next")} · {planText(up.label)}
              </div>
              <h2 className="h-display text-[2.6rem] mt-1">{planText(up.title)}</h2>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="flex gap-4 text-sm text-mute">
              <span>~{estMinutes(up)} min</span>
              <span>{t("{n} exercises", { n: upItems.length })}</span>
              <span>{planText(up.tag)}</span>
            </div>
            <p className="text-sm text-white/70 mt-2">{mainItems.slice(0, 4).map((m) => exName(m.name)).join(" · ")}{mainItems.length > 4 ? ` ${t("+{n} more", { n: mainItems.length - 4 })}` : ""}</p>
            {opts.length > 0 && (
              <div className="mt-4">
                <div className="label mb-2">{t("Training at")}</div>
                <div className="flex gap-1.5">
                  {opts.map((o) => (
                    <Chip key={o.id} active={where === o.id} onClick={() => setProfile({ where: o.id })} className="!h-9 !px-3 text-xs">
                      {t(o.id === "home" ? "Home" : o.label)}
                    </Chip>
                  ))}
                </div>
                {swaps > 0 && <p className="text-xs text-mute mt-2">{t("{n} exercises swapped for this workout only. Your plan stays the same.", { n: swaps })}</p>}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="btn-primary flex-1" onClick={() => start(up)}>
                <Icon name="play" size={16} /> {t("Start")}
              </button>
              <button className="btn-ghost h-14 px-5" onClick={() => setPreview(up)}>
                {t("Preview")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <button className="w-full mt-3 h-12 rounded-2xl border border-dashed border-white/15 text-sm font-semibold text-white/80 flex items-center justify-center gap-2 active:bg-ink-800" onClick={() => setExtraOpen(true)}>
        <Icon name="plus" size={16} /> {t("Add a session")}
      </button>

      {/* This week */}
      <section className="card p-5 mt-4 rise" style={{ animationDelay: "60ms" }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="label">{t("This week")}</div>
            <div className="mt-1">
              <span className="font-display text-4xl font-bold">{week.length}</span>
              <span className="text-mute font-display text-2xl font-bold"> / {target}</span>
              <span className="text-sm text-mute ml-2">{t("workouts")}</span>
              {extras > 0 && <div className="text-xs text-mute mt-0.5">{t("+{n} extra", { n: extras })}</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="label">{t("Week streak")}</div>
            <div className="flex items-center justify-end gap-1 mt-1">
              <Icon name="flame" size={22} className={streak ? "text-hot" : "text-mute"} />
              <span className="font-display text-4xl font-bold">{streak}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-4">
          {days.map((d) => {
            const done = trained.has(dayKey(d));
            const today = dayKey(d) === dayKey(new Date());
            return (
              <div key={d.toISOString()} className="flex flex-col items-center gap-1.5">
                <span className={`text-[11px] ${today ? "text-white font-semibold" : "text-mute"}`}>{d.toLocaleDateString(locale(), { weekday: "narrow" })}</span>
                <span className={`h-9 w-9 rounded-full grid place-items-center text-xs font-semibold ${done ? "bg-brand text-white" : today ? "border border-white/40" : "bg-ink-700 text-mute"}`}>
                  {done ? <Icon name="check" size={16} /> : d.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plan */}
      <section className="mt-8">
        <div className="flex justify-between items-baseline mb-3">
          <h3 className="h-display text-2xl">{t("Your plan")}</h3>
          {(profile.plans || []).length > 0 ? (
            <button className="text-xs font-semibold text-hot flex items-center gap-1" onClick={() => setPlansOpen(true)}>
              {planText(plan.name)} · {t("Switch")} <Icon name="swap" size={13} />
            </button>
          ) : (
            <span className="text-xs text-mute">{planText(plan.name)}</span>
          )}
        </div>
        <div className="space-y-2">
          {plan.days.map((d) => (
            <button key={d.id} onClick={() => setPreview(d)} className={`w-full card p-4 flex items-center gap-4 text-left active:bg-ink-700 ${d.id === up.id ? "!border-hot/40" : ""}`}>
              <span className={`h-11 w-11 shrink-0 rounded-xl grid place-items-center font-display text-xl font-bold ${d.id === up.id ? "bg-brand" : "bg-ink-700 text-mute"}`}>{d.label.replace("Day ", "")}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold truncate">{planText(d.title)}</span>
                <span className="text-xs text-mute">
                  {planText(d.tag)} · ~{estMinutes(d)} min
                </span>
              </span>
              <Icon name="right" size={18} className="text-mute" />
            </button>
          ))}
        </div>
      </section>

      {/* Recent */}
      {sessions.length > 0 && (
        <section className="mt-8 mb-4">
          <h3 className="h-display text-2xl mb-3">{t("Recent")}</h3>
          <div className="space-y-2">
            {[...sessions]
              .reverse()
              .slice(0, 3)
              .map((s) => (
                <div key={s.id} className="card px-4 py-3 flex justify-between items-center">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{planText(s.title)}</div>
                    <div className="text-xs text-mute">{fmtDate(s.startedAt)}</div>
                  </div>
                  <div className="text-sm text-mute shrink-0">{s.durationSec ? fmtDur(s.durationSec) : ""}</div>
                </div>
              ))}
          </div>
        </section>
      )}

      <DaySheet day={preview} where={where} onClose={() => setPreview(null)} onStart={start} />
      <PlanSheet open={plansOpen} onClose={() => setPlansOpen(false)} />
      <ExtraSheet open={extraOpen} onClose={() => setExtraOpen(false)} onStart={startExtra} />
    </div>
  );
}

function ExtraSheet({ open, onClose, onStart }) {
  const [kind, setKind] = useState("steady");
  const [minutes, setMinutes] = useState(20);
  if (!open) return null;
  return (
    <Sheet open title={t("Add a session")} subtitle={t("Counts in your history and calendar. Your plan's next day stays the same.")} onClose={onClose}>
      <div className="space-y-2 pt-1">
        {EXTRA_KINDS.map((k) => (
          <button key={k.id} onClick={() => setKind(k.id)} className={`w-full card p-4 text-left flex items-center gap-3 ${kind === k.id ? "!border-hot/60 bg-hot/5" : ""}`}>
            <span className="flex-1">
              <span className="block font-semibold">{planText(k.title)}</span>
              <span className="text-xs text-mute">{t(k.text)}</span>
            </span>
            {kind === k.id && <Icon name="check" size={18} className="text-hot" />}
          </button>
        ))}
      </div>
      <div className="label mt-5 mb-2">{t("Time")}</div>
      <div className="flex gap-2">
        {EXTRA_MINUTES.map((m) => (
          <Chip key={m} active={minutes === m} onClick={() => setMinutes(m)}>
            {m} min
          </Chip>
        ))}
      </div>
      <button className="btn-primary w-full mt-6" onClick={() => onStart(kind, minutes)}>
        <Icon name="play" size={16} /> {t("Start")}
      </button>
    </Sheet>
  );
}
