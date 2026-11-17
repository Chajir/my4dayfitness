# 4DayFit (my4dayfitness v2)

A phone-first workout app that you add to your Home Screen.

- **Build my plan:** the user enters age, height, weight, pain or injury areas, recent surgery and a few health questions, then picks Weights, Calisthenics or Cardio (any mix), a goal, a level, days per week, session length and equipment. The app builds a plan from those answers (`src/data/generator.js`).
- **Classic 4-Day Program:** a ready-made plan you can pick instead (`src/data/classic.js`).
- **Workout screen:** one exercise at a time with its photo, sets, reps and weight to log, an automatic rest timer, hold timers, interval timers and cardio timers. You can swap any exercise.
- **Tracking:** week streak, calendar, personal records, history and body weight.
- **Saving:** data is saved on the phone straight away and synced to Firebase (`fitnessApp/{uid}`). Workouts from the old app are imported automatically.

## Deploy (Vercel + GitHub)

The app is hosted on Vercel at my4dayfitness.vercel.app, and Vercel rebuilds the site from the GitHub repo.

1. Replace the contents of the GitHub repo with this folder. Delete the old `src/` and `public/` files first so no leftovers remain.
2. Commit. Vercel builds it automatically (Framework: Vite, Build: `npm run build`, Output: `dist`).
3. On your phone, open the app. It updates itself. If it still shows the old version, delete the Home Screen icon and add it again from Safari (Share → Add to Home Screen).

## Firebase: one-time setup

In the Firebase console, open project **my-fitness-workout-app**, go to **Firestore Database → Rules**, paste in the contents of `firestore.rules` and click **Publish**.
These rules make sure each user can only read and write their own data. If you skip this step, the app still works, but it saves on the phone only and shows "On phone" instead of "Synced".

Also check **Authentication → Settings → Authorized domains**. `my4dayfitness.vercel.app` must be in that list.

## Run locally

```
npm install
npm run dev            # needs Firebase login
VITE_DEMO=1 npm run dev  # preview mode: no login, data stays in the browser
```

## Exercise photos
Photos live in `src/assets/exercises/` and are matched to exercises by name. See `PHOTOS.md` for the file-name rule and a checklist of missing photos.

## Later
- **AI coach:** `generatePlan()` is a pure function, so an AI step can refine its output. That needs a small serverless function, such as a Vercel function, that keeps the API key off the phone.
- **Apple Health:** wrap the app with Capacitor as an iPhone app. That needs an Apple Developer account and a Mac with Xcode.
- **Public launch:** add a privacy policy page and a terms page, and replace any photos you don't own the rights to. Delete-account is already in the You tab.
