// App data: saved on the phone instantly and synced to Firebase (fitnessApp/{uid}).
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, DEMO } from "../firebase";
import { importLegacy } from "./legacy";

const Ctx = createContext(null);
const EMPTY = { profile: null, sessions: [], deleted: [], bodyLog: [] };

const localKey = (uid) => `fit:v2:${uid}`;
const loadLocal = (uid) => {
  try {
    return JSON.parse(localStorage.getItem(localKey(uid))) || null;
  } catch {
    return null;
  }
};
const saveLocal = (uid, data) => {
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(data));
  } catch {}
};

function merge(a, b) {
  if (!a) return b || EMPTY;
  if (!b) return a;
  const deleted = [...new Set([...(a.deleted || []), ...(b.deleted || [])])];
  const del = new Set(deleted);
  const byId = new Map();
  [...(a.sessions || []), ...(b.sessions || [])].forEach((s) => !del.has(s.id) && byId.set(s.id, s));
  const sessions = [...byId.values()].sort((x, y) => new Date(x.startedAt) - new Date(y.startedAt));
  const profile = (a.profile?.updatedAt || 0) >= (b.profile?.updatedAt || 0) ? a.profile : b.profile;
  const logMap = new Map();
  [...(b.bodyLog || []), ...(a.bodyLog || [])].forEach((e) => logMap.set(e.date, e));
  const bodyLog = [...logMap.values()].sort((x, y) => x.date.localeCompare(y.date));
  return { profile, sessions, deleted, bodyLog, legacyChecked: !!(a.legacyChecked || b.legacyChecked) };
}

export function StoreProvider({ user, children }) {
  const uid = user.uid;
  const [data, setData] = useState(() => loadLocal(uid) || EMPTY);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState(DEMO ? "local" : "syncing"); // syncing | ok | local
  const timer = useRef(null);

  // first load: merge phone copy with cloud copy, import old app history once
  useEffect(() => {
    let alive = true;
    (async () => {
      const local = loadLocal(uid);
      if (DEMO) {
        setReady(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "fitnessApp", uid));
        let merged = merge(local, snap.exists() ? snap.data() : null);
        if (!merged.legacyChecked) {
          const legacy = await importLegacy(uid).catch(() => []);
          if (legacy.length) merged = merge(merged, { ...EMPTY, sessions: legacy });
          merged = { ...merged, legacyChecked: true };
        }
        if (!alive) return;
        setData(merged);
        saveLocal(uid, merged);
        await setDoc(doc(db, "fitnessApp", uid), merged);
        setSync("ok");
      } catch (e) {
        console.warn("Cloud sync unavailable, using phone storage", e);
        setSync("local");
      }
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [uid]);

  // save on every change
  useEffect(() => {
    if (!ready) return;
    saveLocal(uid, data);
    if (DEMO) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, "fitnessApp", uid), JSON.parse(JSON.stringify(data)));
        setSync("ok");
      } catch (e) {
        console.warn("Cloud save failed", e);
        setSync("local");
      }
    }, 800);
  }, [data, ready, uid]);

  const update = useCallback((fn) => setData((prev) => fn(prev)), []);

  const api = {
    user,
    data,
    ready,
    sync,
    profile: data.profile,
    sessions: data.sessions,
    setProfile: (patch) => update((d) => ({ ...d, profile: { ...(d.profile || {}), ...patch, updatedAt: Date.now() } })),
    addSession: (s) => update((d) => ({ ...d, sessions: [...d.sessions, s] })),
    deleteSession: (id) => update((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id), deleted: [...(d.deleted || []), id] })),
    logBodyWeight: (date, weight) =>
      update((d) => ({ ...d, bodyLog: [...(d.bodyLog || []).filter((e) => e.date !== date), { date, weight }].sort((a, b) => a.date.localeCompare(b.date)) })),
    wipe: async () => {
      localStorage.removeItem(localKey(uid));
      localStorage.removeItem(`fit:active:${uid}`);
      if (!DEMO) await deleteDoc(doc(db, "fitnessApp", uid)).catch(() => {});
    },
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
