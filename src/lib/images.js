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
  const base = file.replace(/\.[^.]+$/, "").toLowerCase();
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

export function mediaFor(name) {
  const m = media[slug(name)];
  if (!m) return null;
  return { video: m.video || null, photos: m.photos.map((p) => p.url) };
}

export const imageFor = (name) => mediaFor(name)?.photos[0] || null;
export const hasMedia = (name) => !!media[slug(name)];

// for the photo checklist / debugging
export const allMediaNames = () => Object.keys(media);
