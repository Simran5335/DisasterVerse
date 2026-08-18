import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  X, Trophy, Sparkles, ArrowRight, Flame as FireIcon, RotateCcw, Home,
  Timer as TimerIcon, PartyPopper, HeartCrack, Play, ShieldAlert, CheckCircle2, AlertTriangle
} from "lucide-react";

const CATEGORIES = [
  {
    id: "earthquake",
    name: "Earthquake",
    emoji: "🌍",
    color: "#f59e0b",
    questions: [
      { phase: "Before", q: "You're earthquake-proofing your home. What's the SMARTEST first move?", options: ["Anchor heavy furniture & shelves to the wall", "Buy more houseplants", "Repaint the ceiling", "Unplug the fridge permanently"], correct: 0, fact: "Falling furniture causes more quake injuries than collapsing buildings. Bolt it down! 🔩" },
      { phase: "During", q: "Ground starts shaking violently. You're inside. GO!", options: ["Run outside immediately", "Stand in a doorway and wave your arms", "Drop, Cover under sturdy furniture, and Hold On", "Ride it out on the balcony for the view"], correct: 2, fact: "Drop-Cover-Hold On protects you from falling debris — the #1 quake killer. 🛡️" },
      { phase: "During", q: "You're driving when the quake hits. Best move?", options: ["Speed up to get home fast", "Slow down, pull over away from bridges/poles, stay inside", "Stop in the middle of a bridge", "Get out and lie on the road"], correct: 1, fact: "Bridges & overpasses can collapse — open road + staying buckled in is safest. 🚗" },
      { phase: "After", q: "Shaking stops. Building has cracks. What now?", options: ["Take the elevator down fast", "Check for gas leaks, then evacuate via stairs", "Light a candle to check for damage", "Stay and tidy up first"], correct: 1, fact: "Never use elevators after a quake — and never a naked flame if gas may be leaking! 🔥🚫" },
      { phase: "First Aid", q: "Someone's trapped under light debris and bleeding. First step?", options: ["Pull them out forcefully right away", "Apply firm pressure to the wound & call for help before moving them", "Give them water immediately", "Leave and find someone else"], correct: 1, fact: "Control bleeding first; moving a trapped person carelessly can worsen injuries. 🩹" },
      { phase: "Scenario", q: "You're in a crowded mall, tremors begin. Panic starts around you.", options: ["Sprint for the main exit with the crowd", "Drop near an interior wall, cover your neck, stay calm & still", "Take the escalator down", "Film it for social media"], correct: 1, fact: "Stampedes injure more people than the quake itself. Stay low, stay calm. 🧘" },
    ],
  },
  {
    id: "flood",
    name: "Flood",
    emoji: "🌊",
    color: "#38bdf8",
    questions: [
      { phase: "Before", q: "Flood warning issued for your area. Priority prep?", options: ["Move valuables & documents to higher ground", "Water your garden extra", "Wash your car", "Ignore it, floods never happen twice"], correct: 0, fact: "Keep documents, medicines & electronics in waterproof bags on upper floors. 📄" },
      { phase: "During", q: "Water is rising fast in your street. You must move. How?", options: ["Drive through the flooded road", "Walk through fast-moving water to save time", "Move to higher ground on foot, avoid moving water", "Wait in the basement"], correct: 2, fact: "Just 15cm of moving water can knock an adult down. Basements flood first & fastest. 🌊" },
      { phase: "During", q: "Your car stalls in rising floodwater. Next move?", options: ["Stay inside and wait it out", "Rev the engine repeatedly", "Abandon the car immediately & move to higher ground", "Open the trunk to check the engine"], correct: 2, fact: "\"Turn Around, Don't Drown\" — most flood deaths happen in vehicles. 🚗💦" },
      { phase: "After", q: "Floodwaters recede. Before entering your home, you should:", options: ["Switch on the mains power immediately", "Check for structural damage & gas leaks first, keep power off", "Drink the tap water to test it", "Walk in barefoot to feel for damage"], correct: 1, fact: "Flooded electrics = shock/fire risk. Get it inspected before power-on. ⚡" },
      { phase: "First Aid", q: "Someone has swallowed floodwater and feels sick. What do you do?", options: ["Force them to vomit", "Give them contaminated water to 'flush it out'", "Keep them hydrated with clean water & seek medical help", "Ignore it, it'll pass"], correct: 2, fact: "Floodwater carries bacteria — clean fluids + medical care prevent serious illness. 💧" },
      { phase: "Scenario", q: "Flash flood hits while you're camping near a riverbank at night.", options: ["Stay in the tent, it's waterproof", "Grab essentials & move uphill immediately, away from the river", "Try to save the tent first", "Wait till morning to move"], correct: 1, fact: "Flash floods can rise in minutes — always camp away from riverbeds & move fast. ⛺" },
    ],
  },
  {
    id: "wildfire",
    name: "Forest Fire / Wildfire",
    emoji: "🔥",
    color: "#f97316",
    questions: [
      { phase: "Before", q: "You live near a forest. Best wildfire prep around your home?", options: ["Clear dry brush & create defensible space around the house", "Plant more dry shrubs near walls for shade", "Stack firewood against the house", "Ignore it, fires stay in the forest"], correct: 0, fact: "A cleared defensible space is one of the biggest factors in whether a home survives a wildfire. 🌲" },
      { phase: "During", q: "Authorities issue a wildfire evacuation order for your area. You:", options: ["Wait to see how close the fire gets first", "Leave immediately via the designated route", "Stay to protect your property", "Drive toward the smoke to check it out"], correct: 1, fact: "Wildfires can move faster than people expect — early evacuation saves lives. 🚗💨" },
      { phase: "During", q: "You're driving and suddenly surrounded by thick wildfire smoke on the road.", options: ["Stop, stay in the car with windows/vents closed, and call for help", "Get out and run through the smoke", "Keep driving fast through zero visibility", "Open windows for fresh air"], correct: 0, fact: "A closed vehicle shields you from radiant heat far better than being caught outside. 🚙" },
      { phase: "After", q: "You're allowed back into your neighborhood after a wildfire. First thing to check?", options: ["Smouldering hot spots, embers & structural damage before entering", "Turn on every appliance to test power", "Assume everything is fine and relax", "Water your entire garden immediately"], correct: 0, fact: "Hidden embers can reignite hours or days later — inspect carefully before settling back in. 🔥" },
      { phase: "First Aid", q: "Someone is coughing badly and struggling to breathe from wildfire smoke. You:", options: ["Move them to fresh air & seek medical help if breathing worsens", "Tell them to hold their breath", "Give them a strong coffee", "Ignore it, smoke isn't dangerous"], correct: 0, fact: "Wildfire smoke contains fine particles that can seriously affect lungs — fresh air + medical care matters. 😮‍💨" },
      { phase: "Scenario", q: "While hiking, you spot smoke rising fast over a ridge and smell burning wood.", options: ["Move away from the fire, ideally crossing the wind direction, and alert others", "Walk closer to get a better look", "Wait and watch which way it spreads", "Try to put it out yourself"], correct: 0, fact: "Never try to outrun a wildfire uphill or downwind — move across the wind and get low ground fast. 🏃" },
    ],
  },
  {
    id: "cyclone",
    name: "Cyclone",
    emoji: "🌀",
    color: "#a78bfa",
    questions: [
      { phase: "Before", q: "Cyclone warning issued. Top prep priority?", options: ["Secure loose outdoor objects & stock emergency supplies", "Go for a walk to see the clouds", "Leave windows wide open for airflow", "Charge only your gaming console"], correct: 0, fact: "Loose items become dangerous projectiles in cyclone winds — tie them down! 🌪️" },
      { phase: "During", q: "Cyclone is at its peak, eye hasn't passed yet. You should:", options: ["Go outside, it seems calm", "Stay indoors, away from windows, in an interior room", "Stand near glass windows to watch", "Drive to check on relatives"], correct: 1, fact: "The calm 'eye' is temporary — dangerous winds return from the opposite direction! 👁️" },
      { phase: "During", q: "Storm surge warning for coastal areas means you should:", options: ["Move inland to higher ground immediately", "Head to the beach to watch waves", "Stay in a ground-floor coastal home", "Wait for the surge to arrive, then decide"], correct: 0, fact: "Storm surge causes most cyclone deaths — evacuate low coastal areas early. 🌊" },
      { phase: "After", q: "Cyclone has passed. Outside your home you see downed power lines. You:", options: ["Step over them carefully", "Stay far away & report them, assume they're live", "Move them aside with a stick", "Let kids play nearby, they're probably dead lines"], correct: 1, fact: "Always assume downed lines are live — electrocution risk stays high post-storm. ⚡" },
      { phase: "First Aid", q: "A family member shows signs of shock after the storm (pale, cold, dizzy). You:", options: ["Give them coffee to wake them up", "Lay them down, elevate legs, keep warm, seek help", "Make them stand and walk it off", "Leave them alone to rest"], correct: 1, fact: "Treating shock early — warmth, lying flat, elevated legs — can be life-saving. 🩺" },
      { phase: "Scenario", q: "Winds are howling, roof panels start rattling loose above you.", options: ["Move to the lowest, most interior room away from windows", "Go up to fix the roof yourself", "Stand near the window to monitor damage", "Open windows to 'equalize pressure'"], correct: 0, fact: "The 'open windows to equalize pressure' myth is false & dangerous — stay interior. 🏠" },
    ],
  },
  {
    id: "landslide",
    name: "Landslide",
    emoji: "⛰️",
    color: "#a3703a",
    questions: [
      { phase: "Before", q: "You live on a hillside. Which is an early WARNING SIGN of a coming landslide?", options: ["New cracks appearing in the ground or walls, tilting trees or poles", "The grass looking greener than usual", "Birds singing louder in the morning", "A slightly cooler evening breeze"], correct: 0, fact: "Doors/windows sticking, new cracks, and tilting trees/fences are classic pre-landslide signs. 👀" },
      { phase: "During", q: "You hear a rumbling sound and see the hillside starting to move. You should:", options: ["Run straight downhill away from the slide", "Move quickly away sideways, out of the slide's path — not straight downhill", "Stay put and watch which way it goes", "Get in your car and drive down the slope"], correct: 1, fact: "Landslides can move as fast as a car — moving sideways out of the path is safer than racing it downhill. 🏃" },
      { phase: "During", q: "You're driving and the road ahead is covered in fresh mud and fallen trees.", options: ["Drive through carefully at speed", "Stop, turn back if possible, and find an alternate route", "Get out and try to clear the road", "Park and wait for the mud to dry"], correct: 1, fact: "Roads with debris often signal an active or repeating slide zone — don't cross it. 🚧" },
      { phase: "After", q: "The landslide has stopped. What's the safest next step?", options: ["Return home immediately to check on things", "Stay away from the slide area — more slides can follow, especially after rain", "Walk across the debris to see what's under it", "Assume it's a one-time event"], correct: 1, fact: "Secondary landslides are common, especially if rain continues. Wait for an official all-clear. ⚠️" },
      { phase: "First Aid", q: "Someone is partially buried under landslide debris. First step?", options: ["Dig them out fast with your bare hands, pulling hard", "Call for rescue help, keep them calm, and clear debris carefully from the airway/chest only", "Wait exactly where you are and do nothing", "Pour water over them to help them breathe"], correct: 1, fact: "Careless digging can cause further injury — clear the airway gently and get professional rescue help fast. 🆘" },
      { phase: "Scenario", q: "After 3 days of nonstop rain, you hear cracking trees and a low rumble on the slope above your house at night.", options: ["Go back to sleep, it's probably nothing", "Evacuate immediately to higher, stable ground and alert neighbors", "Go outside to investigate the sound closely", "Wait until morning to check"], correct: 1, fact: "Prolonged rain is the #1 landslide trigger — cracking sounds at night mean it's time to move now. 🌧️" },
    ],
  },
  {
    id: "tsunami",
    name: "Tsunami",
    emoji: "🌊",
    color: "#0ea5e9",
    questions: [
      { phase: "Before", q: "You live near the coast. Best tsunami prep?", options: ["Know your area's elevation & the fastest walking route to high ground", "Buy a bigger boat to outrun it", "Build a wall of sandbags on the beach", "Nothing, tsunamis always give hours of warning"], correct: 0, fact: "Some tsunamis arrive within minutes of the triggering quake — know your evacuation route in advance. 🗺️" },
      { phase: "During", q: "You just felt a strong, long earthquake while at the beach. You should:", options: ["Wait for an official tsunami siren before moving", "Move to high ground immediately, don't wait for a warning", "Go closer to the water to check for changes", "Call friends to ask if they felt it too"], correct: 1, fact: "A strong coastal earthquake IS the warning — move to high ground right away, sirens can be too slow. 🏃‍♂️" },
      { phase: "During", q: "You notice the ocean water suddenly pulling back much farther than normal, exposing the seabed.", options: ["Walk out to see the exposed seabed and collect shells", "Evacuate to high ground immediately — this is a major warning sign", "Take photos for social media first", "Assume it's just low tide, no rush"], correct: 1, fact: "Unusual water recession often precedes a tsunami wave by minutes — treat it as an urgent signal. 🐚🚫" },
      { phase: "After", q: "The first wave has passed. What now?", options: ["Return to the coast immediately, it's over", "Stay on high ground — tsunamis come in multiple waves over hours", "Go check on your boat at the dock", "Assume the danger has fully passed"], correct: 1, fact: "Later waves can be larger than the first. Stay away from the coast until officials confirm it's safe. 🌊🌊" },
      { phase: "First Aid", q: "You pull someone out of tsunami floodwater who isn't breathing. Next step?", options: ["Wait for them to cough it out on their own", "Start CPR/rescue breathing immediately & call for emergency help", "Give them food right away", "Lay them flat and leave them to rest"], correct: 1, fact: "Every second counts in a near-drowning — starting CPR immediately dramatically improves survival odds. ❤️" },
      { phase: "Scenario", q: "You're staying at a beachfront hotel and feel strong, prolonged shaking at night.", options: ["Go back to sleep, hotels are safe", "Get up immediately and head to high ground or an upper floor per evacuation signage", "Head down to the lobby and wait near the beach exit", "Call the front desk and wait for instructions"], correct: 1, fact: "Strong coastal shaking means act now — follow posted vertical evacuation routes to high floors or high ground. 🏨" },
    ],
  },
  {
    id: "volcano",
    name: "Volcanic Eruption",
    emoji: "🌋",
    color: "#dc2626",
    questions: [
      { phase: "Before", q: "You live near an active volcano. Smart preparation includes:", options: ["Keeping goggles, N95 masks & an emergency kit for ash fall", "Ignoring official hazard maps", "Building your house directly in a known lava-flow valley", "Only worrying once you see lava"], correct: 0, fact: "Ashfall is often the widest-reaching hazard from an eruption — mask + goggles protect eyes & lungs. 😷" },
      { phase: "During", q: "Ash starts falling on your town. Best action?", options: ["Go outside to sweep it off your roof immediately", "Stay indoors, seal windows/doors, and turn off ventilation systems", "Open all windows to let it blow through", "Drive around to survey the damage"], correct: 1, fact: "Fine volcanic ash can damage lungs and engines — staying sealed indoors is safest during active ashfall. 🏠" },
      { phase: "During", q: "You're caught outdoors during an ashfall with no shelter nearby.", options: ["Cover your nose & mouth, protect your eyes, and seek shelter as fast as possible", "Breathe normally, it's just dust", "Look upward to see how much ash is falling", "Keep walking at normal pace without covering your face"], correct: 0, fact: "Even short ashfall exposure can irritate lungs & eyes badly — cover up and get inside quickly. 🧣" },
      { phase: "After", q: "The eruption has calmed but ash covers everything. What's a key safety step?", options: ["Clear ash off your roof carefully — heavy ash can collapse roofs", "Ignore the roof, ash is light", "Drive normally through thick ash on roads", "Let children play in the ash piles"], correct: 0, fact: "Wet volcanic ash is heavy and has collapsed roofs — clear it carefully and avoid overloading structures. 🏚️" },
      { phase: "First Aid", q: "Someone has ash in their eyes and is struggling to breathe. You:", options: ["Rub their eyes hard to remove the ash", "Rinse eyes gently with clean water, move them to clean air, seek help if breathing worsens", "Tell them to keep working outside", "Do nothing, it will pass"], correct: 1, fact: "Gentle rinsing (not rubbing) protects the eyes; clean air relief helps breathing — escalate if symptoms persist. 👁️" },
      { phase: "Scenario", q: "You see an ash cloud rising fast on the horizon and moving toward your town.", options: ["Go indoors immediately, seal doors/windows, and follow local alerts", "Drive toward it to get a closer look", "Stay outside to take photos", "Wait until ash actually starts falling to react"], correct: 0, fact: "Ash clouds can travel fast with the wind — sealing up early beats reacting once ash is already falling. 🌫️" },
    ],
  },
  {
    id: "lightning",
    name: "Lightning",
    emoji: "⚡",
    color: "#eab308",
    questions: [
      { phase: "Before", q: "What's the safest rule of thumb for lightning risk outdoors?", options: ["The 30-30 rule: seek shelter if thunder follows lightning within 30 seconds, wait 30 min after the last thunder", "Only worry once it starts raining", "Lightning never strikes the same area twice", "Wait until you see the actual lightning bolt to react"], correct: 0, fact: "Thunder within 30 seconds means the storm is close enough to strike — get inside right away. ⏱️" },
      { phase: "During", q: "A thunderstorm rolls in while you're outdoors. Best shelter option?", options: ["Under a tall, isolated tree", "A sturdy building or a hard-topped vehicle", "An open field for visibility", "Near a metal fence"], correct: 1, fact: "Sturdy buildings and hard-topped vehicles are the only truly safe lightning shelters outdoors. 🏢🚗" },
      { phase: "During", q: "You're caught in an open field with no shelter and lightning is striking nearby.", options: ["Lie flat on the ground", "Crouch low on the balls of your feet, feet together, minimizing contact with the ground", "Stand under the tallest nearby object", "Hold a metal umbrella or golf club upright"], correct: 1, fact: "Crouching low with minimal ground contact reduces risk — lying flat actually increases ground current exposure. ⚡" },
      { phase: "After", q: "A storm has passed and you learn someone nearby was struck by lightning. Is it safe to touch them?", options: ["No, they'll still be electrically charged", "Yes — lightning strike victims do not carry an electrical charge and are safe to touch", "Only after waiting 30 minutes", "Only if wearing rubber gloves"], correct: 1, fact: "Lightning victims don't retain a charge — you can and should help them immediately. 🤝" },
      { phase: "First Aid", q: "Someone has just been struck by lightning and isn't breathing. First step?", options: ["Wait for paramedics to arrive without touching them", "Call emergency services and start CPR immediately", "Pour water over them to 'wake them up'", "Move them to check for a burn mark only"], correct: 1, fact: "CPR started immediately after a lightning strike dramatically improves survival chances. ❤️‍🔥" },
      { phase: "Scenario", q: "You're golfing and hear distant thunder rumble while holding a metal club.", options: ["Finish the hole first, then head in", "Stop immediately, drop the club, and get to shelter", "Keep playing since the storm looks far away", "Hide under a nearby tree"], correct: 1, fact: "Metal clubs don't attract lightning, but being outdoors in a storm does — stop and shelter at the first rumble. ⛳" },
    ],
  },
  {
    id: "drought",
    name: "Drought",
    emoji: "🏜️",
    color: "#ca8a04",
    questions: [
      { phase: "Before", q: "Best long-term drought preparation for a household?", options: ["Rainwater harvesting & water storage systems", "Using more water now since it might run out later", "Removing all water storage tanks", "Watering the garden at midday for best absorption"], correct: 0, fact: "Rainwater harvesting during wetter months builds a buffer before dry spells hit hard. 🌧️🪣" },
      { phase: "During", q: "Water levels in your area are critically low. What should you prioritize?", options: ["Drinking water & basic hygiene needs first, cut non-essential use", "Filling swimming pools as normal", "Washing cars and driveways daily", "Ignoring rationing guidelines since it's inconvenient"], correct: 0, fact: "During drought, essential human needs come first — non-essential use should be cut immediately. 🚰" },
      { phase: "During", q: "You're a farmer facing an ongoing drought. A smart adaptive move is:", options: ["Switch to drought-resistant crop varieties and efficient irrigation", "Plant the same water-heavy crops as usual", "Stop irrigating entirely and hope for rain", "Increase livestock numbers to match previous years"], correct: 0, fact: "Drought-resistant crops and drip irrigation cut water use while protecting yield during dry spells. 🌾" },
      { phase: "After", q: "Rain finally returns after a long drought. A key safety step is:", options: ["Immediately resume all water use at pre-drought levels", "Monitor for health issues (dehydration/heat illness) in vulnerable people and rebuild water storage gradually", "Assume the drought risk is gone for good", "Ignore soil conditions when replanting"], correct: 1, fact: "Vulnerable groups often show delayed drought-related health effects — keep monitoring even after rain returns. 🌦️" },
      { phase: "First Aid", q: "Someone shows signs of severe dehydration/heat exhaustion (dizzy, dry mouth, weak) during a drought heatwave. You:", options: ["Move them to shade, give small sips of water, and cool their body", "Make them exercise to sweat it out", "Give them a large amount of cold water instantly", "Leave them in direct sun to 'get used to the heat'"], correct: 0, fact: "Shade, gradual rehydration, and cooling (wet cloth, fanning) are the right first response to heat exhaustion. 🥤" },
      { phase: "Scenario", q: "Your village well runs nearly dry and tensions are rising over the remaining water.", options: ["Take as much as you can before others do", "Support fair rationing and prioritize water for children, elderly & the sick", "Ignore the situation, it'll resolve itself", "Blame others publicly instead of organizing"], correct: 1, fact: "Fair, organized rationing prevents conflict and protects the most vulnerable during scarcity. 🤝💧" },
    ],
  },
  {
    id: "chemical",
    name: "Chemical Leak",
    emoji: "☣️",
    color: "#65a30d",
    questions: [
      { phase: "Before", q: "You live near an industrial area. Good preparation includes:", options: ["Knowing local warning signals & how to seal a room (plastic sheeting, tape)", "Ignoring any factory safety alerts", "Keeping windows open at all times for 'fresh air'", "Assuming leaks never happen nearby"], correct: 0, fact: "Knowing your area's alert system and having sealing supplies ready can save critical minutes. 🧻🔧" },
      { phase: "During", q: "Officials announce a chemical leak nearby and advise you to shelter-in-place. You:", options: ["Go outside to see what's happening", "Go inside, close & seal windows/doors/vents, turn off air conditioning", "Open all windows to air out your home", "Ignore it if you can't smell anything"], correct: 1, fact: "Shelter-in-place with a sealed room and no outside air exchange is the standard safe response. 🏠" },
      { phase: "During", q: "You're told to evacuate away from a chemical release. Which direction should you move?", options: ["Downwind, straight through the visible cloud for a shortcut", "Upwind and perpendicular (crosswind) to the plume, avoiding low-lying areas", "Toward the source to see how bad it is", "It doesn't matter which direction"], correct: 1, fact: "Moving crosswind/upwind keeps you out of the drifting chemical plume far more reliably than 'just running'. 💨" },
      { phase: "After", q: "The leak has been contained. Before going back outside/home, you should:", options: ["Wait for official confirmation that the air is safe", "Head straight back the moment things look normal", "Remove your mask early to test the air yourself", "Assume it's fine after a few minutes"], correct: 0, fact: "Some chemicals settle or linger — official clearance ensures the area is genuinely safe again. ✅" },
      { phase: "First Aid", q: "Someone's skin/clothing has been exposed to a leaked chemical. First step?", options: ["Rub the area to remove the chemical", "Remove contaminated clothing and flush the skin/eyes with clean water for several minutes", "Apply a lotion or oil right away", "Wait for symptoms to appear before doing anything"], correct: 1, fact: "Removing contaminated clothing and flushing with water is the standard first response to chemical exposure. 🚿" },
      { phase: "Scenario", q: "A strong, unusual chemical smell suddenly fills your neighborhood.", options: ["Go outside to identify the smell", "Go indoors immediately, seal up, turn off ventilation, and wait for official instructions", "Open windows to air the house out", "Ignore it if no one else seems concerned"], correct: 1, fact: "Treat sudden strong chemical odors as a real signal — shelter first, ask questions later. 👃🚫" },
    ],
  },
  {
    id: "nuclear",
    name: "Nuclear / Radiation Emergency",
    emoji: "☢️",
    color: "#fbbf24",
    questions: [
      { phase: "Before", q: "Best general preparation for a radiation emergency?", options: ["Know your local emergency plan and follow official guidance on protective medication only if advised", "Self-medicate with iodine tablets right now, just in case", "Assume it will never affect you and skip planning", "Build an underground bunker as the only option"], correct: 0, fact: "Protective steps like iodine tablets should only be taken on official advice, at the right time and dose. 📋" },
      { phase: "During", q: "Sirens/alerts announce a radiation release nearby. The standard guidance is:", options: ["Get Inside, Stay Inside, Stay Tuned — go to an interior room and follow official updates", "Go outside to see what's happening", "Drive toward the affected area to help", "Open windows for ventilation"], correct: 0, fact: "\"Get Inside, Stay Inside, Stay Tuned\" is the internationally recommended first response to a radiation release. 📻" },
      { phase: "During", q: "You were outside when fallout may have occurred and are now heading indoors. You should:", options: ["Walk straight in and sit on your normal furniture", "Remove your outer clothing and shoes before entering the innermost room, then shower if possible", "Shake off your clothes vigorously indoors", "Ignore it since you can't see or feel radiation"], correct: 1, fact: "Removing outer clothing outside the shelter area can remove the majority of surface contamination. 👕" },
      { phase: "After", q: "The immediate emergency has passed. When should you leave your shelter?", options: ["As soon as you feel like it", "Only when officials confirm it's safe to do so", "After exactly one hour, regardless of updates", "Immediately, since sirens have stopped"], correct: 1, fact: "Radiation levels and safety timelines are assessed by experts — always wait for the official all-clear. 🛡️" },
      { phase: "First Aid", q: "Someone may have been exposed to fallout/contamination. First response?", options: ["Have them remove contaminated clothing and wash thoroughly with soap and water", "Give them extra outdoor time to 'air out'", "Ignore it unless they feel sick", "Apply lotion to the skin immediately"], correct: 0, fact: "Removing clothing and washing promptly is the core decontamination step recommended by health authorities. 🧼" },
      { phase: "Scenario", q: "Emergency alerts announce a radiation incident while you're outdoors and far from home.", options: ["Try to get all the way home no matter how long it takes", "Go to the nearest solid building immediately, get to an interior room, and follow official updates", "Keep doing your errands as planned", "Head toward the incident location to check on family"], correct: 1, fact: "The nearest solid shelter beats a long journey home — get inside fast and let officials guide next steps. 🏢" },
    ],
  },
  {
    id: "bomb",
    name: "Bomb Explosion / Blast",
    emoji: "💥",
    color: "#f43f5e",
    questions: [
      { phase: "Before", q: "In public places, a good general safety habit is:", options: ["Being aware of exits and reporting unattended bags/suspicious items to authorities", "Ignoring unattended items, they're probably nothing", "Picking up and inspecting unattended bags yourself", "Assuming security is someone else's job entirely"], correct: 0, fact: "\"See something, say something\" — reporting unattended items to authorities is the safe, correct move. 👁️" },
      { phase: "During", q: "An explosion suddenly occurs near you in a public place. Immediate reaction?", options: ["Get down, cover your head, then move away calmly once it's safe, watching for further danger", "Run toward the blast site to help immediately", "Stand still and start filming", "Push through the crowd as fast as possible"], correct: 0, fact: "Getting down first protects you from debris; moving away calmly afterward avoids crowd crush and secondary risks. 🙇" },
      { phase: "During", q: "After an explosion, you notice a second suspicious unattended item nearby.", options: ["Investigate it to warn others", "Move away from it immediately and alert authorities — it could be a secondary device", "Pick it up and move it somewhere 'safer'", "Ignore it and focus only on the first blast site"], correct: 1, fact: "Secondary devices are a real and recognized attack pattern — never approach a second suspicious item. ⚠️" },
      { phase: "After", q: "You're evacuating a building after a blast. What's the safest approach?", options: ["Rush to the single nearest exit even if it's crowded", "Follow staff/authority instructions, use the least crowded safe exit, stay low if there's smoke", "Use the elevator to move faster", "Go back in to retrieve belongings"], correct: 1, fact: "Crowd crush at a single exit can be as dangerous as the blast — spread out and follow guided evacuation routes. 🚪" },
      { phase: "First Aid", q: "Someone near a blast is bleeding heavily from a limb injury. First step?", options: ["Apply firm direct pressure to the wound with whatever clean cloth is available and call for help", "Wait for paramedics without doing anything", "Wash the wound thoroughly first before anything else", "Move them immediately without checking the injury"], correct: 0, fact: "Direct pressure controls life-threatening bleeding fastest — apply it right away while help is called. 🩸" },
      { phase: "Scenario", q: "You hear a loud explosion in a building you're in, but alarms haven't sounded yet.", options: ["Wait for the alarm before doing anything", "Move calmly away from the area toward a safe exit, alert others, and avoid a single crowded chokepoint", "Stay exactly where you are", "Try to find out what caused it first"], correct: 1, fact: "Don't wait for alarms to confirm danger you've already witnessed — move calmly and decisively toward safety. 🚶" },
    ],
  },
  {
    id: "firstaid",
    name: "First Aid",
    emoji: "🩹",
    color: "#22c55e",
    questions: [
      { phase: "Scenario", q: "Someone collapses & isn't breathing normally. First action?", options: ["Wait for them to wake up", "Call emergency services & start CPR immediately", "Give them water", "Shake them very hard repeatedly"], correct: 1, fact: "Brain damage can start in 4-6 mins without oxygen — fast CPR saves lives. ❤️" },
      { phase: "First Aid", q: "Someone is choking and can't speak or cough. You:", options: ["Give water to wash it down", "Perform back blows & abdominal thrusts (Heimlich)", "Wait for it to clear on its own", "Slap them on the back while lying down"], correct: 1, fact: "5 back blows + 5 abdominal thrusts is the standard choking response. 🫁" },
      { phase: "First Aid", q: "Deep cut, bleeding heavily. Best immediate action?", options: ["Apply direct firm pressure with clean cloth & elevate the limb", "Wash it thoroughly first, pressure later", "Apply a tourniquet immediately for any cut", "Let it bleed to 'clean itself'"], correct: 0, fact: "Direct pressure stops most bleeding — tourniquets are only for severe limb bleeds. 🩸" },
      { phase: "Scenario", q: "A friend twists their ankle badly on a hike & it's swelling fast.", options: ["Keep walking, it's totally fine", "R.I.C.E — Rest, Ice, Compression, Elevation", "Massage it hard immediately", "Apply heat right away"], correct: 1, fact: "R.I.C.E. reduces swelling; heat & massage early can worsen it. 🧊" },
      { phase: "First Aid", q: "Someone is having a seizure. What should you do?", options: ["Hold them down firmly", "Put something in their mouth to stop tongue-biting", "Clear the area, cushion their head, time it, don't restrain", "Pour water on their face"], correct: 2, fact: "Never restrain or put objects in the mouth — protect the head & wait it out. 🧠" },
      { phase: "Scenario", q: "A stranger collapses in a mall, no pulse, crowd is filming instead of helping.", options: ["Assume someone else will help", "Call for help loudly, start CPR & direct someone to get an AED", "Wait for paramedics quietly", "Move the person to a private area first"], correct: 1, fact: "This is the 'bystander effect' — assign tasks directly (\"You, call 911!\") to break it. 📢" },
    ],
  },
];

const PHASE_DIFFICULTY = {
  Before: "Easy",
  During: "Medium",
  After: "Medium",
  "First Aid": "Hard",
  Scenario: "Hard",
};

const DIFFICULTY_XP_BASE = { Easy: 70, Medium: 100, Hard: 140 };

const LEVELS = [
  { id: "Easy", emoji: "🟢", label: "Easy", desc: "Basics & prep", activeClasses: "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-xl shadow-emerald-500/10" },
  { id: "Medium", emoji: "🟡", label: "Medium", desc: "During & after", activeClasses: "border-amber-500 bg-amber-500/20 text-amber-300 shadow-xl shadow-amber-500/10" },
  { id: "Hard", emoji: "🔴", label: "Hard", desc: "First aid & scenarios", activeClasses: "border-red-500 bg-red-500/20 text-red-300 shadow-xl shadow-red-500/10" },
];

const QUESTION_TIME = 15;

const CORRECT_MESSAGES = [
  { big: "YAY! 🎉", sub: "That's correct — good job!" },
  { big: "NAILED IT! 🔥", sub: "You clearly know your stuff." },
  { big: "BOOM! 💥", sub: "Correct! You'd survive that one." },
  { big: "YES!! ✅", sub: "Sharp thinking, keep it up!" },
  { big: "CRUSHING IT 🙌", sub: "That's exactly right." },
];

const WRONG_MESSAGES = [
  { big: "Better luck next time 💪", sub: "more questions remaining — you got this" },
  { big: "It's okay, don't lose hope yet 🌱", sub: "more questions remaining, keep going" },
  { big: "So close! 🙂", sub: "more questions remaining, shake it off" },
  { big: "Not quite, but that's okay 🤝", sub: "more questions remaining — bounce back" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ConfettiBurst({ trigger }) {
  const pieces = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      rotate: Math.random() * 360,
      color: ["#ef4444", "#f59e0b", "#22c55e", "#38bdf8", "#a78bfa", "#ec4899"][i % 6],
      size: 6 + Math.random() * 6,
    }))
  ).current;

  if (!trigger) return null;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[60]">
      {pieces.map((p) => (
        <span
          key={p.id + trigger}
          style={{
            left: `${p.left}%`,
            top: "-10px",
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
          className="absolute rounded-sm confetti-fall"
        />
      ))}
    </div>
  );
}

function AnswerPopup({ isCorrect, message, remaining, xpEarned, fact, onContinue, isLast }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 popup-backdrop">
      <div
        className={`absolute inset-0 ${isCorrect ? "bg-emerald-950/60" : "bg-red-950/50"} backdrop-blur-sm`}
        onClick={onContinue}
      />
      <div
        className={`relative w-full max-w-md rounded-3xl p-8 text-center border popup-pop ${
          isCorrect ? "bg-zinc-950 border-emerald-500/40" : "bg-zinc-950 border-red-500/40"
        }`}
        style={{
          boxShadow: isCorrect
            ? "0 0 60px -10px rgba(16,185,129,0.5)"
            : "0 0 60px -10px rgba(239,68,68,0.4)",
        }}
      >
        <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${isCorrect ? "bg-emerald-500/15" : "bg-red-500/15"} icon-pop`}>
          {isCorrect ? (
            <PartyPopper className="w-8 h-8 text-emerald-400" />
          ) : (
            <HeartCrack className="w-8 h-8 text-red-400" />
          )}
        </div>

        <h3 className={`text-2xl md:text-3xl font-extrabold mb-1 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
          {message.big}
        </h3>
        <p className="text-zinc-400 text-sm md:text-base mb-4">
          {message.sub}{!isCorrect && !isLast && <> — {remaining} left</>}
        </p>

        {isCorrect && (
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/15 text-amber-400 text-sm font-bold">
              <Sparkles className="w-4 h-4" /> +{xpEarned} XP
            </div>
          </div>
        )}

        <div className="text-sm text-zinc-400 bg-zinc-900/90 rounded-2xl p-4 mb-6 leading-relaxed text-left border border-zinc-800">
          💡 {fact}
        </div>

        <button
          onClick={onContinue}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition active:scale-[0.97] ${
            isCorrect ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {isLast ? "See Results" : "Continue"} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function Quiz({ onExit, onXPEarned }) {
  const allQuestions = useMemo(
    () =>
      CATEGORIES.flatMap((cat) =>
        cat.questions.map((q) => ({
          ...q,
          catId: cat.id,
          catName: cat.name,
          catEmoji: cat.emoji,
          catColor: cat.color,
          difficulty: PHASE_DIFFICULTY[q.phase] || "Medium",
        }))
      ),
    []
  );

  const levelCounts = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    allQuestions.forEach((q) => {
      counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    });
    return counts;
  }, [allQuestions]);

  const [stage, setStage] = useState("intro"); // intro | quiz | result
  const [selectedLevel, setSelectedLevel] = useState("Easy");
  const [deck, setDeck] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [confettiKey, setConfettiKey] = useState(0);
  const [popup, setPopup] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const timerRef = useRef(null);

  // Load chosen companion from localStorage or default
  const [activeCompanion, setActiveCompanion] = useState(() => {
    const email = localStorage.getItem('currentUserEmail');
    let xp = 3450;
    if (email) {
      const savedUser = localStorage.getItem(`user_${email}`);
      if (savedUser) {
        try {
          xp = JSON.parse(savedUser).xp || 3450;
        } catch (e) {}
      }
    }
    if (xp >= 5000) return '/raichu.mp4';
    if (xp >= 1200) return '/pikachu.mp4';
    return '/pichu.mp4';
  });

  const total = deck.length;
  const current = deck[qIndex];

  const startQuiz = () => {
    const levelQuestions = allQuestions.filter((q) => q.difficulty === selectedLevel);
    setDeck(shuffle(levelQuestions));
    setStage("quiz");
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setXpGained(0);
    setSelected(null);
    setLocked(false);
    setPopup(null);
    setUserAnswers([]);
    setTimeLeft(QUESTION_TIME);
  };

  const goNext = useCallback(() => {
    setPopup(null);
    if (qIndex + 1 >= total) {
      setStage("result");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setLocked(false);
      setTimeLeft(QUESTION_TIME);
    }
  }, [qIndex, total]);

  useEffect(() => {
    if (stage !== "quiz" || locked || !current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage, qIndex, locked]);

  function handleAnswer(idx) {
    if (locked || !current) return;
    clearInterval(timerRef.current);
    setLocked(true);
    setSelected(idx);
    const isCorrect = idx === current.correct;
    const remaining = total - (qIndex + 1);
    const isLast = qIndex + 1 >= total;

    setUserAnswers((prev) => [
      ...prev,
      { catId: current.catId, catName: current.catName, emoji: current.catEmoji, isCorrect }
    ]);

    if (isCorrect) {
      const diff = current.difficulty || "Medium";
      const xpBase = DIFFICULTY_XP_BASE[diff];

      const speedBonus = Math.round((timeLeft / QUESTION_TIME) * 40);
      const newStreak = streak + 1;
      const comboBonus = Math.min(newStreak * 10, 50);
      const earned = xpBase + speedBonus + comboBonus;

      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setScore((s) => s + 1);
      setXpGained((x) => x + earned);
      setConfettiKey((k) => k + 1);
      onXPEarned?.(earned);

      const msg = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
      setPopup({ isCorrect: true, message: msg, xpEarned: earned, remaining, fact: current.fact, isLast });
    } else {
      setStreak(0);
      const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
      setPopup({ isCorrect: false, message: msg, xpEarned: 0, remaining, fact: current.fact, isLast });
    }
  }

  const progressPct = total ? (qIndex / total) * 100 : 0;
  const timePct = (timeLeft / QUESTION_TIME) * 100;

  /* ---------------- INTRO SCREEN ---------------- */
  if (stage === "intro") {
    return (
      <div className="h-screen w-screen relative flex items-center justify-center p-6 md:p-10 overflow-hidden bg-black">
        <style>{globalStyles}</style>
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 backdrop-blur-[12px] filter brightness-65 scale-105" 
          style={{ backgroundImage: `url('/quizbg.png')` }}
        />

        <div className="relative z-10 max-w-4xl w-full text-center mx-auto flex flex-col justify-center h-full">
          <div className="text-5xl md:text-6xl mb-2 animate-bounce-slow drop-shadow-md">🧠</div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-xl">
            Know<span className="text-red-500">2</span>Survive
          </h1>
          <p className="text-zinc-100 text-sm md:text-base mb-6 max-w-2xl mx-auto leading-snug drop-shadow-lg font-medium">
            Rapid-fire questions across every major disaster —
            before, during, after, first aid & real-life scenarios.
          </p>

          <div className="flex justify-center gap-2 mb-6 flex-wrap max-w-3xl mx-auto">
            {CATEGORIES.map((c) => (
              <span key={c.id} className="text-[11px] md:text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-700/60 text-zinc-200 shadow-md backdrop-blur-md">
                {c.emoji} {c.name}
              </span>
            ))}
          </div>

          <p className="text-white text-xs font-bold uppercase tracking-widest mb-3 drop-shadow">Choose your level</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
            {LEVELS.map((lvl) => {
              const isActive = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`flex flex-col items-center gap-1.5 py-4 px-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                    isActive 
                      ? `${lvl.activeClasses} ring-2 ring-white/40 scale-[1.02] shadow-2xl` 
                      : "border-zinc-700/60 bg-zinc-950/80 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900/90 shadow-md"
                  }`}
                >
                  <span className="text-2xl">{lvl.emoji}</span>
                  <span className="text-base font-bold">{lvl.label}</span>
                  <span className="text-[11px] opacity-85">{lvl.desc}</span>
                  <span className="text-[10px] font-semibold mt-0.5 opacity-90 px-2 py-0.2 rounded-full bg-black/60">{levelCounts[lvl.id] || 0} questions</span>
                </button>
              );
            })}
          </div>

          <div className="max-w-xs md:max-w-sm mx-auto w-full">
            <button
              onClick={startQuiz}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-base transition active:scale-[0.98] shadow-2xl shadow-red-600/40 cursor-pointer text-white"
            >
              <Play className="w-4 h-4 fill-current" /> Start {selectedLevel} Quiz
            </button>

            {onExit && (
              <button onClick={onExit} className="mt-3 text-xs md:text-sm text-zinc-200 hover:text-white transition block w-full text-center font-medium drop-shadow">
                Back to dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- RESULT SCREEN WITH QUIZINSIDE BACKGROUND, CENTERED, NON-SCROLLABLE ---------------- */
  if (stage === "result") {
    const pct = Math.round((score / total) * 100);
    const rank =
      pct === 100
        ? { label: "Survival Legend", emoji: "👑" }
        : pct >= 80
        ? { label: "Disaster Ready", emoji: "🛡️" }
        : pct >= 50
        ? { label: "Getting There", emoji: "💪" }
        : { label: "Needs Drilling", emoji: "🚧" };

    const catMap = {};
    userAnswers.forEach((ans) => {
      if (!catMap[ans.catId]) {
        catMap[ans.catId] = { name: ans.catName, emoji: ans.emoji, correct: 0, total: 0 };
      }
      catMap[ans.catId].total += 1;
      if (ans.isCorrect) catMap[ans.catId].correct += 1;
    });

    const categoryBreakdown = Object.values(catMap).map((cat) => ({
      ...cat,
      percentage: cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0,
    })).sort((a, b) => b.percentage - a.percentage);

    const areasNeedingImprovement = categoryBreakdown.filter((c) => c.percentage < 70);

    return (
      <div className="h-screen w-screen relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-6 bg-black">
        <style>{globalStyles}</style>
        {/* Background image `quizinside.png` with blur on result screen */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 backdrop-blur-[12px] filter brightness-65 scale-105" 
          style={{ backgroundImage: `url('/quizinside.png')` }}
        />
        <ConfettiBurst trigger={confettiKey} />

        <div className="relative z-10 max-w-lg w-full text-center mx-auto flex flex-col justify-center items-center h-full my-auto">
          <div className="text-5xl mb-1.5 animate-pop">{rank.emoji}</div>
          <h2 className="text-2xl md:text-3xl font-black mb-0.5 text-black drop-shadow-sm">{rank.label}!</h2>
          <p className="text-black text-xs md:text-sm mb-4 font-bold drop-shadow-sm">
            Your Comprehensive Disaster Preparedness Report
          </p>

          {/* Preparedness Score Banner - Smaller & Centered */}
          <div className="rounded-2xl border border-white/20 bg-zinc-950/85 p-4 mb-4 shadow-xl relative overflow-hidden backdrop-blur-md w-full max-w-md mx-auto">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">Overall Preparedness Score</div>
            <div className="text-3xl md:text-4xl font-black text-amber-400 mb-1">{pct}%</div>
            <p className="text-[11px] text-zinc-300 max-w-xs mx-auto leading-tight">
              {pct >= 80 
                ? "Outstanding! High survival awareness across emergencies." 
                : pct >= 50 
                ? "Good foundation! Review your weaker topics below." 
                : "Significant training recommended. Focus on improvement areas below."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-4 w-full max-w-md mx-auto">
            <StatBox label="Score" value={`${score}/${total}`} icon={<Trophy className="w-3.5 h-3.5" />} color="#f59e0b" />
            <StatBox label="XP Earned" value={`+${xpGained}`} icon={<Sparkles className="w-3.5 h-3.5" />} color="#ef4444" />
            <StatBox label="Best Streak" value={`${bestStreak}🔥`} icon={<FireIcon className="w-3.5 h-3.5" />} color="#38bdf8" />
          </div>

          {/* Areas Needing Improvement & Breakdown - Compact & Non-scrollable */}
          <div className="rounded-2xl border border-white/20 bg-zinc-950/85 p-3.5 mb-5 text-left backdrop-blur-md shadow-xl w-full max-w-md mx-auto max-h-36 overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Areas Needing Improvement
            </h3>
            {areasNeedingImprovement.length === 0 ? (
              <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Amazing! 70%+ across all disaster categories.
              </p>
            ) : (
              <div className="space-y-1.5">
                {areasNeedingImprovement.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-[11px] bg-zinc-900/90 py-1.5 px-2.5 rounded-lg border border-zinc-800">
                    <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                      <span>{cat.emoji}</span> {cat.name}
                    </span>
                    <span className="text-red-400 font-bold">{cat.percentage}% ({cat.correct}/{cat.total})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center w-full max-w-md mx-auto">
            <button
              onClick={startQuiz}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-xs md:text-sm transition active:scale-95 shadow-lg shadow-red-600/35 cursor-pointer text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Quiz
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 font-semibold text-xs md:text-sm transition active:scale-95 border border-zinc-700 cursor-pointer text-zinc-200 backdrop-blur-sm"
              >
                <Home className="w-3.5 h-3.5" /> Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- QUIZ SCREEN WITH QUIZINSIDE BACKGROUND ---------------- */
  if (!current) return null;

  return (
    <div className="h-screen w-screen relative overflow-hidden flex flex-col justify-center p-6 md:p-12">
      <style>{globalStyles}</style>
      
      {/* Background image `quizinside.png` with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 backdrop-blur-[8px] filter brightness-75 scale-105" 
        style={{ backgroundImage: `url('/quizinside.png')` }}
      />
      
      <ConfettiBurst trigger={confettiKey} />
      {popup && (
        <AnswerPopup
          isCorrect={popup.isCorrect}
          message={popup.message}
          remaining={popup.remaining}
          xpEarned={popup.xpEarned}
          fact={popup.fact}
          isLast={popup.isLast}
          onContinue={goNext}
        />
      )}

      <div className="max-w-3xl mx-auto w-full relative z-10 bg-black/55 p-6 md:p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setStage("intro")}
            className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 transition cursor-pointer"
          >
            <X className="w-5 h-5 text-zinc-300" />
          </button>
          <div className="flex items-center gap-2 text-sm md:text-base text-zinc-200 font-bold">
            <span className="text-xl">{current.catEmoji}</span>
            <span className="tracking-wide">{current.catName}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-xs md:text-sm font-bold text-amber-400">
            <FireIcon className="w-4 h-4" /> {streak} streak
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-zinc-900/80 rounded-full overflow-hidden mb-2 border border-zinc-700/60">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-300 mb-6 font-semibold">
          <span>Question {qIndex + 1} of {total}</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> {xpGained} XP
          </span>
        </div>

        {/* Timer bar */}
        <div className="flex items-center gap-3 mb-5">
          <TimerIcon className={`w-4 h-4 ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-zinc-300"}`} />
          <div className="flex-1 h-1.5 bg-zinc-900/80 rounded-full overflow-hidden border border-zinc-700/60">
            <div
              className="h-full rounded-full transition-all duration-1000 linear"
              style={{ width: `${timePct}%`, background: timeLeft <= 5 ? "#ef4444" : "#22c55e" }}
            />
          </div>
          <span className={`text-xs font-mono font-bold w-6 text-right ${timeLeft <= 5 ? "text-red-500" : "text-zinc-300"}`}>
            {timeLeft}s
          </span>
        </div>

        {/* Question card */}
        <div key={qIndex} className="relative rounded-2xl border border-zinc-700/80 bg-zinc-950/85 p-6 md:p-8 mb-5 quiz-card-in shadow-xl backdrop-blur-md">
          <h2 className="text-lg md:text-xl font-bold leading-relaxed text-white">{current.q}</h2>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {current.options.map((opt, idx) => {
            const isCorrect = idx === current.correct;
            const isSelected = idx === selected;
            let stateClasses = "border-zinc-700/80 bg-zinc-950/80 hover:border-zinc-500 hover:bg-zinc-900/90 text-zinc-100";
            if (locked) {
              if (isCorrect) stateClasses = "border-emerald-500 bg-emerald-950/60 text-emerald-200";
              else if (isSelected && !isCorrect) stateClasses = "border-red-500 bg-red-950/60 text-red-200";
              else stateClasses = "border-zinc-800 bg-zinc-950/40 opacity-40 text-zinc-400";
            }
            return (
              <button
                key={idx}
                disabled={locked}
                onClick={() => handleAnswer(idx)}
                className={`flex items-center justify-between gap-3 text-left p-4 rounded-xl border transition-all backdrop-blur-sm shadow-md ${stateClasses} ${!locked ? "active:scale-[0.98] cursor-pointer" : ""}`}
              >
                <span className="font-medium text-xs md:text-sm leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Active Companion Widget in Bottom Right Corner */}
      <div className="absolute bottom-5 right-5 z-50 flex flex-col items-center pointer-events-none">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-zinc-900/90 border-2 border-amber-400/80 shadow-2xl overflow-hidden flex items-center justify-center backdrop-blur-md">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={activeCompanion} type="video/mp4" />
          </video>
        </div>
        <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-black/75 border border-zinc-800 text-[10px] font-bold text-amber-300 tracking-wider uppercase backdrop-blur-sm">
          Companion
        </span>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon, color }) {
  return (
    <div className="rounded-xl border border-white/20 bg-zinc-950/85 p-3 backdrop-blur-md shadow-md">
      <div className="flex items-center justify-center gap-1 mb-0.5" style={{ color }}>
        {icon}
      </div>
      <div className="text-lg md:text-xl font-extrabold mb-0.5 text-white">{value}</div>
      <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}

const globalStyles = `
html, body, #root {
  background: #000000 !important;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

@keyframes fall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(420px) rotate(360deg); opacity: 0; }
}
.confetti-fall { animation: fall 1.6s ease-in forwards; }

@keyframes popIn {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.animate-pop { animation: popIn 0.5s ease-out; }
.icon-pop { animation: popIn 0.4s ease-out; }

@keyframes cardIn {
  0% { transform: translateY(10px) scale(0.98); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
.quiz-card-in { animation: cardIn 0.3s ease-out; }

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.animate-bounce-slow { animation: bounceSlow 2.5s ease-in-out infinite; }

@keyframes backdropIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
.popup-backdrop { animation: backdropIn 0.2s ease-out; }

@keyframes popupPop {
  0% { transform: scale(0.7) translateY(10px); opacity: 0; }
  60% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.popup-pop { animation: popupPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
`;