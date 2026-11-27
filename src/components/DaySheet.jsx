import { useState } from "react";
import { Icon, Sheet, Thumb, ExName } from "./ui";
import { estMinutes, targetText } from "../lib/stats";
import { alternativesFor, swapItem } from "../data/generator";
import { useStore } from "../lib/store";
import { dayForWeek, varietyOn } from "../lib/variety";
import { t, planText, exName } from "../i18n";
import { adaptDay, whereInfo } from "../lib/where";

export function replaceInPlan(plan, uid, newItem) {
  newItem = { ...newItem, locked: true }; // hand-picked: never rotated by variety
  delete newItem.rotated;
  delete newItem.baseName;
  return {
    ...plan,
    days: plan.days.map((d) => ({ ...d, sections: d.sections.map((s) => ({ ...s, items: s.items.map((it) => (it.uid === uid ? newItem : it)) })) })),
  };
}

export function SwapSheet({ item, onPick, onClose, where }) {
  const { profile } = useStore();
  if (!item) return null;
  const info = where && where !== "gym" ? whereInfo(profile, where) : profile?.source === "classic" ? { ...profile, equipment: "gym" } : profile;
  const alts = alternativesFor(item, info);
  return (
    <Sheet open title={t("Swap exercise")} onClose={onClose}>
      <p className="text-sm text-mute pt-1 mb-4">
        {t("Replacing")} <span className="text-white">{exName(item.name)}</span>. {t("Same movement, different exercise.")}
      </p>
      {!alts.length && <p className="text-sm text-mute">{t("No alternatives for this one.")}</p>}
      <div className="space-y-2">
        {alts.map(({ ex, ok }) => (
          <button key={ex.id} onClick={() => onPick(swapItem(item, ex, info))} className={`w-full flex items-center gap-3 p-2 rounded-xl text-left active:bg-ink-700 ${ok ? "" : "opacity-50"}`}>
            <Thumb item={ex} className="h-12 w-16 rounded-lg text-xs shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm"><ExName name={ex.name} /></div>
              <div className="text-xs text-mute">
                {t({ weights: "Weights", cali: "Calisthenics", cardio: "Cardio", mobility: "Mobility" }[ex.m])}
                {!ok && ` · ${t("not ideal for your equipment or pain areas")}`}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export default function DaySheet({ day, onClose, onStart, where }) {
  const { profile, setProfile } = useStore();
  const [swapping, setSwapping] = useState(null);
  if (!day) return null;
  const live = adaptDay(dayForWeek(profile.plan.days.find((d) => d.id === day.id) || day, profile), profile, where);
  return (
    <>
      <Sheet open title={planText(live.title)} subtitle={`${planText(live.label)} · ${planText(live.tag)} · ~${estMinutes(live)} min${live.week && varietyOn(profile) ? ` · ${t("Week {n}", { n: live.week })}` : ""}`} onClose={onClose}>
        <div className="space-y-5 pt-1">
          {live.sections.map((s) => (
            <div key={s.name}>
              <div className="label mb-2">{planText(s.name)}</div>
              <div className="space-y-1">
                {s.items.map((it) => (
                  <div key={it.uid} className="flex items-center gap-3 py-1">
                    <Thumb item={it} className="h-12 w-16 rounded-lg text-xs shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-tight"><ExName name={it.name} /></div>
                      <div className="text-xs text-mute mt-0.5">
                        {targetText(it)}
                        {it.rotated && <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-hot">· {t("New this week")}</span>}
                        {it.locked && <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">· {t("Your pick")}</span>}
                      </div>
                      {it.whereSwap && <div className="text-[11px] text-hot/90 mt-0.5">{t("Instead of {name}", { name: exName(it.baseName) })}</div>}
                    </div>
                    <button onClick={() => setSwapping(it)} style={it.whereSwap ? { visibility: "hidden" } : undefined} className="h-9 w-9 grid place-items-center rounded-full bg-ink-700 text-mute shrink-0" aria-label="Swap">
                      <Icon name="swap" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary w-full mt-6" onClick={() => onStart(live)}>
          <Icon name="play" size={16} /> {t("Start workout")}
        </button>
      </Sheet>
      {swapping && (
        <SwapSheet
          item={swapping}
          onClose={() => setSwapping(null)}
          onPick={(n) => {
            setProfile({ plan: replaceInPlan(profile.plan, swapping.uid, n) });
            setSwapping(null);
          }}
        />
      )}
    </>
  );
}
