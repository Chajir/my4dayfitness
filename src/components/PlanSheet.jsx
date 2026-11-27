import { Icon, Sheet, ConfirmButton } from "./ui";
import { useStore } from "../lib/store";
import { nextDay, fmtDate } from "../lib/stats";
import { switchTo, removeSaved } from "../lib/plans";
import { t, planText } from "../i18n";

// "Your plans": the current plan plus saved ones. Each continues where it left off.
export default function PlanSheet({ open, onClose }) {
  const { profile, sessions, setProfile } = useStore();
  if (!open) return null;
  const last = (plan) => {
    const s = [...sessions].reverse().find((x) => x.planId === plan.id);
    return s ? fmtDate(s.startedAt) : null;
  };
  const Row = ({ plan, current }) => {
    const nd = nextDay(plan, sessions);
    const l = last(plan);
    return (
      <div className={`card p-4 ${current ? "!border-hot/40" : ""}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {current && <div className="label !text-hot mb-1">{t("Current plan")}</div>}
            <div className="font-semibold">{planText(plan.name)}</div>
            <div className="text-xs text-mute mt-1">
              {nd && t("Next: {day}", { day: `${planText(nd.label)} · ${planText(nd.title)}` })}
              {l && ` · ${t("Last workout {date}", { date: l })}`}
            </div>
          </div>
          {!current && (
            <ConfirmButton className="h-9 px-3 rounded-full bg-ink-700 text-mute text-xs shrink-0" confirmText={t("Remove?")} onConfirm={() => setProfile(removeSaved(profile, plan.id))}>
              <Icon name="x" size={14} />
            </ConfirmButton>
          )}
        </div>
        {!current && (
          <button
            className="btn-ghost w-full h-11 mt-3 text-sm"
            onClick={() => {
              setProfile(switchTo(profile, plan.id));
              onClose();
            }}
          >
            {t("Switch to this plan")}
          </button>
        )}
      </div>
    );
  };
  return (
    <Sheet open title={t("Your plans")} subtitle={t("Each plan continues where you left off. Your history stays.")} onClose={onClose}>
      <div className="space-y-2 pt-1">
        <Row plan={profile.plan} current />
        {(profile.plans || []).map((e) => (
          <Row key={e.plan.id} plan={e.plan} />
        ))}
      </div>
    </Sheet>
  );
}
