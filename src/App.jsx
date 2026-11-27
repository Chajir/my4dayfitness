import { Component, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, DEMO } from "./firebase";
import { StoreProvider, useStore } from "./lib/store";
import Login from "./screens/Login";
import Intake from "./screens/Intake";
import Home from "./screens/Home";
import Progress from "./screens/Progress";
import Profile from "./screens/Profile";
import Player from "./screens/Player";
import Admin from "./screens/Admin";
import { Icon } from "./components/ui";
import { LangProvider, useLang, t } from "./i18n";
import { useUpdateReady, applyUpdate } from "./lib/update";

const DEMO_USER = { uid: "demo", email: "preview@4dayfit.app" };

export default function App() {
  return (
    <LangProvider>
      <Root />
    </LangProvider>
  );
}

// key={lang}: when the language changes, screens redraw in the new language.
// Workout state lives in storage, so nothing is lost.
function Root() {
  const { lang } = useLang();
  const [user, setUser] = useState(DEMO ? DEMO_USER : undefined);
  useEffect(() => {
    if (DEMO) return;
    return onAuthStateChanged(auth, (u) => setUser(u || null));
  }, []);

  if (user === undefined) return <Splash />;
  if (!user) return <Login key={lang} />;
  return (
    <Boundary>
      <StoreProvider user={user} key={user.uid}>
        <Shell key={lang} />
      </StoreProvider>
    </Boundary>
  );
}

class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="min-h-screen grid place-items-center px-8 text-center">
        <div>
          <div className="h-display text-3xl">{t("Something went wrong")}</div>
          <p className="text-mute text-sm mt-2">{t("Your workouts are saved. Reload to continue.")}</p>
          <button className="btn-primary mt-6 w-full" onClick={() => location.reload()}>
            {t("Reload")}
          </button>
        </div>
      </div>
    );
  }
}

function Splash() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="h-display text-4xl text-white/90 animate-pulse">
        4DAY<span className="text-hot">FIT</span>
      </div>
    </div>
  );
}

const activeKey = (uid) => `fit:active:${uid}`;

function Shell() {
  const { ready, profile, user } = useStore();
  const [tab, setTab] = useState(() => sessionStorage.getItem("fit:tab") || "home");
  const [editing, setEditing] = useState(null); // null | "full" | "info"
  const updateReady = useUpdateReady();
  const [active, setActive] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(activeKey(user.uid)));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (active) localStorage.setItem(activeKey(user.uid), JSON.stringify(active));
    else localStorage.removeItem(activeKey(user.uid));
  }, [active, user.uid]);

  useEffect(() => {
    try {
      sessionStorage.setItem("fit:tab", tab);
    } catch {}
  }, [tab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, !!active, !!editing, !!profile?.plan]);

  if (!ready) return <Splash />;
  if (!profile?.plan || editing) return <Intake mode={editing} onDone={() => { setEditing(null); setTab("home"); }} onCancel={profile?.plan ? () => setEditing(null) : null} />;
  if (active) return <Player active={active} setActive={setActive} />;

  return (
    <div className="min-h-screen pb-28">
      {updateReady && (
        <div className="fixed top-0 inset-x-0 z-50 pt-safe px-4 pointer-events-none">
          <div className="max-w-md mx-auto mt-3 flex items-center gap-3 rounded-2xl bg-white text-ink pl-4 pr-1.5 py-1.5 shadow-2xl pointer-events-auto">
            <span className="flex-1 text-sm font-semibold">{t("New version ready")}</span>
            <button onClick={applyUpdate} className="h-9 px-4 rounded-xl bg-ink text-white text-sm font-semibold">
              {t("Update")}
            </button>
          </div>
        </div>
      )}
      {tab === "home" && <Home onStart={setActive} />}
      {tab === "progress" && <Progress />}
      {tab === "profile" && <Profile onEdit={setEditing} onAdmin={() => setTab("admin")} />}
      {tab === "admin" && <Admin onBack={() => setTab("profile")} />}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-ink/90 backdrop-blur-xl border-t border-white/5 pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-3">
          {[
            ["home", "home", "Today"],
            ["progress", "chart", "Progress"],
            ["profile", "user", "You"],
          ].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex flex-col items-center gap-1 pt-3 pb-1 text-[11px] font-semibold ${tab === id ? "text-white" : "text-mute"}`}>
              <Icon name={icon} size={22} className={tab === id ? "text-hot" : ""} />
              {t(label)}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
