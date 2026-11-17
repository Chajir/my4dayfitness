import { useState } from "react";
import { Icon, Sheet, Thumb } from "./ui";
import { estMinutes, targetText } from "../lib/stats";
import { alternativesFor, swapItem } from "../data/generator";
import { useStore } from "../lib/store";

export function replaceInPlan(plan, uid, newItem) {
  return {
    ...plan,
    days: plan.days.map((d) => ({ ...d, sections: d.sections.map((s) => ({ ...s, items: s.items.map((it) => (it.uid === uid ? newItem : it)) })) })),
  };
}

export function SwapSheet({ item, onPick, onClose }) {
  const { profile } = useStore();
  if (!item) return null;
  const alts = alternativesFor(item, profile?.source === "equinox" ? { ...profile, equipment: "gym" } : profile);
  return (
    <Sheet open title="Swap exercise" onClose={onClose}>
      <p className="text-sm text-mute -mt-1 mb-4">
        Replacing <span className="text-white">{item.name}</span>. Same movement, different exercise.
      </p>
      {!alts.length && <p className="text-sm text-mute">No alternatives for this one.</p>}
      <div className="space-y-2">
        {alts.map(({ ex, ok }) => (
          <button key={ex.id} onClick={() => onPick(swapItem(item, ex, profile))} className={`w-full flex items-center gap-3 p-2 rounded-xl text-left active:bg-ink-700 ${ok ? "" : "opacity-50"}`}>
            <Thumb item={ex} className="h-12 w-16 rounded-lg text-xs shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{ex.name}</div>
              <div className="text-xs text-mute">
                {{ weights: "Weights", cali: "Calisthenics", cardio: "Cardio", mobility: "Mobility" }[ex.m]}
                {!ok && " · not ideal for your equipment or pain areas"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export default function DaySheet({ day, onClose, onStart }) {
  const { profile, setProfile } = useStore();
  const [swapping, setSwapping] = useState(null);
  if (!day) return null;
  const live = profile.plan.days.find((d) => d.id === day.id) || day;
  return (
    <>
      <Sheet open title={live.title} onClose={onClose}>
        <div className="text-sm text-mute -mt-2 mb-4">
          {live.label} · {live.tag} · ~{estMinutes(live)} min
        </div>
        <div className="space-y-5">
          {live.sections.map((s) => (
            <div key={s.name}>
              <div className="label mb-2">{s.name}</div>
              <div className="space-y-1">
                {s.items.map((it) => (
                  <div key={it.uid} className="flex items-center gap-3 py-1">
                    <Thumb item={it} className="h-12 w-16 rounded-lg text-xs shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-tight">{it.name}</div>
                      <div className="text-xs text-mute mt-0.5">{targetText(it)}</div>
                    </div>
                    <button onClick={() => setSwapping(it)} className="h-9 w-9 grid place-items-center rounded-full bg-ink-700 text-mute shrink-0" aria-label="Swap">
                      <Icon name="swap" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="btn-primary w-full mt-6" onClick={() => onStart(live)}>
          <Icon name="play" size={16} /> Start workout
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
