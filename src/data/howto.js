// "How to do it" instructions, matched to exercises by name.
// s = setup, m = movement, x = common mistakes. Edit freely.
import { slug } from "../lib/images";

const H = {};
const h = (name, s, m, x) => (H[slug(name)] = { s, m, x });

/* ---------- Weights ---------- */
h("Barbell Back Squat", "Bar on your upper back, hands just outside shoulders, feet shoulder-width, toes slightly out.", "Brace your core, sit down between your hips until thighs are about parallel, then drive up through the whole foot.", "Knees caving in, heels lifting, chest dropping forward.");
h("Goblet Squat", "Hold a dumbbell or kettlebell vertically at your chest, elbows down.", "Sit straight down, elbows brushing the inside of your knees, then stand tall.", "Rounding the back, letting the weight drift away from your chest.");
h("Leg Press", "Feet shoulder-width in the middle of the platform, back flat on the pad.", "Lower until your hips start to curl off the pad, then press through mid-foot without locking knees hard.", "Going so deep your low back rounds, slamming the knees straight.");
h("Kettlebell Front Rack Lateral Squat", "Kettlebell held at your chest, feet wide, toes forward.", "Sit back into one hip with that knee bent, other leg straight, then push back to center.", "Knee collapsing inward, heel of the bent leg lifting.");
h("Barbell Deadlift", "Bar over mid-foot, shins close, hands just outside legs, back flat.", "Push the floor away, keep the bar against your legs, finish standing tall with glutes squeezed.", "Rounding the back, jerking the bar, leaning back at the top.");
h("Barbell Hip Hinge (RDL)", "Stand tall holding the bar at your hips, soft knees.", "Push hips back and slide the bar down your thighs until you feel the hamstrings, then drive hips forward.", "Squatting down instead of hinging, rounding the back.");
h("Barbell Hip Hinge", "Stand tall holding the bar at your hips, soft knees.", "Push hips back and slide the bar down your thighs until you feel the hamstrings, then drive hips forward.", "Squatting down instead of hinging, rounding the back.");
h("Dumbbell Romanian Deadlift", "Dumbbells in front of your thighs, soft knees, shoulders back.", "Hinge at the hips, dumbbells slide down your legs to mid-shin, then squeeze glutes to stand.", "Rounding the back, bending the knees too much.");
h("Barbell Hip Thrust", "Upper back on a bench, bar padded across your hips, feet flat.", "Drive through your heels to lift hips until your body is flat, pause, lower with control.", "Arching the low back at the top, pushing through the toes.");
h("Kettlebell Swing", "Bell a foot in front of you, hinge and grab it with both hands.", "Hike it back between your legs, then snap your hips forward so it floats to chest height.", "Squatting the swing, lifting with the arms, leaning back at the top.");
h("Kettlebell Goblet Bulgarian Split Squat", "Back foot on a bench, kettlebell at your chest, front foot far enough forward.", "Drop the back knee straight down, then push through the front heel to stand.", "Front knee caving in, standing too close to the bench.");
h("Dumbbell Reverse Lunge", "Stand tall with dumbbells at your sides.", "Step back, lower the back knee toward the floor, push through the front foot to return.", "Short steps, front knee caving, leaning forward.");
h("Dumbbell Step-Up", "Dumbbells at your sides, one foot fully on a box or bench.", "Drive through the top heel to stand on the box, lower slowly with control.", "Pushing off the bottom foot, knee caving in.");
h("1 Leg Dumbbell Hip Hinge", "Stand on one leg holding a dumbbell, slight bend in the knee.", "Hinge forward while the free leg reaches back, hips square, then return to tall.", "Hips opening up to the side, rounding the back.");
h("Barbell Bench Press", "Lie with eyes under the bar, shoulder blades squeezed together, feet planted.", "Lower the bar to your lower chest, then press up and slightly back.", "Bouncing off the chest, flaring elbows, lifting hips.");
h("Dumbbell Bench Press", "Lie on a bench, dumbbells over your chest, shoulder blades pinned.", "Lower until elbows are just below the bench, press back up.", "Elbows flared at 90°, dumbbells drifting apart.");
h("Dumbbell Incline Bench Press", "Bench at about 30°, dumbbells at upper chest.", "Press up and slightly in, lower slowly to the chest.", "Bench too steep, arching off the bench.");
h("Machine Chest Press", "Seat so handles line up with mid-chest, back on the pad.", "Press out smoothly, return slowly without letting the stack touch.", "Shrugging shoulders, locking out hard.");
h("Dumbbell Shoulder Press", "Sit or stand tall, dumbbells at shoulder height, palms forward.", "Press overhead until arms are straight, lower to the shoulders.", "Arching the low back, pressing forward instead of up.");
h("Half Kneel 1-Arm Landmine Press", "Half-kneel, bar end at your shoulder on the same side as the down knee.", "Squeeze that glute and press the bar up and forward until the arm is straight.", "Leaning back, twisting the torso.");
h("Barbell Overhead Press", "Bar on front of shoulders, hands just outside shoulders, glutes tight.", "Press straight up, move your head back then through once the bar passes it.", "Leaning back, pressing the bar around the face.");
h("1 Arm Seated Cable Row", "Sit tall, one handle in hand, feet braced.", "Pull your elbow back to your hip, squeeze the shoulder blade, return slowly.", "Twisting the torso, shrugging.");
h("Alternating Dumbbell Bent Over Row", "Hinge to about 45° holding dumbbells, flat back.", "Row one dumbbell toward your hip, lower, then the other.", "Standing up as you row, rounding the back.");
h("One-Arm Dumbbell Row", "One hand and knee on a bench, flat back, dumbbell hanging.", "Pull the elbow toward your hip, lower all the way.", "Rotating the torso, pulling with the biceps.");
h("Chest-Supported Dumbbell Row", "Lie chest-down on an incline bench, dumbbells hanging.", "Row both dumbbells up, squeezing shoulder blades, lower slowly.", "Lifting chest off the bench, shrugging.");
h("Lat Pulldown", "Grip slightly wider than shoulders, thighs under the pad.", "Pull the bar to your upper chest, elbows driving down, return slowly.", "Leaning way back, pulling behind the neck.");
h("Assisted Pull-Up Machine", "Knees on the pad, grip the handles, more weight = more help.", "Pull your chin over the bar, lower to a full hang.", "Half reps, swinging.");
h("Dumbbell Biceps Curl", "Stand tall, dumbbells at your sides, palms forward.", "Curl up keeping elbows pinned, lower slowly.", "Swinging the body, elbows drifting forward.");
h("Lying Dumbbell Triceps Extension", "Lie on a bench, dumbbells straight above your shoulders.", "Bend at the elbows to lower the dumbbells beside your head, extend back up.", "Elbows flaring out, moving the shoulders.");
h("Cable Triceps Pushdown", "Face the cable, elbows at your sides.", "Push the handle down until arms are straight, return to 90°.", "Elbows moving forward, leaning over the bar.");
h("Cable Pallof Press", "Stand sideways to the cable, handle at your chest, feet shoulder-width.", "Press straight out, hold a second without rotating, bring it back.", "Letting the cable twist you, leaning away.");
h("1 Arm Kettlebell Farmer's Carry", "Pick up one heavy kettlebell, stand tall.", "Walk slowly with shoulders level and core tight.", "Leaning toward the weight, shrugging.");
h("Stability Ball Trunk Rollout", "Kneel with forearms on a stability ball, hips forward.", "Roll the ball out as far as you can with a flat back, pull it back with your abs.", "Low back sagging, hips piking up.");
h("Dumbbell Calf Raise", "Stand on a step edge holding a dumbbell, heels hanging.", "Lower heels below the step, rise as high as you can, pause.", "Bouncing, short range.");
h("Tall Kneel Kettlebell Halo", "Kneel tall holding a kettlebell upside down by the horns.", "Circle it around your head slowly, keeping ribs down; switch direction.", "Arching the back, moving the head.");
h("Med Ball Slam", "Stand holding a slam ball overhead.", "Slam it to the floor as hard as you can, hinge to catch it, repeat.", "Using only the arms, rounding the back to pick it up.");
h("Perpendicular Med Ball Hip Toss", "Stand sideways to a wall holding a med ball at your back hip.", "Rotate through the hips and throw the ball into the wall, catch and reset.", "Throwing with the arms, not turning the back foot.");

/* ---------- Calisthenics ---------- */
h("Incline Push-Up", "Hands on a bench or counter, body in a straight line.", "Lower your chest to the edge, push back up.", "Hips sagging, flaring elbows.");
h("Push-Up", "Hands under shoulders, body straight, glutes tight.", "Lower until your chest is a fist from the floor, push up.", "Hips sagging, half reps, elbows flared wide.");
h("Archer Push-Up", "Wide push-up stance.", "Shift your weight to one arm as you lower, the other arm stays straight, push back and switch.", "Bending both arms equally, hips rotating.");
h("Pike Push-Up", "Hands on floor, hips high in an upside-down V.", "Bend elbows to bring your head in front of your hands, press back up.", "Hips dropping, head going straight down between hands.");
h("Elevated Pike Push-Up", "Feet on a box, hips stacked as high over hands as possible.", "Lower head toward the floor in front of your hands, press up.", "Back rounding, elbows flaring.");
h("Wall Handstand Push-Up", "Kick up into a handstand facing away from the wall.", "Lower slowly until your head lightly touches a pad, press back up.", "Arching the back, dropping too fast.");
h("Bench Dip", "Hands on a bench behind you, legs out in front.", "Bend elbows to about 90°, press back up.", "Shoulders rolling forward, going too deep.");
h("Parallel Bar Dip", "Support yourself on parallel bars, arms straight.", "Lean slightly forward, lower to 90° at the elbows, press up.", "Shrugging, going too deep, swinging.");
h("Negative Pull-Up", "Use a box to get your chin over the bar.", "Lower yourself as slowly as possible (5 seconds) to a full hang.", "Dropping quickly at the bottom.");
h("Pull-Up", "Hang from the bar, hands shoulder-width, palms away.", "Pull until your chin is over the bar, lower to a full hang.", "Kipping, half reps, shrugging.");
h("Neutral Grip Pull Up", "Hang with palms facing each other on parallel handles.", "Drive your elbows to your ribs until chin is over the handles, lower fully.", "Swinging, not reaching full hang.");
h("Chest-to-Bar Pull-Up", "Hang from the bar, slightly wider grip.", "Pull until your chest touches the bar, lower fully.", "Swinging, losing control on the way down.");
h("Prone Y-T-W Raise", "Lie face down, arms out, thumbs up.", "Lift arms into a Y, then T, then W, pausing each time.", "Lifting with the low back, shrugging.");
h("Table Row", "Lie under a sturdy table, grip the edge.", "Pull your chest up to the table with a straight body, lower slowly.", "Hips sagging, using a table that can tip.");
h("Incline Inverted Row", "Bar or rings at chest height, walk feet forward, body straight.", "Pull chest to the bar, lower slowly.", "Hips sagging, chin poking forward.");
h("Inverted Row", "Bar at hip height, hang under it with heels on the floor, body straight.", "Pull chest to the bar, squeeze shoulder blades, lower.", "Hips dropping, half reps.");
h("Feet-Elevated Inverted Row", "Same as an inverted row with feet on a box.", "Pull chest to the bar, keep body parallel to the floor.", "Losing the straight line.");
h("Bodyweight Squat", "Feet shoulder-width, arms forward.", "Sit down between your heels as low as you can control, stand up.", "Heels lifting, knees caving.");
h("Jump Squat", "Feet shoulder-width.", "Squat down, jump as high as you can, land softly and go straight into the next rep.", "Landing stiff-legged, knees caving.");
h("Tempo Squat (3s down)", "Feet shoulder-width.", "Take 3 seconds to lower, pause, then stand up quickly.", "Rushing the lowering part.");
h("Cossack Squat", "Very wide stance, toes slightly out.", "Shift to one side and sit deep on that leg, other leg straight with toes up, switch.", "Heel lifting, rounding the back.");
h("Box Pistol Squat", "Stand on one leg in front of a box, other leg out front.", "Sit down to the box on one leg, stand back up without rocking.", "Dropping onto the box, knee caving.");
h("Split Squat", "Long split stance, back heel up.", "Drop the back knee straight down, push up through the front foot.", "Stance too short, front heel lifting.");
h("Bulgarian Split Squat", "Back foot on a bench or couch.", "Lower the back knee toward the floor, stand through the front heel.", "Front knee caving, standing too close.");
h("Shrimp Squat", "Stand on one leg, hold the other foot behind you.", "Lower until your back knee taps the floor, stand back up.", "Losing balance forward, knee caving.");
h("Glute Bridge", "Lie on your back, knees bent, feet flat.", "Drive through your heels to lift hips, squeeze 1 second, lower.", "Arching the low back, pushing through toes.");
h("Single-Leg Glute Bridge", "Glute bridge position with one leg straight in the air.", "Lift hips with one leg, keep them level, lower.", "Hips tilting to one side.");
h("Single-Leg Hip Thrust", "Shoulders on a bench, one foot planted.", "Drive hips up until straight, lower slowly.", "Arching the back, twisting.");
h("Sliding Leg Curl", "Lie on your back, heels on a towel or sliders, hips up.", "Pull heels toward your butt keeping hips up, slide back out.", "Hips dropping.");
h("Nordic Curl Negative", "Kneel with ankles anchored under something solid.", "Lower your body forward as slowly as possible, catch with hands, push back.", "Bending at the hips.");
h("Calf Raise", "Stand on a step edge.", "Lower heels, rise up high, pause.", "Bouncing.");
h("Single-Leg Calf Raise", "Stand on one foot on a step edge, hold something for balance.", "Lower for 3 seconds, rise high, pause at the top.", "Short range, rushing.");
h("Plank", "Forearms under shoulders, body straight.", "Squeeze glutes and abs, breathe, hold.", "Hips sagging or piking up.");
h("Dead Bug", "Lie on your back, arms up, knees over hips.", "Lower opposite arm and leg toward the floor, return, switch.", "Low back lifting off the floor.");
h("Side Plank", "Elbow under shoulder, legs stacked.", "Lift hips into a straight line, hold.", "Hips sagging, rolling forward.");
h("Hollow Body Hold", "Lie on your back.", "Press the low back down, lift shoulders and legs, arms by ears, hold.", "Low back arching off the floor.");
h("Hanging Leg Raise", "Hang from a bar.", "Lift straight legs to 90° without swinging, lower slowly.", "Swinging, bending knees.");
h("Beast Plank", "Hands and toes on the floor, knees under hips.", "Lift knees an inch off the floor, back flat, hold.", "Hips lifting high.");
h("Superman Hold", "Lie face down, arms overhead.", "Lift chest, arms and legs, look at the floor, hold.", "Cranking the neck up.");
h("Lateral Beast Crawl", "Beast position, knees an inch off the floor.", "Move sideways with opposite hand and foot together.", "Hips bouncing up, knees touching down.");

/* ---------- Power / plyo ---------- */
h("Linear Rapid Response Jumps", "Stand tall, feet hip-width.", "Make quick, small jumps forward and back with stiff ankles, minimal ground time.", "Landing heavy, sinking into a squat.");
h("Lateral Rapid Response Jumps", "Stand tall, feet hip-width.", "Quick, small jumps side to side, bouncing off the balls of your feet.", "Landing heavy, knees caving.");
h("Pogo Hop", "Stand tall, slight knee bend.", "Bounce on the balls of your feet with stiff ankles.", "Bending the knees too much.");

/* ---------- Cardio ---------- */
h("Rower", "Feet strapped in, grab the handle.", "Push with legs, then lean back slightly, then pull the handle to your ribs. Reverse to return.", "Pulling with arms first, rounding the back.");
h("Fan Bike", "Seat at hip height, hands on handles.", "Push and pull the arms while pedaling.", "Only using legs.");
h("Ski Erg", "Stand tall, handles overhead.", "Hinge and pull the handles down past your hips using your core, return tall.", "Only using arms.");
h("Battle Rope Double Arm Slam", "Feet shoulder-width, athletic stance, one end in each hand.", "Raise both arms and slam the ropes down hard, repeat fast.", "Standing straight up, only using arms.");
h("Curve Treadmill Sprint", "Stand on the curve treadmill holding the rails.", "Sprint by driving the knees; you control the speed.", "Leaning back, landing on heels.");
h("Treadmill Run", "Start at a comfortable speed.", "Run tall, light quick steps.", "Holding the rails, overstriding.");
h("Incline Treadmill Walk", "Set the incline (8–12%) and a brisk pace.", "Walk tall without holding the rails.", "Leaning on the rails.");
h("Stationary Bike", "Seat at hip height, slight knee bend at the bottom.", "Pedal smoothly, keep your upper body relaxed.", "Seat too low, bouncing.");
h("Elliptical", "Hold handles, stand tall.", "Push and pull smoothly.", "Leaning on the handles.");
h("Outdoor Run", "Comfortable shoes, start easy.", "Run tall with short, quick steps.", "Starting too fast.");
h("Brisk Walk", "Good shoes.", "Walk fast enough that talking is a little harder.", "Strolling.");
h("Jump Rope", "Handles at hip height, elbows close.", "Small jumps on the balls of the feet, turn the rope with the wrists.", "Jumping too high, using the whole arm.");
h("Burpees", "Stand tall.", "Squat, hands down, jump feet back, chest to floor, jump feet in, jump up.", "Hips sagging in the plank, landing hard.");
h("Mountain Climbers", "High plank, hands under shoulders.", "Drive knees to chest one at a time, fast.", "Hips bouncing up.");
h("High Knees", "Stand tall.", "Run in place driving knees to hip height.", "Leaning back.");
h("Shadow Boxing", "Fighting stance, hands up.", "Throw punches, keep moving on your feet.", "Dropping the hands.");
h("Low Step-Ups", "Low step or stair.", "Step up and down at a steady pace, switching lead leg.", "Pushing off the bottom foot.");
h("Treadmill Butt Kick", "Treadmill at a slow jog.", "Kick heels toward your butt.", "Leaning forward.");
h("Treadmill Lateral Shuffle", "Treadmill at a slow speed, sideways, holding the rail.", "Shuffle sideways without crossing feet.", "Crossing feet.");
h("Treadmill High Knee Run", "Treadmill at slow jog.", "Drive the knees up to hip height.", "Leaning back.");
h("Easy Pace Warm-Up", "Any cardio machine or a walk.", "Go easy for 5 minutes, gradually picking up the pace.", "Starting too hard.");

/* ---------- Warm-up / mobility ---------- */
h("Leg Extension Hip Bridge March", "Glute bridge position.", "Hold hips up, straighten one leg, return, switch.", "Hips dropping or tilting.");
h("Stability Ball Shoulder T's", "Lie chest-down on a ball, arms hanging.", "Raise arms out to the sides into a T, thumbs up, squeeze shoulder blades.", "Shrugging, using momentum.");
h("Stability Ball Shoulder W's", "Lie chest-down on a ball.", "Raise arms into a W, elbows bent, squeeze shoulder blades.", "Shrugging.");
h("Stability Ball Shoulder L's", "Lie chest-down on a ball, elbows bent 90°.", "Rotate forearms up so arms make an L, lower.", "Moving the elbows.");
h("Stability Ball Shoulder Y's", "Lie chest-down on a ball.", "Raise arms overhead into a Y, thumbs up.", "Arching the low back.");
h("Stationary Inchworm", "Stand tall.", "Bend down, walk hands out to a plank, walk hands back, stand.", "Bending knees too much.");
h("Alternating Quads Stretch", "Stand tall.", "Pull one heel to your butt, hold briefly, switch.", "Leaning forward.");
h("World's Greatest Stretch", "Long lunge position.", "Elbow toward instep, then rotate and reach that arm to the sky.", "Rushing.");
h("Leg Swings", "Hold a wall.", "Swing one leg forward and back, then side to side.", "Twisting the torso.");
h("Arm Circles", "Arms out to the sides.", "Small to big circles forward, then backward.", "Shrugging.");
h("Cat-Cow", "Hands and knees.", "Round your back up, then let it sag and look up, slowly.", "Moving too fast.");
h("Back Lying Mini Band Hip Internal Rotation", "Lie on your back, knees bent, band around knees.", "Drop one knee inward, return, switch.", "Hips lifting.");
h("Side Lying Mini Band Hip External Rotation", "Lie on your side, knees bent, band around knees.", "Lift the top knee, keep feet together, lower.", "Rolling the hips back.");
h("Alternating Reverse Lunge", "Stand tall.", "Step back into a lunge, return, switch legs.", "Short steps.");
h("Alternating Forward Lunge", "Stand tall.", "Step forward into a lunge, push back, switch.", "Knee caving.");
h("Alternating Lateral Lunge", "Stand tall.", "Step to the side and sit into that hip, push back, switch.", "Knee caving.");
h("Toe Touch to Deep Squat", "Stand tall.", "Touch your toes, drop into a deep squat, lift your chest, stand up.", "Rushing.");
h("Mini Band Hip Flexion", "Band around feet, stand tall.", "Lift one knee to hip height against the band, lower.", "Leaning back.");
h("Mini Band Hip Extension", "Band around feet, hold a wall.", "Push one leg straight back, squeeze glute, return.", "Arching the back.");
h("Foam Roll Calves", "Sit, roller under calves.", "Roll slowly from ankle to knee, pause on tight spots.", "Rolling too fast.");
h("Foam Roll Hamstrings", "Roller under hamstrings.", "Roll from knee to glutes slowly.", "Rolling too fast.");
h("Foam Roll Quadriceps", "Face down, roller under thighs.", "Roll from hip to knee slowly.", "Rolling over the kneecap.");
h("Foam Roll Hip Flexors", "Face down, roller at the front of the hip.", "Small slow rolls.", "Rolling onto bone.");
h("Foam Roll Lats", "On your side, roller under armpit, arm overhead.", "Roll slowly down the side of your back.", "Rolling too fast.");

/* ---------- Joint care ---------- */
h("Wall Slides", "Back to a wall, arms in a W.", "Slide arms up keeping them on the wall, down again.", "Low back arching off the wall.");
h("Prone Shoulder Y Raise", "Lie face down, arms overhead.", "Lift arms into a Y, thumbs up, lower.", "Shrugging.");
h("Bird Dog", "Hands and knees.", "Reach opposite arm and leg out, hold 2 seconds, switch.", "Arching the back.");
h("Modified Curl-Up", "Lie on back, one knee bent, hands under low back.", "Lift head and shoulders slightly, hold, lower.", "Pulling the neck.");
h("Straight-Leg Raise", "Lie on back, one knee bent.", "Lift the straight leg to knee height, lower slowly.", "Knee bending.");
h("Short Wall Sit", "Back on a wall.", "Slide down to a shallow squat, hold.", "Going too deep.");
h("Clamshell", "Side-lying, knees bent.", "Open the top knee, feet together, close.", "Rolling hips back.");
h("90/90 Hip Switch", "Sit with both knees bent at 90°.", "Rotate both knees to the other side, keep tall.", "Rounding the back.");
h("Ankle Circles", "Sit or stand on one leg.", "Slow circles each direction.", "Rushing.");
h("Wrist Circles & Rocks", "Hands on the floor.", "Circle the wrists, then rock gently forward and back.", "Forcing the stretch.");
h("Chin Tucks", "Sit or stand tall.", "Glide your chin straight back, hold 2 seconds.", "Tilting the head down.");
h("Thoracic Open Book", "Lie on your side, knees bent, arms out front.", "Rotate the top arm open to the other side, follow with your eyes.", "Knees lifting.");
h("Forearm Flexor Stretch", "Arm straight, palm up.", "Gently pull the fingers back, hold.", "Pulling too hard.");

/* ---------- Cool-down ---------- */
h("Cobra Pose", "Lie face down, hands under shoulders.", "Press up gently, hips stay down, breathe.", "Shrugging.");
h("Passive Lying Hip Abductors Stretch", "Lie on your back.", "Cross one leg over your body, let it relax down, hold.", "Shoulders lifting.");
h("Child's Pose", "Kneel, sit back on heels.", "Reach arms forward, relax your forehead down, breathe.", "Holding tension.");
h("Straight Leg Hamstrings Stretch", "Lie on back or stand with heel on a step.", "Keep the leg straight and lean in gently.", "Rounding the back.");
h("Passive Straight Leg Hamstrings Stretch", "Lie on back, use a strap or towel.", "Pull the straight leg up gently, hold.", "Bending the knee.");
h("Doorway Chest Stretch", "Forearm on a doorframe.", "Step through until you feel the chest stretch, hold.", "Pushing too far.");
h("Active Lats Stretch", "Hold a post or rack.", "Sit back and drop your chest to stretch the side of your back.", "Rushing.");
h("Passive Triceps/Lats Stretch", "Arm overhead, elbow bent.", "Use the other hand to gently pull the elbow, hold.", "Arching the back.");
h("90/90 Hip Stretch", "Sit with both knees at 90°.", "Lean forward over the front shin, hold.", "Rounding the back.");
h("Passive 90/90 Glutes Stretch", "Sit with both knees at 90°.", "Lean forward over the front shin, hold.", "Rounding the back.");
h("Passive Half Kneel Quads Stretch", "Half kneel, back knee on a pad.", "Squeeze the back glute and shift hips forward, hold.", "Arching the low back.");
h("Wall Calf Stretch", "Hands on a wall, one foot back.", "Back heel down, lean in, hold.", "Heel lifting.");

export const howTo = (name) => H[slug(name)] || null;
