import { useState } from "react";
import { signOut, deleteUser } from "firebase/auth";
import { auth, DEMO } from "../firebase";
import { useStore } from "../lib/store";
import { ConfirmButton, Icon, Sheet } from "../components/ui";
import { GOALS, LEVELS, STYLE_LABEL } from "../data/generator";
import { AREAS } from "../data/library";
import { cmToFtIn } from "../lib/stats";
import { equinoxPlan } from "../data/equinox";

export default function Profile({ onEdit }) {
  const { user, profile, sync, setProfile, wipe } = useStore();
  const [confirmDel, setConfirmDel] = useState(false);
  const [delText, setDelText] = useState("");
  const [err, setErr] = useState(null);
  const metric = profile.units === "metric";
  const [ft, inch] = profile.heightCm ? cmToFtIn(profile.heightCm) : [0, 0];
  const height = profile.heightCm ? (metric ? `${profile.heightCm} cm` : `${ft}′${inch}″`) : "—";
  const weight = profile.weightKg ? (metric ? `${Math.round(profile.weightKg)} kg` : `${Math.round(profile.weightKg * 2.20462)} lb`) : "—";
  const areas = (ids) => (ids || []).map((id) => AREAS.find((a) => a.id === id)?.label).join(", ");
  const preset = profile.source === "equinox";

  const deleteAccount = async () => {
    setErr(null);
    try {
      await wipe();
      if (!DEMO) await deleteUser(auth.currentUser);
      else window.location.reload();
    } catch (e) {
      setErr(e.code === "auth/requires-recent-login" ? "For security, log out, log back in, then delete again. Your workout data was already erased." : "Couldn't delete the account. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-safe">
      <h1 className="h-display text-5xl pt-4 pb-6">{profile.name || "You"}</h1>

      <section className="card divide-y divide-white/5">
        <Row label="Account" value={user.email} />
        <Row
          label="Saving"
          value={
            <span className={`flex items-center gap-1.5 ${sync === "ok" ? "text-go" : "text-mute"}`}>
              <Icon name={sync === "ok" ? "cloud" : "phone"} size={14} />
              {sync === "ok" ? "Synced to your account" : "Saved on this phone only"}
            </span>
          }
        />
      </section>
      {sync === "local" && !DEMO && <p className="text-xs text-mute mt-2 px-1">Cloud sync is off. Your workouts are safe on this phone and will sync once the connection works.</p>}

      <h3 className="label mt-8 mb-2 px-1">Your plan</h3>
      <section className="card p-4">
        <div className="font-display text-2xl font-bold uppercase">{profile.plan.name}</div>
        {!preset && (
          <div className="text-sm text-mute mt-1">
            {Object.entries(profile.styles || {})
              .filter(([, v]) => v)
              .map(([k]) => STYLE_LABEL[k])
              .join(" + ")}{" "}
            · {GOALS.find((g) => g.id === profile.goal)?.label} · {LEVELS[profile.level]} · {profile.minutes} min
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="btn-ghost text-sm" onClick={() => onEdit("full")}>
            <Icon name="edit" size={16} /> Rebuild plan
          </button>
          {preset ? (
            <button className="btn-ghost text-sm" onClick={() => onEdit("full")}>
              Build my own
            </button>
          ) : (
            <ConfirmButton className="btn-ghost text-sm" confirmText="Tap to confirm" onConfirm={() => setProfile({ source: "equinox", plan: equinoxPlan() })}>
              Use Equinox 4-Day
            </ConfirmButton>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between mt-8 mb-2 px-1">
        <h3 className="label">About you</h3>
        <button className="text-xs font-semibold text-hot" onClick={() => onEdit("info")}>
          Edit
        </button>
      </div>
      <section className="card divide-y divide-white/5">
        <Row label="Age" value={profile.age || "—"} />
        <Row label="Height" value={height} />
        <Row label="Weight" value={weight} />
        <Row label="Hurts now" value={areas(profile.pain) || "None"} />
        <Row label="Past injuries" value={areas(profile.past) || "None"} />
        {profile.parq?.surgery && <Row label="Recent surgery" value={profile.surgeryNotes || "Yes"} />}
      </section>

      <section className="card p-4 mt-4 flex gap-3">
        <Icon name="heart" className="text-hot shrink-0" />
        <div className="text-sm text-mute">
          <span className="text-white font-semibold block">Apple Health</span>
          Syncing with Apple Health comes with the iPhone app version of 4DayFit.
        </div>
      </section>

      <p className="text-xs text-mute mt-6 px-1 leading-relaxed">
        4DayFit gives general fitness guidance, not medical advice. Stop if something hurts, and check with a doctor or physical therapist about pain, injuries, surgery or health conditions.
      </p>

      <div className="space-y-2 mt-6 mb-8">
        {!DEMO && (
          <button className="btn-ghost w-full" onClick={() => signOut(auth)}>
            Log out
          </button>
        )}
        <button className="btn w-full h-12 text-hot" onClick={() => setConfirmDel(true)}>
          Delete account & data
        </button>
      </div>

      <Sheet open={confirmDel} title="Delete everything?" onClose={() => setConfirmDel(false)}>
        <p className="text-sm text-mute mb-4">This permanently erases your account, your plan, your health info and all workout history. It can't be undone.</p>
        <input className="field" placeholder='Type "DELETE" to confirm' value={delText} onChange={(e) => setDelText(e.target.value)} />
        {err && <p className="text-sm text-hot mt-3">{err}</p>}
        <button className="btn w-full h-14 mt-4 bg-hot text-white" disabled={delText !== "DELETE"} onClick={deleteAccount}>
          Permanently delete
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
