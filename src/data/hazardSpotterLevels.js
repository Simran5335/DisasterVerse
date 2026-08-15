// Hazard Spotter 20 Level Dataset across 4 Environments (Home, School, Office, Outdoors)
export const hazardSpotterLevels = {
  home: [
    {
      id: "home-level-1",
      envId: "home",
      envName: "Home",
      levelNumber: 1,
      difficulty: "Easy",
      image: "/images/hazard/home/level1.jpg",
      totalHazards: 3,
      hazards: [
        {
          id: "home-l1-candle",
          name: "Candle Near Curtain",
          category: "Fire Hazard",
          risk: "Fire ignition risk",
          explanation: "An open flame placed close to fabric curtains can easily ignite a house fire.",
          safetyTip: "Keep candles and open flames at least 3 feet away from curtains and combustible fabrics.",
          x: 30.5,
          y: 47,
          width: 8.5,
          height: 16
        },
        {
          id: "home-l1-iron",
          name: "Unattended Steam Iron",
          category: "Burn & Fire Hazard",
          risk: "Thermal burn & fabric scorch fire",
          explanation: "An active hot iron left resting face-down on a wooden table can scorch surfaces or burn occupants.",
          safetyTip: "Always switch off, unplug, and place hot irons upright on heat-resistant pads when unattended.",
          x: 61.8,
          y: 48.5,
          width: 8.5,
          height: 17
        },
        {
          id: "home-l1-cable",
          name: "Loose Cable Across Floor",
          category: "Trip Hazard",
          risk: "Trip and fall injury",
          explanation: "Power cables trailing loosely across main walking paths present a serious tripping risk.",
          safetyTip: "Secure cables along baseboards using cable clips or wire conduits.",
          x: 52.5,
          y: 80.5,
          width: 22,
          height: 12
        }
      ]
    },
    {
      id: "home-level-2",
      envId: "home",
      envName: "Home",
      levelNumber: 2,
      difficulty: "Easy-Medium",
      image: "/images/hazard/home/level2.jpg",
      totalHazards: 4,
      hazards: [
        {
          id: "home-l2-strip",
          name: "Overloaded Power Strip",
          category: "Electrical",
          risk: "Electrical fire & short circuit",
          explanation: "Plugging multiple high-wattage appliances into a single extension bar can overheat internal wiring.",
          safetyTip: "Never daisy-chain power strips. Plug high-draw appliances directly into dedicated wall outlets.",
          x: 75,
          y: 72,
          width: 14,
          height: 12
        },
        {
          id: "home-l2-chem",
          name: "Chemicals Under Unlocked Counter",
          category: "Chemical Poisoning",
          risk: "Accidental toxic ingestion",
          explanation: "Bleach and heavy cleaners stored in low unlocked cabinets pose a poisoning hazard for children.",
          safetyTip: "Store household cleaning products in high, locked cabinets out of reach.",
          x: 24,
          y: 65,
          width: 12,
          height: 16
        },
        {
          id: "home-l2-spill",
          name: "Water Spill near Refrigerator",
          category: "Slip Hazard",
          risk: "Slip and fall impact",
          explanation: "Puddled liquid on tile or hardwood floors dramatically reduces foot traction.",
          safetyTip: "Wipe up liquid spills immediately and place non-slip mats near water appliances.",
          x: 48,
          y: 80,
          width: 18,
          height: 10
        },
        {
          id: "home-l2-mirror",
          name: "Unsecured Wall Mirror",
          category: "Falling Object",
          risk: "Crush and laceration injury",
          explanation: "Heavy wall mirrors mounted with weak adhesive or thin wire can dislodge during mild tremors.",
          safetyTip: "Mount heavy wall decor directly into wall studs using heavy-duty anchor bolts.",
          x: 50,
          y: 25,
          width: 15,
          height: 22
        }
      ]
    },
    {
      id: "home-level-3",
      envId: "home",
      envName: "Home",
      levelNumber: 3,
      difficulty: "Medium",
      image: "/images/hazard/home/level3.jpg",
      totalHazards: 5,
      hazards: [
        {
          id: "home-l3-gas",
          name: "Gas Stove Knob Left On",
          category: "Gas Leak",
          risk: "Asphyxiation & explosion hazard",
          explanation: "Unignited LPG gas leaking into a closed kitchen can ignite from a single spark.",
          safetyTip: "Always double-check burner knobs and shut off the main cylinder regulator valve at night.",
          x: 32,
          y: 45,
          width: 14,
          height: 14
        },
        {
          id: "home-l3-knife",
          name: "Chef Knife Over Counter Edge",
          category: "Cut Hazard",
          risk: "Severe laceration / foot injury",
          explanation: "A sharp knife resting over the counter lip can easily be knocked off by passing occupants.",
          safetyTip: "Place sharp cutlery inside a wooden block or magnet strip away from counter edges.",
          x: 58,
          y: 50,
          width: 10,
          height: 10
        },
        {
          id: "home-l3-heater",
          name: "Space Heater Near Bedding",
          category: "Fire Risk",
          risk: "Combustion fire hazard",
          explanation: "Portable space heaters generate intense radiant heat that can ignite nearby blankets.",
          safetyTip: "Maintain at least 3 feet of clear space around all portable heating units.",
          x: 80,
          y: 68,
          width: 12,
          height: 16
        },
        {
          id: "home-l3-shelf",
          name: "Tall Unanchored Bookshelf",
          category: "Structural / Earthquake",
          risk: "Topple and crush injury",
          explanation: "Tall, top-heavy furniture can tip forward during minor seismic activity.",
          safetyTip: "Anchor tall bookcases and armoires securely to the wall using L-brackets.",
          x: 12,
          y: 35,
          width: 16,
          height: 35
        },
        {
          id: "home-l3-exit",
          name: "Blocked Balcony Exit Door",
          category: "Evacuation Block",
          risk: "Trapped during emergency",
          explanation: "Storage boxes piled in front of exit doors prevent rapid escape during fires.",
          safetyTip: "Keep all primary and secondary emergency exits completely clear of clutter.",
          x: 90,
          y: 55,
          width: 12,
          height: 25
        }
      ]
    },
    {
      id: "home-level-4",
      envId: "home",
      envName: "Home",
      levelNumber: 4,
      difficulty: "Hard",
      image: "/images/hazard/home/level4.jpg",
      totalHazards: 6,
      hazards: [
        {
          id: "home-l4-blanket",
          name: "Frayed Electric Blanket Cord",
          category: "Electrical",
          risk: "Electrical shock & bedding fire",
          explanation: "Exposed wire filaments in electric bedding can spark against fabric sheets.",
          safetyTip: "Inspect electric blankets regularly and discard any units with frayed wiring.",
          x: 68,
          y: 70,
          width: 12,
          height: 10
        },
        {
          id: "home-l4-meds",
          name: "Low Medicine Cabinet",
          category: "Poisoning",
          risk: "Accidental drug overdose",
          explanation: "Prescription medications stored on low unlocked shelves invite accidental ingestion.",
          safetyTip: "Store all prescription drugs in child-proof containers inside locked cabinets.",
          x: 22,
          y: 42,
          width: 12,
          height: 18
        },
        {
          id: "home-l4-pot",
          name: "Pot Handle Turned Outward",
          category: "Scald Hazard",
          risk: "Boiling liquid burn",
          explanation: "Pot handles protruding past the stove edge are easily bumped by passersby.",
          safetyTip: "Always turn pot and pan handles inward toward the center of the stovetop.",
          x: 42,
          y: 48,
          width: 10,
          height: 12
        },
        {
          id: "home-l4-rug",
          name: "Frayed Rug at Stair Top",
          category: "Stairway Fall",
          risk: "Severe tumbling fall",
          explanation: "Unsecured loose rug edges at the head of a staircase are top causes of home falls.",
          safetyTip: "Use rubber anti-slip rug pads or double-sided carpet tape under all rugs.",
          x: 50,
          y: 82,
          width: 16,
          height: 10
        },
        {
          id: "home-l4-vent",
          name: "Covered TV Air Vent",
          category: "Overheating",
          risk: "Component fire",
          explanation: "Placing cloth or paper over electronics cooling vents causes rapid heat buildup.",
          safetyTip: "Ensure all electronic appliances have at least 2 inches of free air ventilation.",
          x: 78,
          y: 38,
          width: 14,
          height: 14
        },
        {
          id: "home-l4-boxes",
          name: "Boxes Near Water Heater",
          category: "Combustible Storage",
          risk: "Pilot light ignition fire",
          explanation: "Cardboard stored next to gas water heaters can ignite from pilot flames.",
          safetyTip: "Keep a 3-foot clearance perimeter around water heaters and furnaces.",
          x: 10,
          y: 75,
          width: 16,
          height: 16
        }
      ]
    },
    {
      id: "home-level-5",
      envId: "home",
      envName: "Home",
      levelNumber: 5,
      difficulty: "Expert",
      image: "/images/hazard/home/level5.jpg",
      totalHazards: 7,
      hazards: [
        {
          id: "home-l5-micro",
          name: "Damaged Microwave Cable",
          category: "Electrical",
          risk: "Arc flash and electrical shock",
          explanation: "Cracked insulation on high-draw appliance cords poses severe short circuit dangers.",
          safetyTip: "Replace worn appliance cords immediately; never wrap damaged cords in tape.",
          x: 28,
          y: 38,
          width: 10,
          height: 12
        },
        {
          id: "home-l5-gas",
          name: "Unchained Gas Cylinder",
          category: "Pressure Vessel",
          risk: "Tank rupture or valve break",
          explanation: "Freestanding gas cylinders can knock over during tremors, shearing off valve stems.",
          safetyTip: "Secure gas cylinders to a wall or heavy frame with metal safety chains.",
          x: 12,
          y: 62,
          width: 12,
          height: 22
        },
        {
          id: "home-l5-fan",
          name: "Loose Ceiling Fan Bracket",
          category: "Overhead Fall",
          risk: "Impact injury",
          explanation: "Wobbly ceiling fans with loose mounting screws can detach during operation.",
          safetyTip: "Tighten ceiling fan mounting brackets and safety cables annually.",
          x: 50,
          y: 15,
          width: 14,
          height: 14
        },
        {
          id: "home-l5-pest",
          name: "Pesticide Near Food Storage",
          category: "Contamination",
          risk: "Chemical food poisoning",
          explanation: "Insect sprays stored alongside pantry food items risk chemical cross-contamination.",
          safetyTip: "Never store pesticides, herbicides, or motor oils near food or cookware.",
          x: 65,
          y: 42,
          width: 10,
          height: 14
        },
        {
          id: "home-l5-batt",
          name: "Leaking Battery on Shelf",
          category: "Chemical Acid",
          risk: "Corrosive burn",
          explanation: "Leaking alkaline batteries discharge corrosive potassium hydroxide.",
          safetyTip: "Remove old batteries from unused electronics and store spares in cool dry boxes.",
          x: 82,
          y: 32,
          width: 10,
          height: 12
        },
        {
          id: "home-l5-glass",
          name: "Cracked Glass Tabletop",
          category: "Sharp Laceration",
          risk: "Shatter injury",
          explanation: "Structural cracks in glass coffee tables can suddenly collapse under light weight.",
          safetyTip: "Replace cracked tempered glass furniture immediately to prevent shatter injuries.",
          x: 48,
          y: 62,
          width: 18,
          height: 14
        },
        {
          id: "home-l5-panel",
          name: "Blocked Fuse Box Panel",
          category: "Emergency Access",
          risk: "Delayed power shutoff",
          explanation: "Furniture stacked in front of the main electrical breaker delays shutoff during short circuits.",
          safetyTip: "Maintain a 36-inch clear path in front of all home electrical distribution panels.",
          x: 88,
          y: 58,
          width: 12,
          height: 20
        }
      ]
    }
  ],

  school: [
    {
      id: "school-level-1",
      envId: "school",
      envName: "School",
      levelNumber: 1,
      difficulty: "Easy",
      image: "/images/hazard/school/level1.jpg",
      totalHazards: 3,
      hazards: [
        {
          id: "school-l1-socket",
          name: "Exposed Broken Wall Socket",
          category: "Electrical Hazard",
          risk: "High-voltage electrocution",
          explanation: "A cracked switchplate with exposed live wiring can cause electric shock to students.",
          safetyTip: "Cover unused outlets with safety caps and repair broken switchplates immediately.",
          x: 91,
          y: 32,
          width: 10,
          height: 24
        },
        {
          id: "school-l1-spill",
          name: "Spilled Water near Cooler",
          category: "Slip Hazard",
          risk: "Slip and head impact",
          explanation: "Water leaking onto smooth school hallway tile creates a severe slipping hazard.",
          safetyTip: "Place 'Caution: Wet Floor' warning cones over spills until cleaned.",
          x: 65,
          y: 82,
          width: 22,
          height: 16
        },
        {
          id: "school-l1-bags",
          name: "Backpacks Blocking Aisle",
          category: "Evacuation Hazard",
          risk: "Tripping during fire drill",
          explanation: "School bags cluttering center walkways block emergency evacuation routes.",
          safetyTip: "Store all student backpacks under desks or inside wall cubbies.",
          x: 30,
          y: 74,
          width: 20,
          height: 20
        }
      ]
    },
    {
      id: "school-level-2",
      envId: "school",
      envName: "School",
      levelNumber: 2,
      difficulty: "Easy-Medium",
      image: "/images/hazard/school/level2.jpg",
      totalHazards: 4,
      hazards: [
        {
          id: "school-l2-flask",
          name: "Uncapped Lab Flask",
          category: "Chemical Fumes",
          risk: "Toxic vapor inhalation",
          explanation: "Unsealed chemical reagents in science labs release dangerous vapors into the room.",
          safetyTip: "Always cap chemical flasks tightly when not actively performing titrations.",
          x: 35,
          y: 48,
          width: 10,
          height: 14
        },
        {
          id: "school-l2-books",
          name: "Overstacked Heavy Textbooks",
          category: "Falling Object",
          risk: "Head trauma injury",
          explanation: "Stacking thick encyclopedias high on top shelves without bookends can cause them to fall.",
          safetyTip: "Store heavy textbooks on lower shelves and use heavy metal bookends.",
          x: 78,
          y: 28,
          width: 14,
          height: 20
        },
        {
          id: "school-l2-window",
          name: "Broken Glass Window Pane",
          category: "Sharp Laceration",
          risk: "Deep cut hazard",
          explanation: "Cracked window panes can shatter inwards when pushed by wind or student activity.",
          safetyTip: "Board up broken window panes immediately and notify maintenance staff.",
          x: 15,
          y: 30,
          width: 16,
          height: 22
        },
        {
          id: "school-l2-pin",
          name: "Missing Fire Extinguisher Pin",
          category: "Equipment Failure",
          risk: "Accidental discharge / failure",
          explanation: "A missing safety pull-pin can lead to accidental discharge or extinguisher tamper.",
          safetyTip: "Inspect fire extinguishers monthly to verify pull-pins and tamper seals are intact.",
          x: 88,
          y: 55,
          width: 10,
          height: 16
        }
      ]
    },
    {
      id: "school-level-3",
      envId: "school",
      envName: "School",
      levelNumber: 3,
      difficulty: "Medium",
      image: "/images/hazard/school/level3.jpg",
      totalHazards: 5,
      hazards: [
        {
          id: "school-l3-burner",
          name: "Cracked Bunsen Burner Hose",
          category: "Gas Fire",
          risk: "Gas ignition flash",
          explanation: "Brittle rubber tubing supplying gas burners can leak fuel, creating flash fire hazards.",
          safetyTip: "Replace gas tubing every school term and test for leaks with soapy water.",
          x: 42,
          y: 52,
          width: 12,
          height: 12
        },
        {
          id: "school-l3-lock",
          name: "Padlocked Emergency Exit",
          category: "Evacuation Trap",
          risk: "Entrapment during emergency",
          explanation: "Chaining or padlocking emergency doors is a dangerous violation of safety codes.",
          safetyTip: "Emergency exit doors must remain unlocked from the inside at all times during school hours.",
          x: 90,
          y: 48,
          width: 12,
          height: 28
        },
        {
          id: "school-l3-slide",
          name: "Rusted Playground Slide Edge",
          category: "Playground Hazard",
          risk: "Laceration and infection",
          explanation: "Jagged rusty edges on metal play equipment cause skin cuts and tetanus risks.",
          safetyTip: "Conduct weekly playground safety inspections and sand/paint rusted metal surfaces.",
          x: 25,
          y: 60,
          width: 18,
          height: 18
        },
        {
          id: "school-l3-ceiling",
          name: "Loose Ceiling Tile",
          category: "Overhead Impact",
          risk: "Falling debris impact",
          explanation: "Water-damaged acoustic ceiling tiles can loosen and fall onto desks below.",
          safetyTip: "Replace water-stained ceiling tiles promptly and repair roof leaks.",
          x: 55,
          y: 18,
          width: 16,
          height: 12
        },
        {
          id: "school-l3-cord",
          name: "Frayed Extension Cord",
          category: "Electrical",
          risk: "Trip and shock risk",
          explanation: "Power cables taped across classroom floors wear down under heavy foot traffic.",
          safetyTip: "Use heavy-duty rubber cable ramps to protect temporary electrical cords.",
          x: 68,
          y: 76,
          width: 16,
          height: 10
        }
      ]
    },
    {
      id: "school-level-4",
      envId: "school",
      envName: "School",
      levelNumber: 4,
      difficulty: "Hard",
      image: "/images/hazard/school/level4.jpg",
      totalHazards: 6,
      hazards: [
        {
          id: "school-l4-eyewash",
          name: "Blocked Eye Wash Station",
          category: "First Aid Obstruction",
          risk: "Delayed chemical eye flush",
          explanation: "Mop buckets placed in front of emergency eye wash stations prevent rapid chemical flushing.",
          safetyTip: "Keep a 3-foot radius around emergency eyewash stations clear at all times.",
          x: 18,
          y: 55,
          width: 14,
          height: 20
        },
        {
          id: "school-l4-acids",
          name: "Incompatible Acids Stored Together",
          category: "Chemical Reaction",
          risk: "Explosive vapor release",
          explanation: "Storing nitric acid next to organic solvents can cause violent chemical reactions.",
          safetyTip: "Segregate chemicals by compatibility group in dedicated hazard cabinets.",
          x: 32,
          y: 42,
          width: 12,
          height: 16
        },
        {
          id: "school-l4-bleacher",
          name: "Bleacher Lock Pin Dislodged",
          category: "Structural Safety",
          risk: "Gym bleacher collapse",
          explanation: "Dislodged locking pins on retractable seating can cause bleachers to fold unexpectedly.",
          safetyTip: "Inspect gym bleacher locking pins before every sports event or assembly.",
          x: 75,
          y: 65,
          width: 14,
          height: 16
        },
        {
          id: "school-l4-strips",
          name: "Daisy-Chained Power Strips",
          category: "Circuit Overload",
          risk: "Electrical fire",
          explanation: "Plugging extension cords into other extension cords creates dangerous resistance heating.",
          safetyTip: "Never daisy-chain power strips. Request additional wall outlets if needed.",
          x: 52,
          y: 72,
          width: 16,
          height: 12
        },
        {
          id: "school-l4-hoop",
          name: "Unanchored Basketball Frame",
          category: "Tip Hazard",
          risk: "Crush injury",
          explanation: "Portable basketball hoops without counterweights can tip over when players dunk.",
          safetyTip: "Fill portable hoop base units with sand or water according to manufacturer guidelines.",
          x: 85,
          y: 35,
          width: 18,
          height: 30
        },
        {
          id: "school-l4-dark",
          name: "Unlit Emergency Stairwell",
          category: "Illumination Failure",
          risk: "Stairway fall during blackout",
          explanation: "Burnt-out emergency stairwell bulbs prevent safe evacuation during power outages.",
          safetyTip: "Check emergency battery backup lighting monthly in all stairwells.",
          x: 10,
          y: 80,
          width: 16,
          height: 12
        }
      ]
    },
    {
      id: "school-level-5",
      envId: "school",
      envName: "School",
      levelNumber: 5,
      difficulty: "Expert",
      image: "/images/hazard/school/level5.jpg",
      totalHazards: 7,
      hazards: [
        {
          id: "school-l5-hood",
          name: "Broken Fume Hood Exhaust",
          category: "Laboratory Safety",
          risk: "Toxic vapor build-up",
          explanation: "A malfunctioning laboratory exhaust fan lets dangerous chemical fumes linger in the lab.",
          safetyTip: "Verify fume hood airflow indicators before handling volatile compounds.",
          x: 22,
          y: 25,
          width: 16,
          height: 18
        },
        {
          id: "school-l5-ground",
          name: "Damaged Grounding Rod Outside",
          category: "Electrical Safety",
          risk: "Lightning surge damage",
          explanation: "Severed grounding wires outside school buildings leave electrical systems vulnerable to lightning.",
          safetyTip: "Inspect building electrical earthing connections annually.",
          x: 88,
          y: 75,
          width: 10,
          height: 16
        },
        {
          id: "school-l5-proj",
          name: "Loose Ceiling Projector Mount",
          category: "Overhead Fall",
          risk: "Impact injury",
          explanation: "Heavy overhead classroom projectors can drop if mounting bolts vibrate loose.",
          safetyTip: "Install safety backup steel cables on all overhead projectors and speakers.",
          x: 50,
          y: 12,
          width: 14,
          height: 14
        },
        {
          id: "school-l5-unlabeled",
          name: "Unlabeled Chemical Bottle",
          category: "Hazard Communication",
          risk: "Mistaken chemical mixing",
          explanation: "Reagents kept in plain bottles without GHS labels invite hazardous mistakes.",
          safetyTip: "Clearly label every chemical container with name, concentration, and warning pictograms.",
          x: 38,
          y: 46,
          width: 10,
          height: 14
        },
        {
          id: "school-l5-stage",
          name: "Steep Stage Steps Missing Rail",
          category: "Fall Hazard",
          risk: "Auditorium fall",
          explanation: "Unrailed auditorium stage steps lead to falls during school performances.",
          safetyTip: "Attach sturdy handrails on both sides of all stage access steps.",
          x: 70,
          y: 58,
          width: 16,
          height: 22
        },
        {
          id: "school-l5-water",
          name: "Water Dripping on Light Fixture",
          category: "Electrical Fire",
          risk: "Short circuit fire",
          explanation: "Roof leaks dripping into fluorescent light ballasts create short circuit hazards.",
          safetyTip: "De-energize wet light fixtures immediately and repair roof leaks.",
          x: 60,
          y: 20,
          width: 12,
          height: 14
        },
        {
          id: "school-l5-alarm",
          name: "Blocked Fire Alarm Call Point",
          category: "Emergency Signal",
          risk: "Delayed alarm activation",
          explanation: "Posters hanging over manual pull stations obscure emergency fire alarms.",
          safetyTip: "Keep manual fire alarm pull stations fully visible and unobstructed.",
          x: 82,
          y: 42,
          width: 10,
          height: 16
        }
      ]
    }
  ],

  office: [
    {
      id: "office-level-1",
      envId: "office",
      envName: "Office",
      levelNumber: 1,
      difficulty: "Easy",
      image: "/images/hazard/office/level1.jpg",
      totalHazards: 3,
      hazards: [
        {
          id: "office-l1-drawer",
          name: "Open Top Filing Drawer",
          category: "Impact / Tip Hazard",
          risk: "Cabinet tip & head bump",
          explanation: "Leaving upper filing cabinet drawers fully extended can tip the cabinet forward.",
          safetyTip: "Close filing drawers immediately after retrieving files.",
          x: 21,
          y: 47,
          width: 18,
          height: 20
        },
        {
          id: "office-l1-cables",
          name: "Tangled Floor Cables",
          category: "Trip Hazard",
          risk: "Tripping fall",
          explanation: "Loose power and Ethernet cords cluttering under-desk walkways catch feet.",
          safetyTip: "Bundle desk wires inside spiral wrap or cable trays under desk surfaces.",
          x: 49,
          y: 74,
          width: 22,
          height: 22
        },
        {
          id: "office-l1-coffee",
          name: "Coffee Pot on Hot Plate",
          category: "Burn / Fire Hazard",
          risk: "Overheating glass fracture & smoke",
          explanation: "Leaving a coffee carafe warming on an empty burner can shatter glass and burn plastic.",
          safetyTip: "Turn off coffee warmers as soon as the pot is empty.",
          x: 81,
          y: 58,
          width: 12,
          height: 18
        }
      ]
    },
    {
      id: "office-level-2",
      envId: "office",
      envName: "Office",
      levelNumber: 2,
      difficulty: "Easy-Medium",
      image: "/images/hazard/office/level2.jpg",
      totalHazards: 4,
      hazards: [
        {
          id: "office-l2-heater",
          name: "Space Heater Plugs Extension",
          category: "Electrical Overload",
          risk: "Thermal melting fire",
          explanation: "High-draw space heaters overload thin office extension cables, causing insulation fires.",
          safetyTip: "Plug space heaters directly into grounded wall sockets.",
          x: 30,
          y: 70,
          width: 14,
          height: 14
        },
        {
          id: "office-l2-archives",
          name: "Archives Under Breaker",
          category: "Combustible Storage",
          risk: "Electrical arc fire ignition",
          explanation: "Paper archives stacked under electrical distribution boxes ignite if sparks occur.",
          safetyTip: "Keep a 3-foot clearance around all electrical sub-panels.",
          x: 85,
          y: 50,
          width: 16,
          height: 25
        },
        {
          id: "office-l2-chair",
          name: "Broken Chair Hydraulic Lift",
          category: "Ergonomic Safety",
          risk: "Sudden seat drop fall",
          explanation: "Defective pneumatic office chair cylinders can suddenly drop under occupant weight.",
          safetyTip: "Tag and remove damaged ergonomic chairs from service.",
          x: 15,
          y: 62,
          width: 14,
          height: 18
        },
        {
          id: "office-l2-hose",
          name: "Stuck Fire Hose Cabinet Latch",
          category: "Emergency Equipment",
          risk: "Delayed firefighting",
          explanation: "Rusted or painted-shut fire hose cabinets prevent quick access during fires.",
          safetyTip: "Inspect emergency hose cabinets quarterly to ensure smooth latch operation.",
          x: 65,
          y: 35,
          width: 12,
          height: 18
        }
      ]
    },
    {
      id: "office-level-3",
      envId: "office",
      envName: "Office",
      levelNumber: 3,
      difficulty: "Medium",
      image: "/images/hazard/office/level3.jpg",
      totalHazards: 5,
      hazards: [
        {
          id: "office-l3-shredder",
          name: "Jammed Plugged Shredder",
          category: "Mechanical Entanglement",
          risk: "Severe finger injury",
          explanation: "Clearing paper jams while the shredder is energized risks accidental blade engagement.",
          safetyTip: "Unplug paper shredders before clearing jammed paper or servicing blades.",
          x: 25,
          y: 55,
          width: 12,
          height: 16
        },
        {
          id: "office-l3-router",
          name: "Severed Router Power Cable",
          category: "Electrical Shock",
          risk: "Live short circuit",
          explanation: "Network cables with stripped outer jackets expose live copper wires.",
          safetyTip: "Replace damaged IT power adapters immediately.",
          x: 45,
          y: 68,
          width: 14,
          height: 12
        },
        {
          id: "office-l3-glass",
          name: "Unmarked Glass Door",
          category: "Physical Collision",
          risk: "Impact shatter injury",
          explanation: "Clear full-length glass partition doors without eye-level decals cause walk-in collisions.",
          safetyTip: "Apply frosted safety decals or warning stripes at eye level on clear glass doors.",
          x: 70,
          y: 40,
          width: 16,
          height: 35
        },
        {
          id: "office-l3-printer",
          name: "Unstable Printer Cart",
          category: "Tip Hazard",
          risk: "Heavy equipment drop",
          explanation: "Heavy multi-function copiers placed on narrow unweighted carts can tip during movement.",
          safetyTip: "Place heavy office printing machinery on wide, stable credenzas.",
          x: 88,
          y: 58,
          width: 14,
          height: 22
        },
        {
          id: "office-l3-ac",
          name: "AC Dripping Near Server Racks",
          category: "Water-Electrical",
          risk: "Short circuit & equipment loss",
          explanation: "Condensed water leaking from ceiling AC units over server racks risks short circuits.",
          safetyTip: "Install drip trays under AC units located in IT equipment rooms.",
          x: 10,
          y: 30,
          width: 15,
          height: 22
        }
      ]
    },
    {
      id: "office-level-4",
      envId: "office",
      envName: "Office",
      levelNumber: 4,
      difficulty: "Hard",
      image: "/images/hazard/office/level4.jpg",
      totalHazards: 6,
      hazards: [
        {
          id: "office-l4-bin",
          name: "Overweighted Storage Bin",
          category: "Falling Hazard",
          risk: "Overhead load drop",
          explanation: "Stacking heavy paper reams inside flimsy overhead plastic bins deforms shelf frames.",
          safetyTip: "Observe weight rating limits on all overhead office storage shelves.",
          x: 40,
          y: 20,
          width: 18,
          height: 16
        },
        {
          id: "office-l4-exit",
          name: "Exit Sign Light Out",
          category: "Evacuation Guidance",
          risk: "Disorientation in smoke",
          explanation: "Unlit emergency exit signs make escape routes difficult to find in dark or smoky hallways.",
          safetyTip: "Test emergency exit sign light bulbs and battery backups monthly.",
          x: 90,
          y: 15,
          width: 10,
          height: 12
        },
        {
          id: "office-l4-plant",
          name: "Plant Leaking onto Power Outlet",
          category: "Water Electrical",
          risk: "Electrocution / fire",
          explanation: "Watering potted office plants located directly above floor sockets risks water entry into live pins.",
          safetyTip: "Keep potted plants away from electrical outlets and computer towers.",
          x: 60,
          y: 52,
          width: 12,
          height: 16
        },
        {
          id: "office-l4-carpet",
          name: "Loose Carpet Seam",
          category: "Trip Hazard",
          risk: "Pedestrian fall",
          explanation: "Curled or frayed carpet tile seams in high-traffic corridors catch shoe soles.",
          safetyTip: "Re-glue or tape down loose carpet tile corners immediately.",
          x: 50,
          y: 82,
          width: 16,
          height: 10
        },
        {
          id: "office-l4-solvent",
          name: "Solvent Stored in Desk Drawer",
          category: "Flammable Storage",
          risk: "Vapor fire ignition",
          explanation: "Keeping acetone or whiteboard cleaning solvents inside closed unvented office desks creates vapor traps.",
          safetyTip: "Store flammable cleaning solvents in dedicated metal safety cabinets.",
          x: 20,
          y: 60,
          width: 12,
          height: 16
        },
        {
          id: "office-l4-micro",
          name: "Damaged Breakroom Microwave Latch",
          category: "Radiation Leak",
          risk: "Microwave energy leakage",
          explanation: "Operating breakroom microwaves with cracked door seals or broken safety interlocks lets RF energy leak.",
          safetyTip: "Do not operate microwaves with broken door latches or cracked glass windows.",
          x: 75,
          y: 38,
          width: 12,
          height: 14
        }
      ]
    },
    {
      id: "office-level-5",
      envId: "office",
      envName: "Office",
      levelNumber: 5,
      difficulty: "Expert",
      image: "/images/hazard/office/level5.jpg",
      totalHazards: 7,
      hazards: [
        {
          id: "office-l5-ups",
          name: "Swollen UPS Backup Battery",
          category: "Battery Safety",
          risk: "Thermal runaway & acid leak",
          explanation: "Swollen lead-acid batteries inside uninterruptible power supplies threaten fire or gas explosion.",
          safetyTip: "Replace bulging UPS backup batteries immediately and recycle them properly.",
          x: 15,
          y: 72,
          width: 14,
          height: 16
        },
        {
          id: "office-l5-sprinkler",
          name: "Sprinkler Head Obstructed",
          category: "Fire Suppression",
          risk: "Ineffective water spray",
          explanation: "Boxes stacked within 18 inches of ceiling fire sprinklers block effective water distribution.",
          safetyTip: "Maintain a minimum 18-inch clearance below all fire sprinkler heads.",
          x: 50,
          y: 10,
          width: 12,
          height: 12
        },
        {
          id: "office-l5-conduit",
          name: "Exposed Conduit Wires",
          category: "Electrical Safety",
          risk: "Shock hazard",
          explanation: "Flexible metallic wiring conduit pulled out of wall junction boxes exposes insulated wires to chafing.",
          safetyTip: "Secure wiring conduits with proper box connectors and strain reliefs.",
          x: 35,
          y: 30,
          width: 12,
          height: 14
        },
        {
          id: "office-l5-light",
          name: "Unsecured Suspended Light Frame",
          category: "Seismic Hazard",
          risk: "Falling fixture overhead",
          explanation: "Troffer lights resting in suspended ceiling grids without independent safety tie wires drop during tremors.",
          safetyTip: "Attach independent ceiling support wires to all recessed lighting fixtures.",
          x: 70,
          y: 14,
          width: 16,
          height: 14
        },
        {
          id: "office-l5-cutter",
          name: "Paper Cutter Safety Latch Off",
          category: "Sharp Blade",
          risk: "Amputation cut injury",
          explanation: "Guillotine paper cutter blades left unlatched in the raised position drop accidentally.",
          safetyTip: "Always lock paper cutter safety latches when the blade is not actively cutting.",
          x: 82,
          y: 52,
          width: 12,
          height: 16
        },
        {
          id: "office-l5-dust",
          name: "Dust Can Near Sunspot Window",
          category: "Pressurized Can",
          risk: "Over-pressurization burst",
          explanation: "Aerosol duster cans left in direct sunlight on windowsills overheat and burst.",
          safetyTip: "Store aerosol spray cans in cool shade away from windows and heaters.",
          x: 28,
          y: 48,
          width: 10,
          height: 14
        },
        {
          id: "office-l5-firstaid",
          name: "Empty First Aid Box",
          category: "Emergency Readiness",
          risk: "Delayed minor wound care",
          explanation: "Wall-mounted first aid kits missing bandages and antiseptic delay treatment for office cuts.",
          safetyTip: "Restock first aid supplies monthly and log item expiration dates.",
          x: 90,
          y: 45,
          width: 10,
          height: 16
        }
      ]
    }
  ],

  outdoors: [
    {
      id: "outdoors-level-1",
      envId: "outdoors",
      envName: "Outdoors",
      levelNumber: 1,
      difficulty: "Easy",
      image: "/images/hazard/outdoors/level1.jpg",
      totalHazards: 3,
      hazards: [
        {
          id: "outdoors-l1-wire",
          name: "Downed Electrical Power Line",
          category: "Electrocution Hazard",
          risk: "Fatal high-voltage shock",
          explanation: "Power cables fallen onto wet roads electrify surrounding puddles.",
          safetyTip: "Stay at least 30 feet back from downed power lines and report them to emergency authorities immediately.",
          x: 35,
          y: 70,
          width: 22,
          height: 14
        },
        {
          id: "outdoors-l1-manhole",
          name: "Open Uncovered Manhole Shaft",
          category: "Fall Hazard",
          risk: "Fatal fall & drowning hazard",
          explanation: "Missing storm drain covers on public streets lead to severe falls for pedestrians.",
          safetyTip: "Place high-visibility barricades around open manholes and report missing covers.",
          x: 68,
          y: 62,
          width: 16,
          height: 18
        },
        {
          id: "outdoors-l1-branch",
          name: "Loose Fallen Tree Branch",
          category: "Overhead Fall",
          risk: "Head impact & crush",
          explanation: "Storm-damaged tree limbs hanging loosely over footpaths can drop without warning.",
          safetyTip: "Avoid walking under damaged tree canopies after heavy windstorms.",
          x: 20,
          y: 22,
          width: 25,
          height: 18
        }
      ]
    },
    {
      id: "outdoors-level-2",
      envId: "outdoors",
      envName: "Outdoors",
      levelNumber: 2,
      difficulty: "Easy-Medium",
      image: "/images/hazard/outdoors/level2.jpg",
      totalHazards: 4,
      hazards: [
        {
          id: "outdoors-l2-trench",
          name: "Unfenced Construction Trench",
          category: "Cave-in Danger",
          risk: "Excavation collapse fall",
          explanation: "Deep road excavation trenches left unbarricaded invite accidental falls.",
          safetyTip: "Erect solid high-visibility perimeter fencing around all open utility trenches.",
          x: 45,
          y: 65,
          width: 24,
          height: 20
        },
        {
          id: "outdoors-l2-scaffold",
          name: "Corroded Metal Scaffold Joint",
          category: "Structural Collapse",
          risk: "Scaffolding drop",
          explanation: "Rusted coupler pins on building scaffolding can snap under worker load.",
          safetyTip: "Inspect metal scaffolding components for rust before erecting work platforms.",
          x: 80,
          y: 40,
          width: 14,
          height: 25
        },
        {
          id: "outdoors-l2-algae",
          name: "Slippery Algae Footbridge",
          category: "Slip / Water Fall",
          risk: "Water submersion slip",
          explanation: "Algae growth on damp wooden footbridges becomes as slippery as ice.",
          safetyTip: "Scrub footbridge surfaces regularly or install non-slip wire mesh treads.",
          x: 22,
          y: 75,
          width: 22,
          height: 14
        },
        {
          id: "outdoors-l2-spray",
          name: "Unmarked Pesticide Tank",
          category: "Chemical Safety",
          risk: "Toxic chemical contact",
          explanation: "Agricultural chemical tanks left unattended without warning labels present poisoning risks.",
          safetyTip: "Lock agricultural chemical spray equipment when unattended.",
          x: 12,
          y: 50,
          width: 12,
          height: 16
        }
      ]
    },
    {
      id: "outdoors-level-3",
      envId: "outdoors",
      envName: "Outdoors",
      levelNumber: 3,
      difficulty: "Medium",
      image: "/images/hazard/outdoors/level3.jpg",
      totalHazards: 5,
      hazards: [
        {
          id: "outdoors-l3-pole",
          name: "Leaning Utility Pole",
          category: "Structural Safety",
          risk: "Overhead pole collapse",
          explanation: "Utility poles with rotted bases leaning past 15 degrees threaten immediate collapse.",
          safetyTip: "Report tilting utility poles to power utility companies right away.",
          x: 75,
          y: 30,
          width: 14,
          height: 35
        },
        {
          id: "outdoors-l3-drain",
          name: "Broken Storm Drain Grate",
          category: "Pedestrian Hazard",
          risk: "Ankle fracture trap",
          explanation: "Cracked iron storm drain bars create openings that catch feet or bicycle tires.",
          safetyTip: "Replace damaged storm drain grates with ADA-compliant narrow-gap covers.",
          x: 40,
          y: 78,
          width: 16,
          height: 12
        },
        {
          id: "outdoors-l3-sign",
          name: "Overgrown Gas Sign",
          category: "Hazard Identification",
          risk: "Accidental pipeline damage",
          explanation: "Overgrown bushes hiding high-pressure gas line signs lead to accidental excavation strikes.",
          safetyTip: "Trim vegetation around underground utility warning markers.",
          x: 18,
          y: 55,
          width: 12,
          height: 16
        },
        {
          id: "outdoors-l3-rebar",
          name: "Sharp Protruding Rebar",
          category: "Impailment Hazard",
          risk: "Puncture / laceration",
          explanation: "Exposed steel rebar sticking out of broken concrete blocks poses puncture risks.",
          safetyTip: "Cap all exposed rebar ends with bright plastic mushroom caps.",
          x: 55,
          y: 58,
          width: 14,
          height: 14
        },
        {
          id: "outdoors-l3-trash",
          name: "Unsecured Trash Near Dry Brush",
          category: "Wildfire Hazard",
          risk: "Fire spread",
          explanation: "Overflowing litter bins next to dry summer grasses easily ignite from discarded embers.",
          safetyTip: "Clear dry brush within 10 feet of public park waste bins.",
          x: 88,
          y: 68,
          width: 12,
          height: 18
        }
      ]
    },
    {
      id: "outdoors-level-4",
      envId: "outdoors",
      envName: "Outdoors",
      levelNumber: 4,
      difficulty: "Hard",
      image: "/images/hazard/outdoors/level4.jpg",
      totalHazards: 6,
      hazards: [
        {
          id: "outdoors-l4-fuel",
          name: "Leaking Generator Fuel Line",
          category: "Flammable Liquid",
          risk: "Explosive fuel fire",
          explanation: "Diesel fuel dripping from construction generators onto hot exhaust pipes can ignite.",
          safetyTip: "Place spill containment trays under portable generators and repair fuel leaks.",
          x: 28,
          y: 62,
          width: 16,
          height: 18
        },
        {
          id: "outdoors-l4-billboard",
          name: "Unanchored Billboard Frame",
          category: "Wind Impact",
          risk: "Wind-borne debris crash",
          explanation: "Loose metal signboards can detach in high storm winds and crash onto traffic.",
          safetyTip: "Inspect outdoor advertising sign anchors before monsoon storm seasons.",
          x: 60,
          y: 22,
          width: 22,
          height: 25
        },
        {
          id: "outdoors-l4-embankment",
          name: "Steep Unrailed Embankment",
          category: "Fall Hazard",
          risk: "Vehicle / pedestrian rollover",
          explanation: "Roadways bordering steep canal drop-offs without guardrails invite vehicle rollovers.",
          safetyTip: "Install W-beam steel guardrails along steep roadside drop-offs.",
          x: 10,
          y: 70,
          width: 20,
          height: 18
        },
        {
          id: "outdoors-l4-substation",
          name: "Substation Water Leak",
          category: "High Voltage Arc",
          risk: "Substation arc flash",
          explanation: "Pools of water encroaching under high-voltage transformer gates create ground arc paths.",
          safetyTip: "Maintain gravel drainage channels around electrical substations.",
          x: 82,
          y: 55,
          width: 14,
          height: 20
        },
        {
          id: "outdoors-l4-plank",
          name: "Decayed Wooden Bridge Plank",
          category: "Structural Fall",
          risk: "Foot breaking drop",
          explanation: "Rotten wooden bridge planks can break under pedestrian weight.",
          safetyTip: "Replace rotted timber bridge decking with treated hardwood or composite boards.",
          x: 45,
          y: 80,
          width: 16,
          height: 10
        },
        {
          id: "outdoors-l4-rocks",
          name: "Unstable Rock Pile Above Path",
          category: "Geological Slide",
          risk: "Rockfall impact",
          explanation: "Loose boulders resting on steep clay slopes above walking trails can slide after rain.",
          safetyTip: "Install rockfall catchment netting on unstable roadside cliff faces.",
          x: 20,
          y: 35,
          width: 18,
          height: 20
        }
      ]
    },
    {
      id: "outdoors-level-5",
      envId: "outdoors",
      envName: "Outdoors",
      levelNumber: 5,
      difficulty: "Expert",
      image: "/images/hazard/outdoors/level5.jpg",
      totalHazards: 7,
      hazards: [
        {
          id: "outdoors-l5-culvert",
          name: "Blocked Storm Culvert",
          category: "Flash Flood",
          risk: "Street inundation",
          explanation: "Debris clogging storm drain culverts causes sudden street flooding during downpours.",
          safetyTip: "Clear trash and leaves from storm culvert entrances before rainy seasons.",
          x: 15,
          y: 65,
          width: 18,
          height: 20
        },
        {
          id: "outdoors-l5-crane",
          name: "Frayed Crane Cable",
          category: "Rigging Failure",
          risk: "Catastrophic load drop",
          explanation: "Kinked or frayed steel wire ropes on construction cranes can snap under heavy loads.",
          safetyTip: "Perform daily visual inspections of crane hoisting cables before rigging loads.",
          x: 50,
          y: 25,
          width: 14,
          height: 22
        },
        {
          id: "outdoors-l5-pipe",
          name: "Steam Pipe Joint Leak",
          category: "Thermal Vapor",
          risk: "Scalding steam burn",
          explanation: "High-pressure municipal steam pipes leaking at flange joints cause severe skin burns.",
          safetyTip: "Maintain safety distance from leaking steam vents and report utility leaks.",
          x: 72,
          y: 42,
          width: 14,
          height: 18
        },
        {
          id: "outdoors-l5-stop",
          name: "Missing Stop Sign",
          category: "Traffic Safety",
          risk: "Vehicle collision",
          explanation: "A fallen or stolen stop sign at a blind intersection leads to broadside vehicle crashes.",
          safetyTip: "Report missing or damaged traffic control signs to city transit authorities.",
          x: 88,
          y: 38,
          width: 10,
          height: 20
        },
        {
          id: "outdoors-l5-drum",
          name: "Chemical Drum Sun Exposure",
          category: "Pressure Expansion",
          risk: "Chemical drum burst",
          explanation: "Sealed metal drums containing volatile solvents swell and burst when exposed to hot sun.",
          safetyTip: "Store chemical drums under shaded, ventilated storage sheds.",
          x: 32,
          y: 52,
          width: 14,
          height: 18
        },
        {
          id: "outdoors-l5-guardrail",
          name: "Corroded Guardrail Anchor",
          category: "Roadway Safety",
          risk: "Barrier penetration crash",
          explanation: "Rusted mounting bolts on highway crash barriers fail to absorb vehicle impact energy.",
          safetyTip: "Inspect highway barrier anchor points for salt corrosion.",
          x: 40,
          y: 75,
          width: 18,
          height: 14
        },
        {
          id: "outdoors-l5-solar",
          name: "Loose Roof Solar Panel",
          category: "Falling Debris",
          risk: "High-altitude impact",
          explanation: "Unsecured rooftop solar mounting clamps can let wind tear panels off roofs.",
          safetyTip: "Torque solar array mounting bolts to specification and check after high winds.",
          x: 68,
          y: 15,
          width: 16,
          height: 14
        }
      ]
    }
  ]
};
