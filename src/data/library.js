// Exercise library used by the plan generator.
// m = modality: weights | cali | cardio | mobility
// p = movement pattern, eq = equipment needed (any one of), s = joints it stresses,
// lv = [minLevel, maxLevel] (0 beginner, 1 intermediate, 2 advanced)
// kind = reps | hold | interval | cardio

const IMG = (f) => `${import.meta.env?.BASE_URL || "/"}images/exercises/${f}.jpg`;

const L = [];
const add = (id, name, o) => L.push({ id, name, kind: "reps", s: [], lv: [0, 2], ...o });

/* ---------------- WEIGHTS ---------------- */
// squat
add("bb-back-squat", "Barbell Back Squat", { m: "weights", p: "squat", eq: ["gym"], s: ["knees", "hips", "lowerback"], lv: [1, 2], compound: true, cue: "Brace, sit between your hips, drive the floor away." });
add("goblet-squat", "Goblet Squat", { m: "weights", p: "squat", eq: ["db"], s: ["knees", "hips"], compound: true, cue: "Hold the bell at your chest, elbows inside knees at the bottom." });
add("leg-press", "Leg Press", { m: "weights", p: "squat", eq: ["gym"], s: ["knees"], compound: true, cue: "Lower until hips start to tuck, then press through mid-foot." });
add("kb-lateral-squat", "Kettlebell Front Rack Lateral Squat", { m: "weights", p: "squat", eq: ["db"], s: ["knees", "hips"], lv: [1, 2], perSide: true, cue: "Sit back into one hip, other leg straight." });
// hinge
add("bb-deadlift", "Barbell Deadlift", { m: "weights", p: "hinge", eq: ["gym"], s: ["lowerback", "hips"], lv: [1, 2], compound: true, img: IMG("barbell_deadlift"), cue: "Bar over mid-foot, push the floor away, lock out with glutes." });
add("bb-rdl", "Barbell Hip Hinge (RDL)", { m: "weights", p: "hinge", eq: ["gym"], s: ["lowerback", "hips"], lv: [1, 2], compound: true, cue: "Soft knees, push hips back until hamstrings stretch." });
add("db-rdl", "Dumbbell Romanian Deadlift", { m: "weights", p: "hinge", eq: ["db"], s: ["lowerback", "hips"], compound: true, cue: "Dumbbells slide down your thighs, flat back." });
add("hip-thrust", "Barbell Hip Thrust", { m: "weights", p: "hinge", eq: ["gym"], s: ["hips"], compound: true, cue: "Chin tucked, ribs down, squeeze glutes at the top." });
add("kb-swing", "Kettlebell Swing", { m: "weights", p: "hinge", eq: ["db"], s: ["lowerback", "hips"], lv: [1, 2], img: IMG("kettlebell_swing"), cue: "Snap the hips; arms just guide the bell." });
// lunge
add("kb-bulgarian", "Kettlebell Goblet Bulgarian Split Squat", { m: "weights", p: "lunge", eq: ["db"], s: ["knees", "hips"], lv: [1, 2], perSide: true, img: IMG("kettlebell_goblet_bulgarian_split_squat"), cue: "Rear foot on bench, front knee tracks over toes." });
add("db-reverse-lunge", "Dumbbell Reverse Lunge", { m: "weights", p: "lunge", eq: ["db"], s: ["knees"], perSide: true, cue: "Step back, lower the back knee softly." });
add("db-step-up", "Dumbbell Step-Up", { m: "weights", p: "lunge", eq: ["db"], s: ["knees"], perSide: true, cue: "Drive through the heel of the top leg." });
add("sl-db-hinge", "1 Leg Dumbbell Hip Hinge", { m: "weights", p: "lunge", eq: ["db"], s: ["hips", "lowerback", "ankles"], lv: [1, 2], perSide: true, cue: "Hips square, reach the back leg long." });
// horizontal push
add("bb-bench", "Barbell Bench Press", { m: "weights", p: "hpush", eq: ["gym"], s: ["shoulders", "elbows", "wrists"], lv: [1, 2], compound: true, img: IMG("barbell_bench_press"), cue: "Shoulder blades pinned, bar to lower chest." });
add("db-bench", "Dumbbell Bench Press", { m: "weights", p: "hpush", eq: ["db"], s: ["shoulders", "elbows"], compound: true, cue: "Elbows about 45° from your body." });
add("db-incline", "Dumbbell Incline Bench Press", { m: "weights", p: "hpush", eq: ["db"], s: ["shoulders"], compound: true, cue: "Bench at 30°, press up and slightly in." });
add("machine-press", "Machine Chest Press", { m: "weights", p: "hpush", eq: ["gym"], s: ["shoulders"], lv: [0, 1], compound: true, cue: "Controlled down, smooth press." });
// vertical push
add("db-shoulder-press", "Dumbbell Shoulder Press", { m: "weights", p: "vpush", eq: ["db"], s: ["shoulders", "elbows"], compound: true, cue: "Ribs down, press overhead, don't arch." });
add("landmine-press", "Half Kneel 1-Arm Landmine Press", { m: "weights", p: "vpush", eq: ["gym"], s: [], perSide: true, cue: "Squeeze the down-knee glute, press up and forward." });
add("bb-ohp", "Barbell Overhead Press", { m: "weights", p: "vpush", eq: ["gym"], s: ["shoulders", "lowerback"], lv: [1, 2], compound: true, cue: "Glutes tight, head through at the top." });
// horizontal pull
add("cable-row-1arm", "1 Arm Seated Cable Row", { m: "weights", p: "hpull", eq: ["gym"], s: ["elbows"], perSide: true, img: IMG("1_arm_seated_cable_row"), cue: "Pull elbow to hip, don't twist." });
add("db-bent-row", "Alternating Dumbbell Bent Over Row", { m: "weights", p: "hpull", eq: ["db"], s: ["lowerback"], cue: "Hinge to ~45°, row toward your pocket." });
add("db-row-1arm", "One-Arm Dumbbell Row", { m: "weights", p: "hpull", eq: ["db"], s: [], perSide: true, cue: "Hand on bench, flat back, elbow to hip." });
add("chest-supported-row", "Chest-Supported Dumbbell Row", { m: "weights", p: "hpull", eq: ["db"], s: [], cue: "Chest on incline bench, squeeze shoulder blades." });
// vertical pull
add("lat-pulldown", "Lat Pulldown", { m: "weights", p: "vpull", eq: ["gym"], s: ["shoulders", "elbows"], compound: true, cue: "Pull the bar to upper chest, elbows down." });
add("assisted-pullup", "Assisted Pull-Up Machine", { m: "weights", p: "vpull", eq: ["gym"], s: ["shoulders", "elbows"], lv: [0, 1], cue: "Full hang to chin over bar." });
// arms
add("db-curl", "Dumbbell Biceps Curl", { m: "weights", p: "arms", eq: ["db"], s: ["elbows"], cue: "Elbows pinned, no swinging." });
add("db-triceps-ext", "Lying Dumbbell Triceps Extension", { m: "weights", p: "arms", eq: ["db"], s: ["elbows"], img: IMG("lying_dumbbell_triceps_extension"), cue: "Elbows point up, lower behind the head." });
add("cable-pushdown", "Cable Triceps Pushdown", { m: "weights", p: "arms", eq: ["gym"], s: ["elbows"], cue: "Elbows at your sides, full lockout." });
// core / carry / calves (weighted)
add("pallof", "Cable Pallof Press", { m: "weights", p: "core", eq: ["gym"], s: [], perSide: true, cue: "Press straight out, resist the twist." });
add("farmer-carry", "1 Arm Kettlebell Farmer's Carry", { m: "weights", p: "core", eq: ["db"], s: [], kind: "hold", perSide: true, cue: "Walk tall, don't lean toward the bell." });
add("ball-rollout", "Stability Ball Trunk Rollout", { m: "weights", p: "core", eq: ["gym"], s: ["lowerback"], img: IMG("stability_ball_trunk_rollout"), weightless: true, cue: "Roll out only as far as your low back stays flat." });
add("db-calf-raise", "Dumbbell Calf Raise", { m: "weights", p: "calves", eq: ["db"], s: ["ankles"], cue: "Full stretch at the bottom, pause at the top." });

/* ---------------- CALISTHENICS ---------------- */
add("incline-pushup", "Incline Push-Up", { compound: true, m: "cali", p: "hpush", eq: ["none"], s: ["shoulders", "wrists"], lv: [0, 0], cue: "Hands on a bench or counter, body in one line." });
add("pushup", "Push-Up", { compound: true, m: "cali", p: "hpush", eq: ["none"], s: ["shoulders", "elbows", "wrists"], lv: [1, 1], cue: "Squeeze glutes, chest to a fist from the floor." });
add("archer-pushup", "Archer Push-Up", { compound: true, m: "cali", p: "hpush", eq: ["none"], s: ["shoulders", "elbows", "wrists"], lv: [2, 2], perSide: true, cue: "Shift onto one arm, the other stays straight." });
add("pike-pushup", "Pike Push-Up", { compound: true, m: "cali", p: "vpush", eq: ["none"], s: ["shoulders", "wrists"], lv: [0, 0], cue: "Hips high, head goes in front of your hands." });
add("elevated-pike", "Elevated Pike Push-Up", { compound: true, m: "cali", p: "vpush", eq: ["none"], s: ["shoulders", "wrists"], lv: [1, 1], cue: "Feet on a box, aim for a vertical torso." });
add("wall-hspu", "Wall Handstand Push-Up", { m: "cali", p: "vpush", eq: ["none"], s: ["shoulders", "wrists", "neck"], lv: [2, 2], cue: "Slow down, tripod head and hands, press up." });
add("bench-dip", "Bench Dip", { m: "cali", p: "arms", eq: ["none"], s: ["shoulders", "elbows", "wrists"], lv: [0, 0], cue: "Shoulders down, elbows point back." });
add("bar-dip", "Parallel Bar Dip", { m: "cali", p: "arms", eq: ["bar"], s: ["shoulders", "elbows", "wrists"], lv: [1, 2], cue: "Lean slightly forward, lower to 90°." });
add("neg-pullup", "Negative Pull-Up", { compound: true, m: "cali", p: "vpull", eq: ["bar"], s: ["shoulders", "elbows"], lv: [0, 0], cue: "Jump to the top, lower for 5 seconds." });
add("pullup", "Pull-Up", { compound: true, m: "cali", p: "vpull", eq: ["bar"], s: ["shoulders", "elbows"], lv: [1, 1], cue: "From a dead hang, chin over bar." });
add("neutral-pullup", "Neutral Grip Pull Up", { m: "cali", p: "vpull", eq: ["bar"], s: ["elbows"], lv: [1, 2], cue: "Palms facing, drive elbows to ribs." });
add("ctb-pullup", "Chest-to-Bar Pull-Up", { compound: true, m: "cali", p: "vpull", eq: ["bar"], s: ["shoulders", "elbows"], lv: [2, 2], cue: "Pull until your chest touches the bar." });
add("prone-ytw", "Prone Y-T-W Raise", { m: "cali", p: "vpull", eq: ["none"], s: [], lv: [0, 2], cue: "Face down, thumbs up, lift arms into each letter." });
add("table-row", "Table Row", { compound: true, m: "cali", p: "hpull", eq: ["none"], s: ["elbows"], lv: [0, 1], cue: "Lie under a sturdy table, pull chest to the edge." });
add("incline-row", "Incline Inverted Row", { compound: true, m: "cali", p: "hpull", eq: ["bar"], s: ["elbows"], lv: [0, 0], cue: "High bar, body straight, chest to bar." });
add("inverted-row", "Inverted Row", { compound: true, m: "cali", p: "hpull", eq: ["bar"], s: ["elbows"], lv: [1, 1], cue: "Bar at hip height, heels down, squeeze back." });
add("fe-row", "Feet-Elevated Inverted Row", { compound: true, m: "cali", p: "hpull", eq: ["bar"], s: ["elbows"], lv: [2, 2], cue: "Feet on a box, body parallel to the floor." });
add("bw-squat", "Bodyweight Squat", { m: "cali", p: "squat", eq: ["none"], s: ["knees", "hips"], lv: [0, 0], compound: true, cue: "Sit down between your heels, chest up." });
add("jump-squat", "Jump Squat", { m: "cali", p: "squat", eq: ["none"], s: ["knees", "ankles", "impact"], lv: [1, 1], cue: "Land softly and go straight into the next rep." });
add("tempo-squat", "Tempo Squat (3s down)", { m: "cali", p: "squat", eq: ["none"], s: ["knees", "hips"], lv: [1, 1], compound: true, cue: "Three seconds down, pause, stand up fast." });
add("cossack-squat", "Cossack Squat", { m: "cali", p: "squat", eq: ["none"], s: ["knees", "hips"], lv: [1, 2], perSide: true, compound: true, cue: "Shift to one side, other leg straight, toes up." });
add("box-pistol", "Box Pistol Squat", { compound: true, m: "cali", p: "squat", eq: ["none"], s: ["knees", "hips"], lv: [2, 2], perSide: true, cue: "Sit to a box on one leg, stand without rocking." });
add("split-squat", "Split Squat", { compound: true, m: "cali", p: "lunge", eq: ["none"], s: ["knees"], lv: [0, 0], perSide: true, cue: "Stay in a split stance, back knee drops straight down." });
add("bulgarian", "Bulgarian Split Squat", { compound: true, m: "cali", p: "lunge", eq: ["none"], s: ["knees", "hips"], lv: [1, 1], perSide: true, cue: "Rear foot on a bench or couch." });
add("shrimp-squat", "Shrimp Squat", { compound: true, m: "cali", p: "lunge", eq: ["none"], s: ["knees"], lv: [2, 2], perSide: true, cue: "Hold your rear foot, knee taps the floor." });
add("glute-bridge", "Glute Bridge", { m: "cali", p: "hinge", eq: ["none"], s: [], lv: [0, 0], cue: "Drive through heels, pause 1s at the top." });
add("sl-bridge", "Single-Leg Glute Bridge", { m: "cali", p: "hinge", eq: ["none"], s: [], lv: [1, 1], perSide: true, cue: "Keep hips level." });
add("sl-hip-thrust", "Single-Leg Hip Thrust", { m: "cali", p: "hinge", eq: ["none"], s: ["hips"], lv: [2, 2], perSide: true, cue: "Shoulders on a bench, full hip extension." });
add("slide-curl", "Sliding Leg Curl", { m: "cali", p: "hinge", eq: ["none"], s: ["knees"], lv: [0, 1], cue: "Heels on a towel, hips up, pull heels in." });
add("nordic-neg", "Nordic Curl Negative", { m: "cali", p: "hinge", eq: ["none"], s: ["knees"], lv: [2, 2], cue: "Anchor feet, lower as slowly as you can." });
add("calf-raise", "Calf Raise", { m: "cali", p: "calves", eq: ["none"], s: ["ankles"], lv: [0, 0], cue: "On a step, full range." });
add("sl-calf-raise", "Single-Leg Calf Raise", { m: "cali", p: "calves", eq: ["none"], s: ["ankles"], lv: [1, 2], perSide: true, cue: "3 seconds down, pause at the top." });
add("plank", "Plank", { m: "cali", p: "core", eq: ["none"], s: ["shoulders"], kind: "hold", lv: [0, 0], cue: "Squeeze glutes, ribs down." });
add("dead-bug", "Dead Bug", { m: "cali", p: "core", eq: ["none"], s: [], lv: [0, 1], perSide: true, cue: "Low back glued to the floor." });
add("side-plank", "Side Plank", { m: "cali", p: "core", eq: ["none"], s: ["shoulders"], kind: "hold", lv: [1, 1], perSide: true, cue: "Hips high, body in one line." });
add("hollow-hold", "Hollow Body Hold", { m: "cali", p: "core", eq: ["none"], s: ["lowerback"], kind: "hold", lv: [1, 2], cue: "Low back pressed down, arms by ears." });
add("hanging-leg-raise", "Hanging Leg Raise", { m: "cali", p: "core", eq: ["bar"], s: ["shoulders"], lv: [2, 2], cue: "No swing, lift legs to 90°." });
add("beast-plank", "Beast Plank", { m: "cali", p: "core", eq: ["none"], s: ["wrists"], kind: "hold", lv: [0, 1], cue: "On hands and toes, knees an inch off the floor." });
add("superman", "Superman Hold", { m: "cali", p: "core", eq: ["none"], s: [], kind: "hold", lv: [0, 2], cue: "Lift chest and legs, look at the floor." });

/* ---------------- CARDIO ---------------- */
// modes: steady, interval
add("treadmill-run", "Treadmill Run", { m: "cardio", eq: ["gym"], s: ["knees", "ankles", "hips", "impact"], modes: ["steady", "interval"] });
add("incline-walk", "Incline Treadmill Walk", { m: "cardio", eq: ["gym"], s: [], modes: ["steady"] });
add("bike", "Stationary Bike", { m: "cardio", eq: ["gym"], s: [], modes: ["steady", "interval"] });
add("fan-bike", "Fan Bike", { m: "cardio", eq: ["gym"], s: [], modes: ["interval"] });
add("rower", "Rower", { m: "cardio", eq: ["gym"], s: ["lowerback"], modes: ["steady", "interval"], img: IMG("rower") });
add("elliptical", "Elliptical", { m: "cardio", eq: ["gym"], s: [], modes: ["steady"] });
add("ski-erg", "Ski Erg", { m: "cardio", eq: ["gym"], s: ["shoulders", "lowerback"], modes: ["interval"] });
add("battle-rope", "Battle Rope Double Arm Slam", { m: "cardio", eq: ["gym"], s: ["shoulders"], modes: ["interval"] });
add("outdoor-run", "Outdoor Run", { m: "cardio", eq: ["none"], s: ["knees", "ankles", "hips", "impact"], modes: ["steady", "interval"] });
add("brisk-walk", "Brisk Walk", { m: "cardio", eq: ["none"], s: [], modes: ["steady"] });
add("jump-rope", "Jump Rope", { m: "cardio", eq: ["none"], s: ["ankles", "knees", "impact"], modes: ["interval"] });
add("burpees", "Burpees", { m: "cardio", eq: ["none"], s: ["knees", "wrists", "shoulders", "impact"], modes: ["interval"] });
add("mountain-climbers", "Mountain Climbers", { m: "cardio", eq: ["none"], s: ["wrists", "shoulders"], modes: ["interval"] });
add("high-knees", "High Knees", { m: "cardio", eq: ["none"], s: ["knees", "ankles", "impact"], modes: ["interval"] });
add("shadow-boxing", "Shadow Boxing", { m: "cardio", eq: ["none"], s: [], modes: ["interval", "steady"] });
add("step-ups-cardio", "Low Step-Ups", { m: "cardio", eq: ["none"], s: ["knees"], modes: ["steady", "interval"] });

/* ---------------- MOBILITY (warm-up / cool-down / joint care) ---------------- */
const mob = (id, name, o) => add(id, name, { m: "mobility", eq: ["none"], kind: "reps", ...o });
// warm-ups
mob("inchworm", "Stationary Inchworm", { role: "warmup", focus: "full", img: IMG("stationary_inchworm") });
mob("hip-bridge-march", "Leg Extension Hip Bridge March", { role: "warmup", focus: "lower", perSide: true, img: IMG("leg_extension_hip_bridge_march") });
mob("quad-stretch-alt", "Alternating Quads Stretch", { role: "warmup", focus: "lower", perSide: true, img: IMG("alternating_quads_stretch") });
mob("worlds-greatest", "World's Greatest Stretch", { role: "warmup", focus: "full", perSide: true });
mob("leg-swings", "Leg Swings", { role: "warmup", focus: "lower", perSide: true });
mob("arm-circles", "Arm Circles", { role: "warmup", focus: "upper", kind: "hold" });
mob("ball-ts", "Stability Ball Shoulder T's", { role: "warmup", focus: "upper", img: IMG("stability_ball_shoulder_ts") });
mob("ball-ys", "Stability Ball Shoulder Y's", { role: "warmup", focus: "upper", img: IMG("stability_ball_shoulder_ys") });
mob("cat-cow", "Cat-Cow", { role: "warmup", focus: "full" });
mob("easy-cardio", "Easy Pace Warm-Up", { role: "warmup", focus: "cardio", kind: "cardio" });
// cool-downs
mob("cobra", "Cobra Pose", { role: "cooldown", focus: "full", kind: "hold", img: IMG("cobra_pose") });
mob("hip-abductor-stretch", "Passive Lying Hip Abductors Stretch", { role: "cooldown", focus: "lower", kind: "hold", perSide: true, img: IMG("passive_lying_hip_abductors_stretch") });
mob("childs-pose", "Child's Pose", { role: "cooldown", focus: "full", kind: "hold" });
mob("hamstring-stretch", "Straight Leg Hamstrings Stretch", { role: "cooldown", focus: "lower", kind: "hold", perSide: true });
mob("doorway-chest", "Doorway Chest Stretch", { role: "cooldown", focus: "upper", kind: "hold", perSide: true });
mob("lat-stretch", "Active Lats Stretch", { role: "cooldown", focus: "upper", kind: "hold", perSide: true });
mob("9090", "90/90 Hip Stretch", { role: "cooldown", focus: "lower", kind: "hold", perSide: true });
mob("calf-stretch", "Wall Calf Stretch", { role: "cooldown", focus: "cardio", kind: "hold", perSide: true });
// joint care (added when the user reports pain or past injury in an area)
mob("wall-slides", "Wall Slides", { role: "care", area: "shoulders" });
mob("band-pull-apart", "Prone Shoulder Y Raise", { role: "care", area: "shoulders" });
mob("bird-dog", "Bird Dog", { role: "care", area: "lowerback", perSide: true });
mob("mcgill-curl", "Modified Curl-Up", { role: "care", area: "lowerback" });
mob("slr", "Straight-Leg Raise", { role: "care", area: "knees", perSide: true });
mob("wall-sit-short", "Short Wall Sit", { role: "care", area: "knees", kind: "hold" });
mob("clamshell", "Clamshell", { role: "care", area: "hips", perSide: true });
mob("hip-switch", "90/90 Hip Switch", { role: "care", area: "hips" });
mob("ankle-circles", "Ankle Circles", { role: "care", area: "ankles", perSide: true });
mob("wrist-circles", "Wrist Circles & Rocks", { role: "care", area: "wrists" });
mob("chin-tucks", "Chin Tucks", { role: "care", area: "neck" });
mob("open-book", "Thoracic Open Book", { role: "care", area: "upperback", perSide: true });
mob("wrist-flexor", "Forearm Flexor Stretch", { role: "care", area: "elbows", kind: "hold", perSide: true });

export const LIBRARY = L;
export const byId = Object.fromEntries(L.map((e) => [e.id, e]));

export const AREAS = [
  { id: "neck", label: "Neck" },
  { id: "shoulders", label: "Shoulders" },
  { id: "upperback", label: "Upper back" },
  { id: "elbows", label: "Elbows" },
  { id: "wrists", label: "Wrists / hands" },
  { id: "lowerback", label: "Lower back" },
  { id: "hips", label: "Hips" },
  { id: "knees", label: "Knees" },
  { id: "ankles", label: "Ankles / feet" },
];
