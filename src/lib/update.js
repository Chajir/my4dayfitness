// App updates. The app checks for a new version when it comes back on screen and every 30 minutes.
// A new version is downloaded in the background and takes over right away (same as before),
// but the screen is never reloaded on its own: an "Update" bar appears instead,
// so a workout is never interrupted. Tapping it reloads into the new version.
import { useEffect, useState } from "react";

let ready = false;
const listeners = new Set();
let started = false;

export function startUpdates() {
  if (started || !("serviceWorker" in navigator)) return;
  started = true;
  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (hadController) {
      ready = true;
      listeners.forEach((fn) => fn(true));
    }
    hadController = true;
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .then((reg) => {
        const check = () => {
          if (navigator.onLine) reg.update().catch(() => {});
        };
        setInterval(check, 30 * 60 * 1000);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
      })
      .catch(() => {});
  });
}

export function useUpdateReady() {
  const [r, setR] = useState(ready);
  useEffect(() => {
    listeners.add(setR);
    return () => {
      listeners.delete(setR);
    };
  }, []);
  return r;
}

export function applyUpdate() {
  window.location.reload();
}
