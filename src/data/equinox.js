// Chajir's Equinox 4-Day program, kept as a ready-made plan.
// Sets / reps / times are sensible defaults; adjust any of them in the workout screen.
import { byId } from "./library";

const IMG = (f) => `${import.meta.env?.BASE_URL || "/"}images/exercises/${f}.jpg`;
let n = 0;
const id = () => `eq${n++}`;

// R = reps, H = hold (seconds), I = interval (rounds, work, rest)
const R = (name, sets, reps, o = {}) => ({ uid: id(), name, kind: "reps", sets, reps: Array.isArray(reps) ? reps : [reps, reps], rest: o.rest ?? (sets > 1 ? 60 : 0), weighted: !!o.w, perSide: !!o.side, img: o.img && IMG(o.img), exId: o.ex, p: o.p, m: o.w ? "weights" : o.m || "cali", cue: o.ex && byId[o.ex]?.cue });
const H = (name, sets, seconds, o = {}) => ({ uid: id(), name, kind: "hold", sets, seconds, rest: o.rest ?? (sets > 1 ? 45 : 0), weighted: !!o.w, perSide: !!o.side, img: o.img && IMG(o.img), exId: o.ex, p: o.p, m: o.w ? "weights" : o.m || "mobility" });
const I = (name, rounds, work, rest, o = {}) => ({ uid: id(), name, kind: "interval", sets: rounds, work, rest, img: o.img && IMG(o.img), exId: o.ex, p: "cardio", m: "cardio", cue: "Go hard on work, easy on rest." });

const day = (i, title, sections) => ({ id: `d${i}`, label: `Day ${i}`, title, tag: "Equinox", sections: Object.entries(sections).map(([name, items]) => ({ name, items })) });

export function equinoxPlan() {
  n = 0;
  return {
    id: "equinox-4day",
    source: "equinox",
    name: "Equinox 4-Day Program",
    createdAt: Date.now(),
    notes: ["Your Equinox program as you trained it. Sets, reps and times are starting points. Change them in the workout as you go."],
    days: [
      day(1, "Resistance Day A", {
        "Movement Prep": [
          R("Leg Extension Hip Bridge March", 1, 10, { side: true, img: "leg_extension_hip_bridge_march", m: "mobility" }),
          R("Stability Ball Shoulder T's", 1, 10, { img: "stability_ball_shoulder_ts", m: "mobility" }),
          R("Stability Ball Shoulder W's", 1, 10, { img: "stability_ball_shoulder_ws", m: "mobility" }),
          R("Stability Ball Shoulder L's", 1, 10, { img: "stability_ball_shoulder_ls", m: "mobility" }),
          R("Stability Ball Shoulder Y's", 1, 10, { img: "stability_ball_shoulder_ys", m: "mobility" }),
        ],
        "Dynamic Warm-Up": [
          R("Stationary Inchworm", 1, 6, { img: "stationary_inchworm", m: "mobility" }),
          R("Alternating Quads Stretch", 1, 8, { side: true, img: "alternating_quads_stretch", m: "mobility" }),
        ],
        Power: [
          R("Kettlebell Swing", 3, 10, { w: true, img: "kettlebell_swing", ex: "kb-swing", p: "hinge" }),
          R("Linear Rapid Response Jumps", 3, 5, { img: "linear_rapid_response_jumps", rest: 45 }),
        ],
        Strength: [
          R("Stability Ball Trunk Rollout", 3, 10, { img: "stability_ball_trunk_rollout", rest: 45, ex: "ball-rollout", p: "core" }),
          R("Barbell Deadlift", 3, [6, 8], { w: true, img: "barbell_deadlift", rest: 90, ex: "bb-deadlift", p: "hinge" }),
          R("Barbell Bench Press", 3, [6, 8], { w: true, img: "barbell_bench_press", rest: 90, ex: "bb-bench", p: "hpush" }),
          R("Kettlebell Goblet Bulgarian Split Squat", 3, 8, { w: true, side: true, img: "kettlebell_goblet_bulgarian_split_squat", ex: "kb-bulgarian", p: "lunge" }),
        ],
        Resistance: [
          R("1 Arm Seated Cable Row", 3, [10, 12], { w: true, side: true, img: "1_arm_seated_cable_row", rest: 45, ex: "cable-row-1arm", p: "hpull" }),
          R("Lying Dumbbell Triceps Extension", 3, [10, 12], { w: true, img: "lying_dumbbell_triceps_extension", rest: 45, ex: "db-triceps-ext", p: "arms" }),
        ],
        "ESD (Energy System Development)": [I("Rower", 6, 30, 30, { img: "rower", ex: "rower" })],
        "Cool Down": [
          H("Cobra Pose", 1, 30, { img: "cobra_pose" }),
          H("Passive Lying Hip Abductors Stretch", 1, 45, { side: true, img: "passive_lying_hip_abductors_stretch" }),
        ],
      }),
      day(2, "Resistance Day B", {
        "Movement Prep": [
          R("Back Lying Mini Band Hip Internal Rotation", 1, 10, { side: true, m: "mobility" }),
          R("Stability Ball Shoulder L's", 1, 10, { img: "stability_ball_shoulder_ls", m: "mobility" }),
          R("Stability Ball Shoulder Y's", 1, 10, { img: "stability_ball_shoulder_ys", m: "mobility" }),
        ],
        "Dynamic Warm-Up": [R("Alternating Reverse Lunge", 1, 8, { side: true, m: "mobility" }), R("Toe Touch to Deep Squat", 1, 8, { m: "mobility" })],
        Power: [R("Perpendicular Med Ball Hip Toss", 3, 6, { w: true, side: true }), R("Lateral Rapid Response Jumps", 3, 5, { side: true, rest: 45 })],
        Strength: [
          R("Barbell Back Squat", 3, [6, 8], { w: true, rest: 90, ex: "bb-back-squat", p: "squat" }),
          H("1 Arm Kettlebell Farmer's Carry", 3, 30, { w: true, side: true, ex: "farmer-carry", p: "core" }),
          R("Neutral Grip Pull Up", 3, [6, 10], { rest: 75, ex: "neutral-pullup", p: "vpull" }),
          R("1 Leg Dumbbell Hip Hinge", 3, 8, { w: true, side: true, ex: "sl-db-hinge", p: "lunge" }),
        ],
        Resistance: [
          R("Half Kneel 1-Arm Landmine Press", 3, 10, { w: true, side: true, rest: 45, ex: "landmine-press", p: "vpush" }),
          R("Dumbbell Biceps Curl", 3, [10, 12], { w: true, rest: 45, ex: "db-curl", p: "arms" }),
        ],
        "ESD (Energy System Development)": [I("Fan Bike", 8, 20, 40, { ex: "fan-bike" })],
        "Cool Down": [H("Passive 90/90 Glutes Stretch", 1, 45, { side: true }), H("Active Lats Stretch", 1, 30, { side: true })],
      }),
      day(3, "Resistance Day C", {
        "Movement Prep": [
          R("Side Lying Mini Band Hip External Rotation", 1, 10, { side: true, m: "mobility" }),
          H("Beast Plank", 1, 30),
          R("Tall Kneel Kettlebell Halo", 1, 8, { w: true }),
        ],
        "Dynamic Warm-Up": [R("Alternating Forward Lunge", 1, 8, { side: true, m: "mobility" }), R("Alternating Lateral Lunge", 1, 8, { side: true, m: "mobility" })],
        Power: [R("Med Ball Slam", 3, 8, { w: true }), R("Pogo Hop", 3, 15, { rest: 45 })],
        Strength: [
          R("Barbell Hip Hinge", 3, 8, { w: true, rest: 90, ex: "bb-rdl", p: "hinge" }),
          R("Lateral Beast Crawl", 3, 10, { side: true, rest: 45 }),
          R("Dumbbell Incline Bench Press", 3, [8, 10], { w: true, rest: 75, ex: "db-incline", p: "hpush" }),
          R("Kettlebell Front Rack Lateral Squat", 3, 6, { w: true, side: true, ex: "kb-lateral-squat", p: "squat" }),
        ],
        Resistance: [
          R("Alternating Dumbbell Bent Over Row", 3, 10, { w: true, side: true, rest: 45, ex: "db-bent-row", p: "hpull" }),
          R("Cable Pallof Press", 3, 10, { w: true, side: true, rest: 45, ex: "pallof", p: "core" }),
        ],
        "ESD (Energy System Development)": [I("Ski Erg", 5, 40, 40, { ex: "ski-erg" })],
        "Cool Down": [H("Passive Half Kneel Quads Stretch", 1, 45, { side: true }), H("Passive Triceps/Lats Stretch", 1, 30, { side: true })],
      }),
      day(4, "Alactic Power Intervals", {
        "Movement Prep": [
          H("Foam Roll Calves", 1, 45),
          H("Foam Roll Hamstrings", 1, 45),
          H("Foam Roll Quadriceps", 1, 45),
          H("Foam Roll Hip Flexors", 1, 45),
          H("Foam Roll Lats", 1, 45),
        ],
        "Dynamic Warm-Up": [
          R("Mini Band Hip Flexion", 1, 10, { side: true, m: "mobility" }),
          R("Mini Band Hip Extension", 1, 10, { side: true, m: "mobility" }),
          H("Treadmill Butt Kick", 1, 20),
          H("Treadmill Lateral Shuffle", 1, 20, { side: true }),
          H("Treadmill High Knee Run", 1, 20),
        ],
        "ESD (Energy System Development)": [I("Curve Treadmill Sprint", 8, 10, 50, { ex: "treadmill-run" }), I("Battle Rope Double Arm Slam", 6, 15, 45, { ex: "battle-rope" })],
        "Cool Down": [
          H("Passive Half Kneel Quads Stretch", 1, 45, { side: true }),
          H("Passive Straight Leg Hamstrings Stretch", 1, 45, { side: true }),
          H("Child's Pose", 1, 60),
        ],
      }),
    ],
  };
}
