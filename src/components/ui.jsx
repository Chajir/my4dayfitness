import { useEffect, useState } from "react";
import { imageFor } from "../lib/images";

const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const paths = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  play: <path d="M7 4v16l13-8z" fill="currentColor" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  left: <path d="M15 5l-7 7 7 7" />,
  right: <path d="M9 5l7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  swap: <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  flame: <path d="M12 22c4 0 7-2.7 7-7 0-3.5-2.5-6-4-8 0 2.5-1.5 4-3 4 0-3-1-6-4-9 0 4-4 7-4 12 0 4.5 3.5 8 8 8z" />,
  trophy: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" /></>,
  skip: <path d="M5 5v14l10-7zM19 5v14" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  cloud: <path d="M7 18a5 5 0 1 1 1.5-9.8A6 6 0 0 1 20 11a4 4 0 0 1-1 7.9z" />,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  heart: <path d="M12 20s-7-4.5-9.3-9.2C1 7.3 3.2 4 6.6 4c2 0 3.5 1.1 5.4 3 1.9-1.9 3.4-3 5.4-3 3.4 0 5.6 3.3 3.9 6.8C19 15.5 12 20 12 20z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />,
  pause: <path d="M8 5v14M16 5v14" />,
};
export function Icon({ name, size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...P} aria-hidden>
      {paths[name]}
    </svg>
  );
}

export function Stepper({ value, onChange, step = 1, min = 0, unit, wide }) {
  const v = Number(value) || 0;
  return (
    <div className={`flex items-center rounded-xl bg-ink-900 border border-white/10 h-12 ${wide ? "w-40" : "w-32"}`}>
      <button className="w-10 h-full grid place-items-center text-mute active:text-white" onClick={() => onChange(Math.max(min, +(v - step).toFixed(2)))} aria-label="less">
        <Icon name="minus" size={18} />
      </button>
      <label className="flex-1 flex items-baseline justify-center gap-1 min-w-0">
        <input
          type="number"
          inputMode="decimal"
          className="w-full bg-transparent text-center text-lg font-semibold outline-none min-w-0"
          value={value === "" ? "" : v}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
        {unit && <span className="text-[11px] text-mute -ml-1 shrink-0">{unit}</span>}
      </label>
      <button className="w-10 h-full grid place-items-center text-mute active:text-white" onClick={() => onChange(+(v + step).toFixed(2))} aria-label="more">
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}

export function Sheet({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative sheet-in max-h-[88vh] overflow-y-auto rounded-t-3xl bg-ink-800 border-t border-white/10 pb-safe">
        <div className="sticky top-0 bg-ink-800 px-5 pt-3 pb-3 flex items-start justify-between gap-3 z-10">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-1 w-10 rounded-full bg-white/20" />
          <div className="mt-2 min-w-0">
            <h3 className="h-display text-2xl">{title}</h3>
            {subtitle && <div className="text-sm text-mute mt-1">{subtitle}</div>}
          </div>
          <button onClick={onClose} className="mt-2 h-9 w-9 shrink-0 grid place-items-center rounded-full bg-ink-700 text-mute">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 pb-4">{children}</div>
      </div>
    </div>
  );
}

const GLYPH = { cardio: "♥", mobility: "∞", cali: "◆", weights: "▲" };
export function Thumb({ item, className = "" }) {
  const [err, setErr] = useState(false);
  const src = imageFor(item.name);
  if (src && !err) return <img src={src} alt="" onError={() => setErr(true)} className={`object-cover bg-ink-700 ${className}`} loading="lazy" />;
  const initials = item.name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div className={`relative overflow-hidden bg-ink-700 grid place-items-center ${className}`}>
      <div className="absolute inset-0 opacity-30 bg-brand" style={{ maskImage: "radial-gradient(circle at 80% 10%, black, transparent 70%)", WebkitMaskImage: "radial-gradient(circle at 80% 10%, black, transparent 70%)" }} />
      <span className="absolute right-2 top-1 text-white/20 text-lg">{GLYPH[item.m] || "◆"}</span>
      <span className="font-display font-bold text-white/80 text-[1.6em] tracking-wide">{initials}</span>
    </div>
  );
}

export function Chip({ active, onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 h-11 rounded-full text-sm font-semibold border transition-transform active:scale-95 ${active ? "bg-white text-ink border-white" : "bg-ink-800 text-white/80 border-white/10"} ${className}`}
    >
      {children}
    </button>
  );
}

export function Toast({ text }) {
  const [show, setShow] = useState(!!text);
  useEffect(() => {
    if (!text) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, [text]);
  if (!show || !text) return null;
  return <div className="fixed left-1/2 -translate-x-1/2 bottom-28 z-[60] rounded-full bg-white text-ink px-4 py-2 text-sm font-semibold shadow-xl rise">{text}</div>;
}

// Two-tap confirm (works everywhere, unlike window.confirm)
export function ConfirmButton({ children, confirmText, onConfirm, className = "" }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button className={`${className} ${armed ? "!bg-hot !text-white" : ""}`} onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}>
      {armed ? confirmText : children}
    </button>
  );
}
