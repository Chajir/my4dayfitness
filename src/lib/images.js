// Exercise media lives in src/assets/exercises/, named after the exercise:
// lowercase, spaces → underscores, punctuation removed.
//   barbell_back_squat.jpg      main photo
//   barbell_back_squat_2.jpg    extra step photos (_2, _3, …) → shown as a flip-through
//   barbell_back_squat.mp4      short looping video (.mp4 / .mov / .webm) → shown instead of photos
// Files are found when the app is built, so a missing file can never break anything.
const files = import.meta.glob("../assets/exercises/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,mp4,mov,webm,m4v,MP4,MOV}", {
  eager: true,
  query: "?url",
  import: "default",
});

export const slug = (name = "") =>
  name
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const VIDEO = /\.(mp4|mov|webm|m4v)$/i;
const media = {}; // slug -> { video, photos: [{ n, url }] }

for (const [path, url] of Object.entries(files)) {
  const file = path.split("/").pop();
  const base = slug(file.replace(/\.[^.]+$/, ""));
  if (VIDEO.test(file)) {
    (media[base] ||= { photos: [] }).video = url;
    continue;
  }
  const m = /^(.*)_(\d{1,2})$/.exec(base);
  // "name_2.jpg" is a step photo only when it isn't itself a full exercise name
  const key = m && Number(m[2]) >= 2 ? m[1] : base;
  const n = m && Number(m[2]) >= 2 ? Number(m[2]) : 1;
  (media[key] ||= { photos: [] }).photos.push({ n, url });
}
for (const k in media) media[k].photos.sort((a, b) => a.n - b.n);

// Same exercise, different name: exercise name → photo/video file name.
const ALIASES = {
  barbell_hip_hinge: "barbell_romanian_deadlift",
  barbell_hip_hinge_rdl: "barbell_romanian_deadlift",
  dumbbell_romanian_deadlift: "barbell_romanian_deadlift",
  dumbbell_shoulder_press: "dumbbell_overhead_press",
  passive_90_90_glutes_stretch: "passive_90_90_hip_stretch",
  "90_90_hip_stretch": "passive_90_90_hip_stretch",
  passive_straight_leg_hamstrings_stretch: "passive_straight_leg_hamstring_stretch",
  straight_leg_hamstrings_stretch: "passive_straight_leg_hamstring_stretch",
  toe_touch_to_deep_squat: "toe_touch_deep_squat",
  plank: "front_plank",
  lat_pulldown: "overhand_grip_lat_pulldown",
  assisted_pull_up_machine: "overhand_grip_assisted_pull_up",
  mini_band_hip_flexion: "back_lying_mini_band_hip_flexion",
  passive_half_kneel_quads_stretch: "active_half_kneel_quads_stretch",
  incline_treadmill_walk: "treadmill_walk",
  one_arm_dumbbell_row: "bench_supported_1_arm_dumbbell_row",
  cable_triceps_pushdown: "cable_triceps_extension",
  lying_bent_knee_hamstring_stretch: "lying_bent_knee_hamstring",
  half_kneel_1_arm_landmine_press: "1_arm_landmine_press",
  "1_leg_dumbbell_hip_hinge": "1_leg_dumbbell_romanian_deadlift",
};

export function mediaFor(name) {
  const k = slug(name);
  const m = media[k] || media[ALIASES[k]];
  if (!m) return null;
  return { video: m.video || null, photos: m.photos.map((p) => p.url) };
}

export const imageFor = (name) => mediaFor(name)?.photos[0] || null;
export const hasMedia = (name) => !!(media[slug(name)] || media[ALIASES[slug(name)]]);

// for the photo checklist / debugging
export const allMediaNames = () => Object.keys(media);
