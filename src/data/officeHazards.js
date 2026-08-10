export const officeHazards = [
    {
        id: "office-overload",
        name: "Overloaded Power Extension",
        category: "Electrical Hazard",
        x: 75,
        y: 70,
        width: 10,
        height: 10,
        risk: "Electrical Fire Risk",
        explanation:
            "Plugging high-draw office equipment (printers, space heaters) into a single daisy-chained extension cord causes overloading.",
        safetyTip:
            "Plug high-wattage appliances directly into wall outlets and use surge protectors."
    },
    {
        id: "office-cable",
        name: "Loose Walkway Cables",
        category: "Trip Hazard",
        x: 50,
        y: 80,
        width: 15,
        height: 6,
        risk: "Trip and Injury",
        explanation:
            "Loose ethernet or power cords running across common office corridors create severe trip hazards for moving employees.",
        safetyTip:
            "Use heavy-duty cord covers or route cables through walls or under desks."
    },
    {
        id: "office-extinguisher",
        name: "Blocked Fire Extinguisher",
        category: "Emergency Access",
        x: 20,
        y: 55,
        width: 8,
        height: 16,
        risk: "Delayed Fire Response",
        explanation:
            "Filing cabinets or storage boxes stacked in front of a fire extinguisher prevent quick access during a fire breakout.",
        safetyTip:
            "Maintain at least a 3-foot clear area around all fire safety equipment."
    },
    {
        id: "office-exit",
        name: "Blocked Fire Exit Route",
        category: "Emergency Access",
        x: 88,
        y: 48,
        width: 9,
        height: 22,
        risk: "Delayed Evacuation",
        explanation:
            "Office chairs, waste containers, or packages left in the emergency fire stairwell hallway delay evacuation.",
        safetyTip:
            "Keep emergency stairways and door paths completely clear of all items at all times."
    },
    {
        id: "office-workstation",
        name: "Ergonomically Unsafe Workstation",
        category: "Ergonomics / Safety",
        x: 35,
        y: 65,
        width: 12,
        height: 12,
        risk: "Repetitive Strain Injury / Muscle Strain",
        explanation:
            "An unadjusted chair, poorly positioned monitor, and dangling wires pose strain risks and accidental entanglement hazards.",
        safetyTip:
            "Adjust monitor to eye level, use an ergonomic chair, and keep under-desk wiring neat."
    }
];
