// Beep, vibrate, keep-screen-on helpers.
let ctx;
export function beep(times = 1) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = i === times - 1 ? 1046 : 784;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.22;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.start(t);
      o.stop(t + 0.2);
    }
  } catch {}
  try {
    navigator.vibrate?.(times > 1 ? [120, 80, 220] : 150);
  } catch {}
}

// iOS needs a user tap before audio can play; call this from a button
export function unlockAudio() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch {}
}

let lock;
export async function keepAwake(on) {
  try {
    if (on && "wakeLock" in navigator) lock = await navigator.wakeLock.request("screen");
    else if (!on && lock) {
      await lock.release();
      lock = null;
    }
  } catch {}
}
