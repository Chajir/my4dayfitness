import { useState } from "react";
import { signOut, deleteUser } from "firebase/auth";
import { auth, DEMO } from "../firebase";
import { useStore } from "../lib/store";
import { ConfirmButton, Icon, Sheet } from "../components/ui";
import { GOALS, LEVELS, STYLE_LABEL } from "../data/generator";
import { AREAS } from "../data/library";
import { cmToFtIn } from "../lib/stats";
import { classicPlan } from "../data/classic";
import { versionLabel } from "../config";
import { varietyOn, weekIndex } from "../lib/variety";
import { t, planText, useLang } from "../i18n";

export default function Profile({ onEdit, onAdmin }) {
  const { user, profile, sync, setProfile, wipe, isOwner } = useStore();
  const { lang, setLang } = useLang();
  const [confirmDel, setConfirmDel] = useState(false);
  const [delText, setDelText] = useState("");
  const [err, setErr] = useState(null);
  const metric = profile.units === "metric";
  const [ft, inch] = profile.heightCm ? cmToFtIn(profile.heightCm) : [0, 0];
  const height = profile.heightCm ? (metric ? `${profile.heightCm} cm` : `${ft}′${inch}″`) : "—";
  const weight = profile.weightKg ? (metric ? `${Math.round(profile.weightKg)} kg` : `${Math.round(profile.weightKg * 2.20462)} lb`) : "—";
  const areas = (ids) => (ids || []).map((id) => t(AREAS.find((a) => a.id === id)?.label)).join(", ");
  const preset = profile.source === "classic";

  const deleteAccount = async () => {
    setErr(null);
    try {
      await wipe();
      if (!DEMO) await deleteUser(auth.currentUser);
      else window.location.reload();
    } catch (e) {
      setErr(e.code === "auth/requires-recent-login" ? t("For security, log out, log back in, then delete again. Your workout data was already erased.") : t("Couldn't delete the account. Try again."));
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-safe">
      <h1 className="h-display text-5xl pt-4 pb-6">{profile.name || t("You")}</h1>

      <section className="card divide-y divide-white/5">
        <Row label={t("Account")} value={user.email} />
        <Row
          label={t("Saving")}
          value={
            <span className={`flex items-center gap-1.5 ${sync === "ok" ? "text-go" : "text-mute"}`}>
              <Icon name={sync === "ok" ? "cloud" : "phone"} size={14} />
              {sync === "ok" ? t("Synced to your account") : t("Saved on this phone only")}
            </span>
          }
        />
      </section>
      {sync === "local" && !DEMO && <p className="text-xs text-mute mt-2 px-1">{t("Cloud sync is off. Your workouts are safe on this phone and will sync once the connection works.")}</p>}

      {isOwner && (
        <button onClick={onAdmin} className="w-full mt-4 rounded-2xl p-[1.5px] bg-brand text-left">
          <span className="flex items-center gap-3 rounded-[calc(1rem-1.5px)] bg-ink-900 px-4 py-3.5">
            <Icon name="chart" className="text-hot" />
            <span className="flex-1">
              <span className="block font-semibold">{t("Owner dashboard")}</span>
              <span className="text-xs text-mute">{t("Users, workouts, hours, plans and devices")}</span>
            </span>
            <Icon name="right" size={18} className="text-mute" />
          </span>
        </button>
      )}

      <h3 className="label mt-8 mb-2 px-1">{t("Language")}</h3>
      <section className="card p-1.5 grid grid-cols-2 gap-1">
        {[
          ["en", "English"],
          ["es", "Español"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setLang(id)} className={`h-11 rounded-xl text-sm font-semibold transition ${lang === id ? "bg-white text-ink" : "text-mute"}`}>
            {label}
          </button>
        ))}
      </section>

      <h3 className="label mt-8 mb-2 px-1">{t("Your plan")}</h3>
      <section className="card p-4">
        <div className="font-display text-2xl font-bold uppercase">{planText(profile.plan.name)}</div>
        {!preset && (
          <div className="text-sm text-mute mt-1">
            {Object.entries(profile.styles || {})
              .filter(([, v]) => v)
              .map(([k]) => t(STYLE_LABEL[k]))
              .join(" + ")}{" "}
            · {t(GOALS.find((g) => g.id === profile.goal)?.label)} · {t(LEVELS[profile.level])} · {profile.minutes} min
          </div>
        )}
        {preset ? (
          <>
            <button className="btn-ghost w-full text-sm mt-4" onClick={() => onEdit("custom")}>
              <Icon name="edit" size={16} /> {t("Switch to a personalized plan")}
            </button>
            <p className="text-xs text-mute mt-2">{t("Answer a few questions (style, goal, days, equipment) and the app builds a plan for you. Your history stays.")}</p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="btn-ghost text-sm" onClick={() => onEdit("full")}>
                <Icon name="edit" size={16} /> {t("Change answers")}
              </button>
              <ConfirmButton className="btn-ghost text-sm" confirmText={t("Tap to confirm")} onConfirm={() => setProfile({ source: "classic", plan: classicPlan() })}>
                {t("Use Classic 4-Day")}
              </ConfirmButton>
            </div>
            <p className="text-xs text-mute mt-2">{t("Change your style, goal, days or equipment and the app rebuilds your plan. You see it before it's saved. Your history stays.")}</p>
          </>
        )}
      </section>

      <button onClick={() => setProfile({ variety: !varietyOn(profile) })} className="w-full card p-4 mt-2 flex items-center gap-4 text-left">
        <span className="flex-1">
          <span className="block font-semibold">{t("Exercise variety")}</span>
          <span className="block text-xs text-mute mt-0.5 leading-relaxed">
            {varietyOn(profile)
              ? t("On · week {n} of your plan. Accessories, warm-ups and cardio change weekly; main lifts every 4 weeks. Exercises you swap yourself stay.", { n: weekIndex(profile.plan) + 1 })
              : t("Off · the same exercises every week.")}
          </span>
        </span>
        <span className={`w-12 h-7 shrink-0 rounded-full p-1 transition ${varietyOn(profile) ? "bg-hot" : "bg-ink-600"}`}>
          <span className={`block h-5 w-5 rounded-full bg-white transition ${varietyOn(profile) ? "translate-x-5" : ""}`} />
        </span>
      </button>

      <div className="flex items-center justify-between mt-8 mb-2 px-1">
        <h3 className="label">{t("About you")}</h3>
        <button className="text-xs font-semibold text-hot" onClick={() => onEdit("info")}>
          {t("Edit")}
        </button>
      </div>
      <section className="card divide-y divide-white/5">
        <Row label={t("Age")} value={profile.age || "—"} />
        <Row label={t("Height")} value={height} />
        <Row label={t("Weight")} value={weight} />
        <Row label={t("Hurts now")} value={areas(profile.pain) || t("None")} />
        <Row label={t("Past injuries")} value={areas(profile.past) || t("None")} />
        {profile.parq?.surgery && <Row label={t("Recent surgery")} value={profile.surgeryNotes || t("Yes")} />}
      </section>

      <section className="card p-4 mt-4 flex gap-3">
        <Icon name="heart" className="text-hot shrink-0" />
        <div className="text-sm text-mute">
          <span className="text-white font-semibold block">Apple Health</span>
          {t("Syncing with Apple Health comes with the iPhone app version of 4DayFit.")}
        </div>
      </section>

      <p className="text-xs text-mute mt-6 px-1 leading-relaxed">
        {t("4DayFit gives general fitness guidance, not medical advice. Stop if something hurts, and check with a doctor or physical therapist about pain, injuries, surgery or health conditions.")}
      </p>

      <div className="space-y-2 mt-6 mb-8">
        {!DEMO && (
          <button className="btn-ghost w-full" onClick={() => signOut(auth)}>
            {t("Log out")}
          </button>
        )}
        <button className="btn w-full h-12 text-hot" onClick={() => setConfirmDel(true)}>
          {t("Delete account & data")}
        </button>
      </div>

      <p className="text-center text-xs text-mute/70 pb-8">{versionLabel()}</p>

      <Sheet open={confirmDel} title={t("Delete everything?")} onClose={() => setConfirmDel(false)}>
        <p className="text-sm text-mute mb-4">{t("This permanently erases your account, your plan, your health info and all workout history. It can't be undone.")}</p>
        <input className="field" placeholder={t('Type "DELETE" to confirm')} value={delText} onChange={(e) => setDelText(e.target.value)} />
        {err && <p className="text-sm text-hot mt-3">{err}</p>}
        <button className="btn w-full h-14 mt-4 bg-hot text-white" disabled={delText !== "DELETE"} onClick={deleteAccount}>
          {t("Permanently delete")}
        </button>
      </Sheet>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="text-sm text-mute shrink-0">{label}</span>
      <span className="text-sm text-right truncate">{value}</span>
    </div>
  );
}
