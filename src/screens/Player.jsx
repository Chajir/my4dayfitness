import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useStore } from "../lib/store";
import { ConfirmButton, ExName, ExerciseMedia, Icon, Sheet, Stepper, Toast } from "../components/ui";
import { SwapSheet, replaceInPlan } from "../components/DaySheet";
import { fmtDur, lastFor, targetText, personalRecords, sessionTotals, estimateKcal } from "../lib/stats";
import { initSets, toSession } from "../lib/workout";
import { beep, keepAwake, unlockAudio } from "../lib/device";
import { t as tr, planText, exName, cueText, howToFor } from "../i18n";

function useNow(active) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export default function Player({ active, setActive }) {
  const { sessions, profile, setProfile, addSession } = useStore();
  const [sheet, setSheet] = useState(null); // list | exit | finish | swap
  const [toast, setToast] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pendingSet, setPendingSet] = useState(null); // set tapped while rest is still running
  const now = useNow(!summary);
  const { items, idx, log } = active;
  const it = items[idx];
  const lg = log[it.uid];
  const scroller = useRef(null);

  useEffect(() => {
    keepAwake(true);
    return () => keepAwake(false);
  }, []);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [idx]);

  const patch = (fn) => setActive((a) => fn(structuredClone(a)));
  const setSet = (k, change) =>
    patch((a) => {
      Object.assign(a.log[it.uid].sets[k], change);
      return a;
    });

  // ---------- timers (rest / hold / interval / cardio) ----------
  useEffect(() => {
    const a = active;
    if (a.rest && now >= a.rest.endAt) {
      beep(2);
      const end = a.rest.endAt;
      patch((x) => (x.rest?.endAt === end && (x.rest = null), x));
    }
    const t = a.timer;
    if (!t || now < t.endAt) return;
    const item = a.items.find((i) => i.uid === t.uid);
    patch((x) => {
      if (!x.timer || x.timer.endAt !== t.endAt) return x; // already handled
      const sets = x.log[t.uid].sets;
      if (t.type === "hold") {
        if (item.perSide && t.side === 1) {
          beep(1);
          x.timer = { ...t, side: 2, endAt: Date.now() + sets[t.setIdx].seconds * 1000 };
          return x;
        }
        sets[t.setIdx].done = true;
        x.timer = null;
        beep(2);
        if (item.rest && sets.some((s) => !s.done)) x.rest = { endAt: Date.now() + item.rest * 1000, total: item.rest };
      } else if (t.type === "interval") {
        if (t.phase === "work") {
          sets[t.round].done = true;
          const nextRound = sets.findIndex((s) => !s.done);
          if (nextRound === -1) {
            x.timer = null;
            beep(3);
          } else {
            beep(1);
            x.timer = { ...t, phase: "rest", round: nextRound, endAt: Date.now() + item.rest * 1000 };
          }
        } else {
          beep(2);
          x.timer = { ...t, phase: "work", endAt: Date.now() + item.work * 1000 };
        }
      } else if (t.type === "cardio") {
        sets[0].done = true;
        x.timer = null;
        beep(3);
      }
      return x;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);


  // Log a set: mark it done, then start a fresh rest if sets remain (or clear the rest if that was the last one).
  const logSet = (k) =>
    patch((a) => {
      const sets = a.log[it.uid].sets;
      sets[k].done = true;
      const more = sets.some((x) => !x.done);
      a.rest = more && it.rest ? { endAt: Date.now() + it.rest * 1000, total: it.rest } : null;
      return a;
    });

  const completeSet = (k) => {
    unlockAudio();
    if (lg.sets[k].done) return setSet(k, { done: false }); // undo is always allowed
    if (active.rest && active.rest.endAt > Date.now()) return setPendingSet(k); // still resting: ask first
    logSet(k);
  };

  const startTimer = (type, extra = {}) => {
    unlockAudio();
    patch((a) => {
      a.rest = null;
      if (type === "hold") a.timer = { uid: it.uid, type, setIdx: extra.k, side: 1, endAt: Date.now() + a.log[it.uid].sets[extra.k].seconds * 1000 };
      if (type === "interval") {
        const r = a.log[it.uid].sets.findIndex((s) => !s.done);
        a.timer = { uid: it.uid, type, round: r < 0 ? 0 : r, phase: "work", endAt: Date.now() + it.work * 1000 };
      }
      if (type === "cardio") a.timer = { uid: it.uid, type, endAt: Date.now() + a.log[it.uid].sets[0].minutes * 60000 };
      return a;
    });
  };
  const stopTimer = () => patch((a) => ((a.timer = null), a));

  const go = (n) => patch((a) => ((a.idx = Math.max(0, Math.min(a.items.length - 1, n))), a));
  const skip = () =>
    patch((a) => {
      a.log[it.uid].skipped = true;
      if (a.timer?.uid === it.uid) a.timer = null;
      if (a.idx < a.items.length - 1) a.idx++;
      return a;
    });
  const unskip = () => patch((a) => ((a.log[it.uid].skipped = false), a));
  const addSet = () => patch((a) => (a.log[it.uid].sets.push({ ...a.log[it.uid].sets.at(-1), done: false }), a));
  const removeSet = () => patch((a) => (a.log[it.uid].sets.length > 1 && a.log[it.uid].sets.pop(), a));

  const status = (i) => {
    const l = log[i.uid];
    if (l.skipped) return "skipped";
    const d = l.sets.filter((s) => s.done).length;
    return d === 0 ? "todo" : d === l.sets.length ? "done" : "partial";
  };
  const doneCount = items.filter((i) => status(i) === "done").length;
  const allDone = lg.sets.every((s) => s.done);
  const isLast = idx === items.length - 1;
  const last = useMemo(() => lastFor(it.name, sessions), [it.name, sessions]);

  const finish = () => {
    const session = toSession(active);
    const before = personalRecords(sessions);
    const after = personalRecords([...sessions, session]);
    const prs = Object.entries(after)
      .filter(([n, v]) => session.exercises.some((e) => e.name === n) && (!before[n] || v.val > before[n].val) && before[n])
      .map(([n, v]) => ({ name: n, label: v.label }));
    addSession(session);
    setSheet(null);
    setSummary({ session, prs });
    setTimeout(() => confetti({ particleCount: 140, spread: 90, origin: { y: 0.35 }, colors: ["#FF3D6E", "#7B3BFF", "#ffffff"] }), 150);
  };

  if (summary) return <Summary {...summary} weightKg={profile.weightKg} onDone={() => setActive(null)} />;

  const elapsed = (now - new Date(active.startedAt)) / 1000;
  const timer = active.timer?.uid === it.uid ? active.timer : null;
  const remaining = (t) => Math.max(0, Math.ceil((t.endAt - now) / 1000));
  const levelUp = it.m === "cali" && it.kind === "reps" && allDone && lg.sets.every((s) => s.reps >= (it.reps?.[1] || 99));

  return (
    <div className="h-[100dvh] flex flex-col max-w-md mx-auto">
      {/* top bar */}
      <header className="pt-safe px-4 shrink-0">
        <div className="flex items-center justify-between h-12">
          <button onClick={() => setSheet("exit")} className="h-10 w-10 -ml-2 grid place-items-center text-mute">
            <Icon name="x" />
          </button>
          <div className="text-center">
            <div className="text-[11px] text-mute font-semibold uppercase tracking-wider">{planText(active.label)}</div>
            <div className="text-sm font-semibold tabular-nums">{fmtDur(elapsed)}</div>
          </div>
          <button onClick={() => setSheet("list")} className="h-10 w-10 -mr-2 grid place-items-center text-mute">
            <Icon name="list" />
          </button>
        </div>
        <div className="flex gap-[3px] pb-3">
          {items.map((i, k) => {
            const st = status(i);
            return <button key={i.uid} onClick={() => go(k)} className={`h-1.5 flex-1 rounded-full ${k === idx ? "bg-white" : st === "done" ? "bg-hot" : st === "partial" ? "bg-hot/50" : st === "skipped" ? "bg-white/25" : "bg-white/10"}`} />;
          })}
        </div>
      </header>

      {/* body */}
      <main ref={scroller} className="flex-1 overflow-y-auto px-4 pb-6">
        <div key={it.uid} className="rise">
          <div className="relative rounded-3xl overflow-hidden">
            <ExerciseMedia item={it} className="w-full aspect-[16/10] text-6xl" />
            <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">{planText(it.section)}</div>
            <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur px-3 py-1 text-[11px] font-semibold tabular-nums">
              {idx + 1} / {items.length}
            </div>
          </div>

          <div className="flex items-start gap-3 mt-4">
            <h1 className="h-display text-[2.2rem] flex-1"><ExName name={it.name} subClassName="!text-sm mt-1" /></h1>
            <button onClick={() => setSheet("swap")} className="mt-1 h-10 px-3 rounded-full bg-ink-700 text-mute text-xs font-semibold flex items-center gap-1.5 shrink-0">
              <Icon name="swap" size={14} /> {tr("Swap")}
            </button>
          </div>
          <div className="text-hot font-semibold mt-1">{targetText(it)}</div>
          {it.rest > 0 && it.kind !== "interval" && <div className="text-xs text-mute mt-0.5">{tr("Rest {s}s between sets", { s: it.rest })}</div>}
          {cueText(it.cue) && <p className="text-sm text-white/70 mt-3 leading-relaxed">{cueText(it.cue)}</p>}
          <HowTo name={it.name} />
          {last && (
            <div className="mt-3 text-xs text-mute">
              {tr("Last time:")}{" "}
              <span className="text-white/80">
                {last.sets
                  .map((s) => (s.weight ? `${s.weight}×${s.reps ?? s.seconds}` : s.reps ? `${s.reps}` : s.seconds ? `${s.seconds}s` : s.minutes ? `${s.minutes}min` : "✓"))
                  .join(", ")}
              </span>
            </div>
          )}

          {lg.skipped ? (
            <div className="card p-5 mt-5 text-center">
              <p className="text-mute">{tr("Skipped")}</p>
              <button className="btn-ghost mt-3" onClick={unskip}>
                {tr("Do it anyway")}
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {it.kind === "reps" &&
                lg.sets.map((s, k) => (
                  <SetRow key={k} n={k + 1} done={s.done} onDone={() => completeSet(k)}>
                    <Stepper value={s.reps} onChange={(v) => setSet(k, { reps: v })} unit={tr("reps")} />
                    {it.weighted && <Stepper value={s.weight} onChange={(v) => setSet(k, { weight: v })} step={5} unit="lb" />}
                  </SetRow>
                ))}

              {it.kind === "hold" &&
                lg.sets.map((s, k) => {
                  const running = timer?.type === "hold" && timer.setIdx === k;
                  return (
                    <SetRow key={k} n={k + 1} done={s.done} onDone={() => (running ? stopTimer() : completeSet(k))}>
                      {running ? (
                        <div className="flex-1 flex items-center justify-between rounded-xl bg-hot/15 border border-hot/40 h-12 px-4">
                          <span className="font-display text-3xl font-bold tabular-nums">{remaining(timer)}s</span>
                          <span className="text-xs text-hot font-semibold">{it.perSide ? tr("Side {n}", { n: timer.side }) : tr("Hold")}</span>
                        </div>
                      ) : (
                        <>
                          <Stepper value={s.seconds} onChange={(v) => setSet(k, { seconds: v })} step={5} unit={tr("sec")} />
                          {it.weighted && <Stepper value={s.weight} onChange={(v) => setSet(k, { weight: v })} step={5} unit="lb" />}
                          {!s.done && !it.weighted && (
                            <button onClick={() => startTimer("hold", { k })} className="h-12 px-4 rounded-xl bg-ink-700 flex items-center gap-2 text-sm font-semibold">
                              <Icon name="timer" size={16} /> {tr("Start")}
                            </button>
                          )}
                        </>
                      )}
                    </SetRow>
                  );
                })}

              {it.kind === "interval" && <IntervalPanel it={it} sets={lg.sets} timer={timer} remaining={timer ? remaining(timer) : null} onStart={() => startTimer("interval")} onStop={stopTimer} onToggle={(k) => setSet(k, { done: !lg.sets[k].done })} />}

              {it.kind === "cardio" && (
                <div className="card p-4 space-y-3">
                  {timer ? (
                    <div className="text-center py-4">
                      <div className="label">{tr("Time left")}</div>
                      <div className="font-display text-7xl font-bold tabular-nums">{fmtDur(remaining(timer))}</div>
                      <button className="btn-ghost mt-3" onClick={stopTimer}>
                        {tr("Stop timer")}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-mute">{tr("Minutes")}</span>
                        <Stepper value={lg.sets[0].minutes} onChange={(v) => setSet(0, { minutes: v })} step={5} unit="min" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-mute">{tr("Distance (optional)")}</span>
                        <Stepper value={lg.sets[0].distance} onChange={(v) => setSet(0, { distance: v })} step={0.25} unit="mi" />
                      </div>
                      <div className="flex gap-2 pt-1">
                        {!lg.sets[0].done && (
                          <button className="btn-ghost flex-1" onClick={() => startTimer("cardio")}>
                            <Icon name="timer" size={16} /> {tr("Start timer")}
                          </button>
                        )}
                        <button className={`btn flex-1 h-12 ${lg.sets[0].done ? "bg-go text-ink" : "bg-white text-ink"}`} onClick={() => setSet(0, { done: !lg.sets[0].done })}>
                          <Icon name="check" size={18} /> {lg.sets[0].done ? tr("Done") : tr("Mark done")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {(it.kind === "reps" || it.kind === "hold") && (
                <div className="flex gap-2 pt-1">
                  <button onClick={addSet} className="text-xs font-semibold text-mute px-3 h-9 rounded-full bg-ink-800 flex items-center gap-1">
                    <Icon name="plus" size={14} /> {tr("Add set")}
                  </button>
                  {lg.sets.length > 1 && (
                    <button onClick={removeSet} className="text-xs font-semibold text-mute px-3 h-9 rounded-full bg-ink-800 flex items-center gap-1">
                      <Icon name="minus" size={14} /> {tr("Remove set")}
                    </button>
                  )}
                </div>
              )}
              {levelUp && (
                <button onClick={() => setSheet("swap")} className="w-full mt-2 rounded-2xl bg-go/10 text-go text-sm px-4 py-3 text-left">
                  {tr("You hit the top of the rep range on every set. Ready for a harder variation?")} <span className="underline">{tr("Swap")}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* rest overlay */}
      {active.rest && (
        <div className="shrink-0 mx-4 mb-2 rounded-2xl bg-ink-800 border border-white/10 p-4 flex items-center gap-4 rise">
          <RestRing pct={Math.max(0, (active.rest.endAt - now) / (active.rest.total * 1000))} sec={remaining(active.rest)} />
          <div className="flex-1">
            <div className="label">{tr("Rest")}</div>
            <div className="text-sm text-white/80">{tr("Breathe. Next set when the timer ends.")}</div>
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={() => patch((a) => ((a.rest.endAt += 15000), (a.rest.total += 15), a))} className="h-8 px-3 rounded-lg bg-ink-700 text-xs font-semibold">
              +15s
            </button>
            <button onClick={() => patch((a) => ((a.rest = null), a))} className="h-8 px-3 rounded-lg bg-white text-ink text-xs font-semibold">
              {tr("Skip")}
            </button>
          </div>
        </div>
      )}

      {/* bottom bar */}
      <footer className="shrink-0 px-4 pb-safe pt-2 flex gap-2 bg-ink">
        <button onClick={() => go(idx - 1)} disabled={idx === 0} className="btn-ghost h-14 w-14 !px-0 disabled:opacity-30">
          <Icon name="left" />
        </button>
        {!allDone && !lg.skipped && (
          <button onClick={skip} className="btn-ghost h-14 px-5">
            {tr("Skip")}
          </button>
        )}
        {isLast ? (
          <button onClick={() => setSheet("finish")} className="btn-primary flex-1">
            {tr("Finish workout")}
          </button>
        ) : (
          <button onClick={() => go(idx + 1)} className={`flex-1 ${allDone || lg.skipped ? "btn-primary" : "btn-ghost h-14"}`}>
            {tr("Next")} <Icon name="right" size={18} />
          </button>
        )}
      </footer>

      <Sheet open={sheet === "list"} title={planText(active.title)} onClose={() => setSheet(null)}>
        <div className="space-y-1">
          {items.map((i, k) => {
            const st = status(i);
            return (
              <button key={i.uid} onClick={() => { go(k); setSheet(null); }} className={`w-full flex items-center gap-3 p-2 rounded-xl text-left ${k === idx ? "bg-ink-700" : ""}`}>
                <span className={`h-7 w-7 rounded-full grid place-items-center shrink-0 text-xs ${st === "done" ? "bg-hot" : st === "partial" ? "bg-hot/40" : st === "skipped" ? "bg-ink-600 text-mute" : "border border-white/20 text-mute"}`}>
                  {st === "done" ? <Icon name="check" size={14} /> : st === "skipped" ? "–" : k + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm truncate ${st === "skipped" ? "text-mute line-through" : ""}`}>{exName(i.name)}</span>
                  <span className="text-[11px] text-mute">{planText(i.section)}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button className="btn-primary w-full mt-4" onClick={() => setSheet("finish")}>
          {tr("Finish workout")}
        </button>
      </Sheet>

      <Sheet open={sheet === "exit"} title={tr("Pause workout?")} onClose={() => setSheet(null)}>
        <p className="text-sm text-mute mb-4">{tr("Your progress is saved on this phone. You can close the app and come back to it.")}</p>
        <div className="space-y-2">
          <button className="btn-primary w-full" onClick={() => setSheet(null)}>
            {tr("Keep going")}
          </button>
          <button className="btn-ghost w-full h-14" onClick={() => setSheet("finish")}>
            {tr("Finish & save")}
          </button>
          <ConfirmButton className="btn w-full h-14 text-hot" confirmText={tr("Tap again to discard (nothing saved)")} onConfirm={() => setActive(null)}>
            {tr("Discard workout")}
          </ConfirmButton>
        </div>
      </Sheet>

      <Sheet open={pendingSet !== null} title={tr("Still resting")} onClose={() => setPendingSet(null)}>
        <p className="text-sm text-mute mb-4">
          {active.rest && active.rest.endAt > now ? (
            <>
              <span className="text-white font-semibold tabular-nums">{remaining(active.rest)}s</span> {tr("of rest left. Rest is part of the workout: it lets you lift the same weight again on the next set.")}
            </>
          ) : (
            tr("Rest is over. You're good to go.")
          )}
        </p>
        <button
          className="btn-primary w-full"
          onClick={() => {
            logSet(pendingSet);
            setPendingSet(null);
          }}
        >
          {active.rest && active.rest.endAt > now ? tr("Skip rest & log set {n}", { n: pendingSet + 1 }) : tr("Log set {n}", { n: pendingSet + 1 })}
        </button>
        <button className="btn-ghost w-full h-14 mt-2" onClick={() => setPendingSet(null)}>
          {tr("Keep resting")}
        </button>
      </Sheet>

      <Sheet open={sheet === "finish"} title={tr("Finish workout?")} onClose={() => setSheet(null)}>
        <p className="text-sm text-mute mb-4">
          {tr("{a} of {b} exercises fully done. Sets you checked off will be saved.", { a: doneCount, b: items.length })}
        </p>
        <button className="btn-primary w-full" onClick={finish}>
          {tr("Save workout")}
        </button>
        <button className="btn-ghost w-full h-14 mt-2" onClick={() => setSheet(null)}>
          {tr("Keep going")}
        </button>
      </Sheet>

      {sheet === "swap" && (
        <SwapSheet
          item={it}
          onClose={() => setSheet(null)}
          onPick={(n) => {
            patch((a) => {
              a.items[a.idx] = { ...n, section: it.section };
              delete a.log[it.uid];
              a.log[n.uid] = { sets: initSets(n, sessions), skipped: false };
              if (a.timer?.uid === it.uid) a.timer = null;
              return a;
            });
            if (profile.plan.days.some((d) => d.sections.some((s) => s.items.some((x) => x.uid === it.uid)))) {
              const { section, ...clean } = n;
              setProfile({ plan: replaceInPlan(profile.plan, it.uid, clean) });
            }
            setSheet(null);
            setToast(tr("Swapped to {name}. Your plan is updated too.", { name: exName(n.name) }));
          }}
        />
      )}
      <Toast text={toast} />
    </div>
  );
}

function HowTo({ name }) {
  const [open, setOpen] = useState(false);
  const h = howToFor(name);
  useEffect(() => setOpen(false), [name]);
  if (!h) return null;
  return (
    <div className="mt-3 rounded-2xl bg-ink-800 border border-white/5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 h-11 text-sm font-semibold">
        <span className="flex items-center gap-2">
          <Icon name="info" size={16} className="text-hot" /> {tr("How to do it")}
        </span>
        <Icon name="right" size={16} className={`text-mute transition ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 text-sm leading-relaxed">
          {[
            ["Setup", h.s],
            ["Movement", h.m],
            ["Avoid", h.x],
          ].map(([k, v]) => (
            <div key={k}>
              <div className={`label mb-0.5 ${k === "Avoid" ? "!text-hot" : ""}`}>{tr(k)}</div>
              <div className="text-white/85">{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SetRow({ n, done, onDone, children }) {
  return (
    <div className={`flex items-center gap-2 rounded-2xl p-2 pl-3 transition ${done ? "bg-hot/[0.08]" : "bg-ink-800"}`}>
      <span className={`w-6 text-sm font-display font-bold ${done ? "text-hot" : "text-mute"}`}>{n}</span>
      <div className="flex-1 flex gap-2 flex-wrap">{children}</div>
      <button onClick={onDone} className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 transition active:scale-90 ${done ? "bg-brand text-white" : "bg-ink-700 text-mute"}`} aria-label="Done">
        <Icon name="check" size={22} />
      </button>
    </div>
  );
}

function RestRing({ pct, sec }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} stroke="#2E2E33" strokeWidth="5" fill="none" />
        <circle cx="32" cy="32" r={r} stroke="url(#g)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="#FF3D6E" />
            <stop offset="1" stopColor="#7B3BFF" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold tabular-nums">{sec}</span>
    </div>
  );
}

function IntervalPanel({ it, sets, timer, remaining, onStart, onStop, onToggle }) {
  const done = sets.filter((s) => s.done).length;
  const work = timer?.phase === "work";
  return (
    <div className={`rounded-3xl p-5 text-center transition ${timer ? (work ? "bg-brand" : "bg-ink-700") : "bg-ink-800"}`}>
      {timer ? (
        <>
          <div className="text-sm font-bold uppercase tracking-[0.2em]">{work ? tr("Work") : tr("Rest")}</div>
          <div className="font-display text-8xl font-bold tabular-nums leading-none my-2">{remaining}</div>
          <div className="text-sm opacity-80">
            {tr("Round {a} of {b}", { a: timer.round + 1, b: sets.length })}
          </div>
          <button onClick={onStop} className="mt-4 h-11 px-5 rounded-full bg-black/30 text-sm font-semibold inline-flex items-center gap-2">
            <Icon name="pause" size={16} /> {tr("Stop")}
          </button>
        </>
      ) : (
        <>
          <div className="font-display text-5xl font-bold">
            {done}/{sets.length}
          </div>
          <div className="text-sm text-mute">{tr("rounds done")}</div>
          {done < sets.length && (
            <button onClick={onStart} className="btn-primary w-full mt-4">
              <Icon name="play" size={16} /> {done ? tr("Resume intervals") : tr("Start intervals")}
            </button>
          )}
        </>
      )}
      <div className="flex flex-wrap justify-center gap-1.5 mt-4">
        {sets.map((s, k) => (
          <button key={k} onClick={() => onToggle(k)} className={`h-7 w-7 rounded-full text-[11px] font-semibold ${s.done ? "bg-white text-ink" : "bg-black/30 text-white/60"}`}>
            {k + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function Summary({ session, prs, weightKg, onDone }) {
  const t = sessionTotals(session);
  const kcal = estimateKcal(session, weightKg);
  return (
    <div className="min-h-[100dvh] max-w-md mx-auto px-5 pt-safe pb-safe flex flex-col">
      <div className="flex-1 pt-10 rise">
        <div className="label !text-hot">{tr("Workout complete")}</div>
        <h1 className="h-display text-6xl mt-2">
          {tr("Nice")}
          <br />
          {tr("work.")}
        </h1>
        <p className="text-mute mt-2">{planText(session.title)}</p>
        <div className="grid grid-cols-2 gap-2 mt-8">
          <Stat label={tr("Time")} value={fmtDur(session.durationSec)} />
          <Stat label={tr("Sets")} value={t.sets} />
          {t.volume > 0 ? <Stat label={tr("Volume")} value={`${t.volume.toLocaleString()} lb`} /> : <Stat label={tr("Reps")} value={t.reps} />}
          {kcal ? <Stat label={tr("Calories (est.)")} value={kcal} /> : <Stat label={tr("Exercises")} value={session.exercises.filter((e) => e.sets.length).length} />}
        </div>
        {prs.length > 0 && (
          <div className="mt-6">
            <div className="label mb-2 flex items-center gap-1.5">
              <Icon name="trophy" size={14} className="text-hot" /> {tr("New personal records")}
            </div>
            <div className="space-y-2">
              {prs.map((p) => (
                <div key={p.name} className="card px-4 py-3 flex justify-between gap-3">
                  <span className="text-sm truncate">{exName(p.name)}</span>
                  <span className="text-sm font-semibold text-hot shrink-0">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <button className="btn-primary w-full mt-8" onClick={onDone}>
        {tr("Done")}
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="font-display text-4xl font-bold mt-1">{value}</div>
    </div>
  );
}
