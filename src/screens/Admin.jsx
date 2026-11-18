// Owner dashboard: reads the usage summaries in stats/* (no health info).
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, DEMO } from "../firebase";
import { Icon } from "../components/ui";
import { APP_VERSION, versionLabel } from "../config";
import { startOfWeek, dayKey, fmtDate } from "../lib/stats";
import { GOALS, LEVELS, STYLE_LABEL } from "../data/generator";

const DAY = 86400000;

function ago(iso) {
  if (!iso) return "never";
  const d = (Date.now() - new Date(iso)) / DAY;
  if (d < 1 / 24) return "just now";
  if (d < 1) return `${Math.round(d * 24)}h ago`;
  if (d < 30) return `${Math.round(d)}d ago`;
  return fmtDate(iso, { month: "short", day: "numeric" });
}

export default function Admin({ onBack }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState(null);
  const [metric, setMetric] = useState("w"); // w = workouts, h = hours
  const [loadedAt, setLoadedAt] = useState(null);

  const load = async () => {
    setErr(null);
    try {
      if (DEMO) setRows(demoRows());
      else {
        const snap = await getDocs(collection(db, "stats"));
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
      setLoadedAt(new Date());
    } catch (e) {
      setErr(e.code === "permission-denied" ? "Access denied. Check that your user ID is in the Firestore “owners” collection and that the latest rules are published." : "Couldn't load the numbers. Check your connection and try again.");
    }
  };
  useEffect(() => {
    load();
  }, []);

  const k = useMemo(() => (rows ? crunch(rows) : null), [rows]);

  return (
    <div className="max-w-md mx-auto px-5 pt-safe pb-10">
      <header className="flex items-center gap-2 pt-2 pb-4">
        <button onClick={onBack} className="h-10 w-10 -ml-2 grid place-items-center text-mute" aria-label="Back">
          <Icon name="left" />
        </button>
        <div className="flex-1">
          <div className="label !text-hot">Owner</div>
          <h1 className="h-display text-4xl">Dashboard</h1>
        </div>
        <button onClick={load} className="h-10 px-3 rounded-full bg-ink-700 text-xs font-semibold text-mute">
          Refresh
        </button>
      </header>

      {err && <div className="rounded-2xl bg-hot/10 text-hot text-sm px-4 py-3">{err}</div>}
      {!rows && !err && <div className="text-mute text-sm py-10 text-center">Loading…</div>}

      {k && (
        <div className="space-y-4 rise">
          <div className="grid grid-cols-2 gap-2">
            <Tile label="Accounts" value={k.accounts} sub={`${k.withPlan} set up a plan`} />
            <Tile label="Active this week" value={k.active7} sub={`${k.active30} this month`} />
            <Tile label="Workouts logged" value={k.workouts.toLocaleString()} sub={`${k.workouts7} this week`} />
            <Tile label="Hours trained" value={k.hours.toLocaleString()} sub={`${k.hours7} this week`} />
            <Tile label="New this month" value={k.newThisMonth} sub="accounts" />
            <Tile label="On latest version" value={`${k.latest}/${k.accounts}`} sub={`v${APP_VERSION.replace(/\.0$/, "")}`} />
          </div>

          <section className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="label">Per week · all users</div>
                <div className="font-semibold mt-0.5">{metric === "w" ? "Workouts" : "Hours trained"}, last 12 weeks</div>
              </div>
              <div className="flex rounded-full bg-ink-900 p-1 text-xs font-semibold">
                {[
                  ["w", "Workouts"],
                  ["h", "Hours"],
                ].map(([id, l]) => (
                  <button key={id} onClick={() => setMetric(id)} className={`px-3 h-8 rounded-full ${metric === id ? "bg-white text-ink" : "text-mute"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <WeekBars weeks={k.weeks} metric={metric} />
          </section>

          <Breakdown title="Plans" items={k.plans} total={k.accounts} />
          {k.styles.length > 0 && <Breakdown title="Training styles (personalized plans)" items={k.styles} total={k.personalized} />}
          {k.goals.length > 0 && <Breakdown title="Goals" items={k.goals} total={k.personalized} />}
          {k.levels.length > 0 && <Breakdown title="Experience" items={k.levels} total={k.personalized} />}
          <Breakdown title="Devices" items={k.devices} total={k.accounts} note={`${k.installed} of ${k.accounts} added it to their Home Screen`} />
          <Breakdown title="App versions" items={k.versions} total={k.accounts} />

          <section>
            <h3 className="h-display text-2xl mb-2 mt-6">Users</h3>
            <div className="space-y-2">
              {k.users.map((u) => (
                <div key={u.id} className="card px-4 py-3">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{u.name || u.account || "Unnamed"}</div>
                      {u.name && <div className="text-xs text-mute truncate">{u.account}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm">{ago(u.lastActive)}</div>
                      <div className="text-[11px] text-mute">last active</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-mute">
                    <span>
                      <span className="text-white/85">{u.workouts || 0}</span> workouts
                    </span>
                    <span>
                      <span className="text-white/85">{Math.round((u.totalMinutes || 0) / 6) / 10}</span> h
                    </span>
                    <span>{u.hasPlan ? (u.planSource === "classic" ? "Classic 4-Day" : u.planName) : "No plan yet"}</span>
                    <span>
                      {u.device}
                      {u.installed ? " · Home Screen" : ""}
                    </span>
                    <span>v{(u.appVersion || "?").replace(/\.0$/, "")}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className="text-xs text-mute leading-relaxed pt-2">
            Health answers (pain, surgeries, health questions) and body measurements are never shown here. They stay private to each user. An account appears here after it opens version 2.4 or later at least once. The full sign-up list is in Firebase → Authentication.
            {loadedAt && ` Updated ${loadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`}
          </p>
          <p className="text-xs text-mute">{versionLabel()}</p>
        </div>
      )}
    </div>
  );
}

function crunch(rows) {
  const now = Date.now();
  const within = (iso, days) => iso && now - new Date(iso) < days * DAY;
  const thisWeek = dayKey(startOfWeek(new Date()));
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const d = startOfWeek(new Date());
    d.setDate(d.getDate() - 7 * (11 - i));
    return { key: dayKey(d), date: d, w: 0, min: 0 };
  });
  const idx = Object.fromEntries(weeks.map((w, i) => [w.key, i]));
  const count = (arr) =>
    Object.entries(arr.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {}))
      .map(([label, n]) => ({ label, n }))
      .sort((a, b) => b.n - a.n);

  rows.forEach((r) =>
    Object.entries(r.weekly || {}).forEach(([k, v]) => {
      if (idx[k] !== undefined) {
        weeks[idx[k]].w += v.w || 0;
        weeks[idx[k]].min += v.min || 0;
      }
    })
  );
  const personalized = rows.filter((r) => r.hasPlan && r.planSource !== "classic");
  const m = new Date();
  return {
    accounts: rows.length,
    withPlan: rows.filter((r) => r.hasPlan).length,
    active7: rows.filter((r) => within(r.lastActive, 7)).length,
    active30: rows.filter((r) => within(r.lastActive, 30)).length,
    workouts: rows.reduce((a, r) => a + (r.workouts || 0), 0),
    workouts7: rows.reduce((a, r) => a + (r.weekly?.[thisWeek]?.w || 0), 0),
    hours: Math.round(rows.reduce((a, r) => a + (r.totalMinutes || 0), 0) / 6) / 10,
    hours7: Math.round(rows.reduce((a, r) => a + (r.weekly?.[thisWeek]?.min || 0), 0) / 6) / 10,
    newThisMonth: rows.filter((r) => r.joinedAt && new Date(r.joinedAt).getMonth() === m.getMonth() && new Date(r.joinedAt).getFullYear() === m.getFullYear()).length,
    latest: rows.filter((r) => r.appVersion === APP_VERSION).length,
    installed: rows.filter((r) => r.installed).length,
    weeks,
    personalized: personalized.length,
    plans: count(rows.map((r) => (!r.hasPlan ? "No plan yet" : r.planSource === "classic" ? "Classic 4-Day" : "Personalized"))),
    styles: count(personalized.flatMap((r) => r.styles || []).map((s) => STYLE_LABEL[s] || s)),
    goals: count(personalized.map((r) => GOALS.find((g) => g.id === r.goal)?.label).filter(Boolean)),
    levels: count(personalized.map((r) => LEVELS[r.level]).filter(Boolean)),
    devices: count(rows.map((r) => r.device || "Unknown")),
    versions: count(rows.map((r) => `v${(r.appVersion || "older").replace(/\.0$/, "")}`)),
    users: [...rows].sort((a, b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0)),
  };
}

function Tile({ label, value, sub }) {
  return (
    <div className="card p-4">
      <div className="label">{label}</div>
      <div className="font-display text-4xl font-bold mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-mute mt-0.5">{sub}</div>}
    </div>
  );
}

function WeekBars({ weeks, metric }) {
  const [sel, setSel] = useState(null);
  const vals = weeks.map((w) => (metric === "w" ? w.w : Math.round(w.min / 6) / 10));
  const max = Math.max(1, ...vals);
  const H = 140;
  const shown = sel ?? weeks.length - 1;
  return (
    <div className="mt-4">
      <div className="text-sm mb-2 h-5">
        <span className="font-semibold tabular-nums">{vals[shown]}</span>
        <span className="text-mute">
          {" "}
          {metric === "w" ? "workouts" : "hours"} · week of {fmtDate(weeks[shown].date, { month: "short", day: "numeric" })}
        </span>
      </div>
      <div className="relative" style={{ height: H }}>
        {[0.5, 1].map((f) => (
          <div key={f} className="absolute inset-x-0 border-t border-white/5" style={{ bottom: H * f - 1 }} />
        ))}
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {weeks.map((w, i) => (
            <button
              key={w.key}
              className="flex-1 h-full flex items-end"
              onClick={() => setSel(i)}
              onMouseEnter={() => setSel(i)}
              onMouseLeave={() => setSel(null)}
              aria-label={`Week of ${fmtDate(w.date, { month: "short", day: "numeric" })}: ${vals[i]}`}
            >
              <span
                className={`w-full rounded-t-[4px] transition-colors ${i === shown ? "bg-hot" : "bg-hot/45"}`}
                style={{ height: vals[i] ? Math.max(3, (vals[i] / max) * H) : 2, opacity: vals[i] ? 1 : 0.25 }}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-mute mt-1.5">
        <span>{fmtDate(weeks[0].date, { month: "short", day: "numeric" })}</span>
        <span>This week</span>
      </div>
    </div>
  );
}

function Breakdown({ title, items, total, note }) {
  if (!items.length) return null;
  return (
    <section className="card p-4">
      <div className="label mb-3">{title}</div>
      <div className="space-y-2.5">
        {items.map((it) => (
          <div key={it.label}>
            <div className="flex justify-between text-sm">
              <span>{it.label}</span>
              <span className="text-mute tabular-nums">
                {it.n}
                {total ? ` · ${Math.round((it.n / total) * 100)}%` : ""}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-700 mt-1 overflow-hidden">
              <div className="h-full rounded-full bg-hot" style={{ width: `${total ? (it.n / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
      {note && <div className="text-xs text-mute mt-3">{note}</div>}
    </section>
  );
}

// Fake numbers for the preview build only
function demoRows() {
  const names = ["Chajir", "Andrea", "Kaiser", "Gabriel", "Maria", "Luis", "Sofia", "Diego"];
  const wk = (n) => {
    const d = startOfWeek(new Date());
    d.setDate(d.getDate() - 7 * n);
    return dayKey(d);
  };
  return names.map((name, i) => {
    const weekly = {};
    let workouts = 0,
      minutes = 0;
    for (let n = 0; n < 12; n++) {
      const w = Math.max(0, Math.round(((i * 7 + n * 3) % 5) - (i > 5 ? 2 : 0)));
      if (w) {
        weekly[wk(n)] = { w, min: w * (45 + ((i * 11) % 25)) };
        workouts += w;
        minutes += w * (45 + ((i * 11) % 25));
      }
    }
    return {
      id: `demo${i}`,
      name,
      account: `${name.toLowerCase()}@example.com`,
      joinedAt: new Date(Date.now() - (i * 9 + 3) * DAY).toISOString(),
      lastActive: new Date(Date.now() - (i * i * 0.7 + 0.1) * DAY).toISOString(),
      appVersion: i < 5 ? APP_VERSION : "2.3.0",
      device: ["iPhone", "iPhone", "Android", "iPhone", "Computer", "iPhone", "Android", "iPhone"][i],
      installed: i % 3 !== 2,
      hasPlan: i !== 7,
      planSource: i === 0 ? "classic" : i === 7 ? "" : "generated",
      planName: i === 0 ? "Classic 4-Day Program" : ["", "", "Calisthenics + Cardio · 3 days", "Weights + Cardio · 4 days", "Calisthenics · 3 days", "Weights · 5 days", "Cardio · 3 days", ""][i],
      styles: [[], ["cali", "cardio"], ["cali", "cardio"], ["weights", "cardio"], ["cali"], ["weights"], ["cardio"], []][i],
      goal: ["", "fat_loss", "fat_loss", "muscle", "strength", "muscle", "endurance", ""][i],
      level: [null, 0, 1, 1, 2, 1, 0, null][i],
      workouts,
      totalMinutes: minutes,
      weekly,
    };
  });
}
