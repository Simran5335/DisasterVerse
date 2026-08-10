export const schoolHazards = [
    {
        id: "school-exit",
        name: "Blocked Emergency Exit",
        category: "Emergency Access",
        x: 15,
        y: 50,
        width: 10,
        height: 20,
        risk: "Entrapment / Evacuation Delay",
        explanation:
            "Desks and boxes stacked in front of the emergency exit will block students and staff trying to escape during a fire or earthquake.",
        safetyTip:
            "Always keep exit doors and school hallways clear of stored items."
    },
    {
        id: "school-socket",
        name: "Unsafe Electrical Socket",
        category: "Electrical Hazard",
        x: 80,
        y: 70,
        width: 8,
        height: 8,
        risk: "Electrical Shock",
        explanation:
            "An exposed, damaged classroom wall outlet poses a severe risk of shock or electrocution, especially to younger students.",
        safetyTip:
            "Cover unused sockets with safety plugs and report broken outlets to maintenance immediately."
    },
    {
        id: "school-wet-floor",
        name: "Wet Floor Without Warning Sign",
        category: "Trip & Fall Hazard",
        x: 45,
        y: 75,
        width: 15,
        height: 10,
        risk: "Slip and Injury",
        explanation:
            "A wet hallway floor from recent cleaning or a leak can easily lead to serious slips, falls, and injuries in high-traffic student areas.",
        safetyTip:
            "Always place a visible 'Caution: Wet Floor' warning sign until the area is dry."
    },
    {
        id: "school-chemical",
        name: "Unsafe Science Lab Storage",
        category: "Chemical Safety",
        x: 65,
        y: 45,
        width: 12,
        height: 15,
        risk: "Hazardous Chemical Exposure / Fire",
        explanation:
            "Leaving chemical bottles unlocked in the laboratory allows unauthorized student access and risks toxic spills or reactive fires.",
        safetyTip:
            "Keep all science chemicals in locked cabinets designated for hazardous materials."
    },
    {
        id: "school-passage",
        name: "Obstructed Main Passage",
        category: "Safety Obstruction",
        x: 30,
        y: 60,
        width: 14,
        height: 12,
        risk: "Trip Hazard in Evacuation",
        explanation:
            "Backpacks and chairs left in classroom walkways create hazards that can trip students during emergency drills.",
        safetyTip:
            "Hang backpacks on designated hooks and keep aisles clear of loose chairs."
    }
];
