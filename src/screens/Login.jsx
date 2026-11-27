import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { t, useLang } from "../i18n";

const friendly = (code) =>
  ({
    "auth/invalid-credential": t("Email or password is incorrect."),
    "auth/wrong-password": t("Email or password is incorrect."),
    "auth/user-not-found": t("No account with that email. Tap “Create account”."),
    "auth/email-already-in-use": t("That email already has an account. Log in instead."),
    "auth/weak-password": t("Use at least 6 characters for your password."),
    "auth/invalid-email": t("That email doesn't look right."),
    "auth/too-many-requests": t("Too many tries. Wait a minute and try again."),
    "auth/network-request-failed": t("No internet connection."),
  })[code] || t("Something went wrong. Try again.");

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setMsg({ ok: true, text: t("Check your email for a reset link.") });
        setMode("login");
      } else if (mode === "login") await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setMsg({ ok: false, text: friendly(err.code) });
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-safe pb-safe max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-end pb-10 rise">
        <div className="h-16 w-16 rounded-2xl bg-brand grid place-items-center shadow-xl shadow-hot/30 mb-8">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
            <rect x="1" y="9" width="3" height="6" rx="1" />
            <rect x="4.5" y="6" width="3.5" height="12" rx="1" />
            <rect x="8" y="10.5" width="8" height="3" />
            <rect x="16" y="6" width="3.5" height="12" rx="1" />
            <rect x="20" y="9" width="3" height="6" rx="1" />
          </svg>
        </div>
        <h1 className="h-display text-6xl">
          {t("Train with")}
          <br />
          <span className="bg-brand bg-clip-text text-transparent">{t("a plan.")}</span>
        </h1>
        <p className="text-mute mt-4 text-[15px] leading-relaxed">{t("Weights, calisthenics, cardio, or any mix. Built around your body, tracked set by set.")}</p>
      </div>

      <form onSubmit={submit} className="space-y-3 pb-6 rise" style={{ animationDelay: "80ms" }}>
        {msg && <p className={`text-sm rounded-xl px-4 py-3 ${msg.ok ? "bg-go/10 text-go" : "bg-hot/10 text-hot"}`}>{msg.text}</p>}
        <input className="field" type="email" autoComplete="email" placeholder={t("Email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
        {mode !== "reset" && (
          <input
            className="field"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "signup" ? t("Create a password (6+ characters)") : t("Password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? t("One sec…") : mode === "login" ? t("Log in") : mode === "signup" ? t("Create account") : t("Send reset link")}
        </button>
        <div className="flex justify-between text-sm pt-1">
          <button type="button" className="text-white/80 font-semibold py-2" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(null); }}>
            {mode === "login" ? t("Create account") : t("I have an account")}
          </button>
          {mode === "login" && (
            <button type="button" className="text-mute py-2" onClick={() => { setMode("reset"); setMsg(null); }}>
              {t("Forgot password?")}
            </button>
          )}
        </div>
        <LangSwitch />
      </form>
    </div>
  );
}

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex justify-center gap-1 pt-2">
      {[
        ["en", "English"],
        ["es", "Español"],
      ].map(([id, label]) => (
        <button key={id} type="button" onClick={() => setLang(id)} className={`px-3 h-8 rounded-full text-xs font-semibold ${lang === id ? "bg-white text-ink" : "text-mute"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
