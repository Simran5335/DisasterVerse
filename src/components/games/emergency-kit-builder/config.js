export const ITEMS_CONFIG = [
  // ESSENTIAL FIRST AID & EMERGENCY SUPPLIES
  { 
    id: 'bandages', 
    name: 'Adhesive Bandages', 
    icon: '🩹',
    category: 'essential',
    description: 'Assorted sterile plasters for minor cuts, scrapes, and blisters.', 
    isEssential: true, 
    explanation: 'Adhesive bandages cover minor wounds, stop light bleeding, and shield against dirt and bacteria.' 
  },
  { 
    id: 'gauze', 
    name: 'Sterile Gauze Rolls', 
    icon: '🧻',
    category: 'essential',
    description: 'Essential for dressing larger wounds and controlling severe bleeding.', 
    isEssential: true, 
    explanation: 'Sterile gauze rolls provide absorbent padding and pressure over large wounds to stop bleeding.' 
  },
  { 
    id: 'antiseptic', 
    name: 'Antiseptic Wipes', 
    icon: '🧼',
    category: 'essential',
    description: 'Disinfects wounds and surrounding skin safely without water.', 
    isEssential: true, 
    explanation: 'Antiseptic wipes clean dirt and pathogens from around cuts to prevent dangerous wound infections.' 
  },
  { 
    id: 'tape', 
    name: 'Medical Tape', 
    icon: '🩹',
    category: 'essential',
    description: 'Secures gauze pads, dressings, and splints firmly in place.', 
    isEssential: true, 
    explanation: 'Medical tape ensures wound dressings stay firmly positioned during movement or evacuation.' 
  },
  { 
    id: 'scissors', 
    name: 'Medical Scissors', 
    icon: '✂️',
    category: 'essential',
    description: 'Safely cuts medical tape, gauze, clothing, or emergency bandages.', 
    isEssential: true, 
    explanation: 'Blunt-tip medical scissors let you quickly trim bandages or cut away clothing around an injury.' 
  },
  { 
    id: 'gloves', 
    name: 'Disposable Gloves', 
    icon: '🧤',
    category: 'essential',
    description: 'Protects both rescuer and patient from cross-contamination.', 
    isEssential: true, 
    explanation: 'Nitrile or latex gloves keep medical procedures sanitary and protect against bodily fluid exposure.' 
  },
  { 
    id: 'thermometer', 
    name: 'Digital Thermometer', 
    icon: '🌡️',
    category: 'essential',
    description: 'Accurately checks body temperature to monitor fever or hypothermia.', 
    isEssential: true, 
    explanation: 'A thermometer helps detect fever or heat exhaustion early so proper cooling or care can begin.' 
  },
  { 
    id: 'cold-pack', 
    name: 'Instant Cold Pack', 
    icon: '🧊',
    category: 'essential',
    description: 'Squeezable ice pack to reduce swelling from sprains and bruises.', 
    isEssential: true, 
    explanation: 'Instant chemical cold packs require no freezer and reduce inflammation and pain from acute sprains.' 
  },
  { 
    id: 'tweezers', 
    name: 'Medical Tweezers', 
    icon: '🔍',
    category: 'essential',
    description: 'Safely extracts splinters, glass fragments, or stingers from skin.', 
    isEssential: true, 
    explanation: 'Precision tweezers allow safe removal of foreign objects stuck in skin before infection sets in.' 
  },
  { 
    id: 'sanitizer', 
    name: 'Hand Sanitizer', 
    icon: '🧴',
    category: 'essential',
    description: 'Kills germs on hands when clean running water is unavailable.', 
    isEssential: true, 
    explanation: 'Alcohol-based hand sanitizer cleans hands before treating wounds in disaster scenarios.' 
  },
  { 
    id: 'cpr-card', 
    name: 'First Aid Manual Card', 
    icon: '📋',
    category: 'essential',
    description: 'Step-by-step quick guide for CPR, choking, and wound care.', 
    isEssential: true, 
    explanation: 'Clear illustrated emergency guides help non-professionals deliver accurate first-aid under stress.' 
  },
  { 
    id: 'torch', 
    name: 'LED Flashlight', 
    icon: '🔦',
    category: 'essential',
    description: 'Compact light source for treating injuries in dark power outages.', 
    isEssential: true, 
    explanation: 'A bright flashlight is essential to examine wounds clearly when power or daylight is lost.' 
  },
  { 
    id: 'water', 
    name: 'Water (3-Day Supply)', 
    icon: '💧',
    category: 'essential',
    description: 'Essential for hydration and clean wound irrigation.', 
    isEssential: true, 
    explanation: 'Clean water is crucial for hydration and flushing debris out of open wounds.' 
  },
  { 
    id: 'medicines', 
    name: 'Prescription Medicines', 
    icon: '💊',
    category: 'essential',
    description: 'Personal prescription medications and pain relief tablets.', 
    isEssential: true, 
    explanation: 'A backup supply of vital medications prevents life-threatening disruption of ongoing health treatments.' 
  },

  // UNNECESSARY / DISTRACTOR COMPONENTS
  { 
    id: 'toy-bear', 
    name: 'Plush Teddy Bear', 
    icon: '🧸',
    category: 'distractor',
    description: 'Cuddly stuffed toy for comfort during playtime.', 
    isEssential: false, 
    explanation: 'While comforting, bulky plush toys consume critical space needed for medical first-aid supplies.' 
  },
  { 
    id: 'candy', 
    name: 'Chocolate & Candy', 
    icon: '🍬',
    category: 'distractor',
    description: 'Sweet sugary treats and chocolate bars.', 
    isEssential: false, 
    explanation: 'Sugary sweets melt, attract insects, and do not provide balanced emergency nutrition or medical aid.' 
  },
  { 
    id: 'toy-car', 
    name: 'Toy Racing Car', 
    icon: '🏎️',
    category: 'distractor',
    description: 'Miniature plastic toy car for entertainment.', 
    isEssential: false, 
    explanation: 'Plastic toys offer zero emergency or medical utility and waste precious kit storage slots.' 
  },
  { 
    id: 'makeup', 
    name: 'Lipstick & Makeup', 
    icon: '💄',
    category: 'distractor',
    description: 'Cosmetic beauty items and lip gloss.', 
    isEssential: false, 
    explanation: 'Cosmetics provide no health or safety benefit in a medical emergency kit.' 
  },
  { 
    id: 'stickers', 
    name: 'Decorative Stickers', 
    icon: '🎨',
    category: 'distractor',
    description: 'Colorful art stickers and craft labels.', 
    isEssential: false, 
    explanation: 'Decorative stickers take up space and cannot seal wounds or treat injuries.' 
  },
  { 
    id: 'console', 
    name: 'Gaming Console', 
    icon: '🎮',
    category: 'distractor',
    description: 'Battery-draining handheld video game player.', 
    isEssential: false, 
    explanation: 'Gaming devices drain power, add weight, and distract from emergency safety procedures.' 
  },
  { 
    id: 'sunglasses', 
    name: 'Fashion Sunglasses', 
    icon: '🕶️',
    category: 'distractor',
    description: 'Trendy dark sunglasses accessory.', 
    isEssential: false, 
    explanation: 'Fashion eyewear is non-essential and fragile compared to crucial medical equipment.' 
  },
  { 
    id: 'keychain', 
    name: 'Random Keychains', 
    icon: '🔑',
    category: 'distractor',
    description: 'Junk metal key rings and decorative charms.', 
    isEssential: false, 
    explanation: 'Heavy keychains clutter the first aid tray without offering any medical aid.' 
  },
  { 
    id: 'decor', 
    name: 'Ceramic Flower Vase', 
    icon: '🏺',
    category: 'distractor',
    description: 'Heavy, fragile ceramic decorative vase.', 
    isEssential: false, 
    explanation: 'Fragile ceramics break easily during disasters, creating dangerous sharp shards.' 
  }
];

export const MAX_KIT_CAPACITY = 10;
