// Exercise photos live in src/assets/exercises/, named after the exercise:
// lowercase, spaces → underscores, punctuation removed.
// "Barbell Back Squat" → barbell_back_squat.jpg   "Child's Pose" → childs_pose.jpg
const files = import.meta.glob("../assets/exercises/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" });

export const slug = (name = "") =>
  name
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const bySlug = {};
for (const [path, url] of Object.entries(files)) {
  const base = path.split("/").pop().replace(/\.(jpg|jpeg|png|webp)$/i, "").toLowerCase();
  bySlug[base] = url;
}

export const imageFor = (name) => bySlug[slug(name)] || null;
