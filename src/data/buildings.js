export const BUILDING_TYPES = {
  HOSPITAL: 'hospital',
  SCHOOL: 'school',
  FIRE_STATION: 'fire_station',
  RESIDENTIAL: 'residential',
  EMERGENCY_CENTER: 'emergency_center',
  PARK: 'park',
  EVACUATION_ROAD: 'evacuation_road'
};

export const BUILDINGS_DATA = {
  [BUILDING_TYPES.HOSPITAL]: {
    type: BUILDING_TYPES.HOSPITAL,
    name: 'City General Hospital',
    icon: '🏥',
    priority: 'VERY HIGH',
    priorityScore: 100,
    color: '#ef4444',
    maxWaterTolerance: 20, // Max water depth before damage/threat
    description: 'Critical medical center. Flooding cuts off emergency medical access and risks patient evacuation.'
  },
  [BUILDING_TYPES.SCHOOL]: {
    type: BUILDING_TYPES.SCHOOL,
    name: 'Central High School',
    icon: '🏫',
    priority: 'HIGH',
    priorityScore: 75,
    color: '#f59e0b',
    maxWaterTolerance: 25,
    description: 'Serves as primary community shelter during disaster emergencies.'
  },
  [BUILDING_TYPES.FIRE_STATION]: {
    type: BUILDING_TYPES.FIRE_STATION,
    name: 'Fire & Rescue Station',
    icon: '🚒',
    priority: 'HIGH',
    priorityScore: 75,
    color: '#dc2626',
    maxWaterTolerance: 25,
    description: 'Base for emergency vehicles and rescue personnel.'
  },
  [BUILDING_TYPES.EMERGENCY_CENTER]: {
    type: BUILDING_TYPES.EMERGENCY_CENTER,
    name: 'Disaster Command Center',
    icon: '🏢',
    priority: 'VERY HIGH',
    priorityScore: 90,
    color: '#3b82f6',
    maxWaterTolerance: 20,
    description: 'Central nerve center for flood monitoring and rescue operations.'
  },
  [BUILDING_TYPES.RESIDENTIAL]: {
    type: BUILDING_TYPES.RESIDENTIAL,
    name: 'Residential Neighborhood',
    icon: '🏠',
    priority: 'MEDIUM',
    priorityScore: 50,
    color: '#10b981',
    maxWaterTolerance: 30,
    description: 'Homes and community dwellings vulnerable to low-lying flood inundation.'
  },
  [BUILDING_TYPES.EVACUATION_ROAD]: {
    type: BUILDING_TYPES.EVACUATION_ROAD,
    name: 'Main Evacuation Corridor',
    icon: '🛣️',
    priority: 'HIGH',
    priorityScore: 80,
    color: '#64748b',
    maxWaterTolerance: 35,
    description: 'Vital highway route for emergency vehicles and citizen evacuation.'
  },
  [BUILDING_TYPES.PARK]: {
    type: BUILDING_TYPES.PARK,
    name: 'Green Retention Park',
    icon: '🌳',
    priority: 'LOW',
    priorityScore: 10,
    color: '#22c55e',
    maxWaterTolerance: 80,
    description: 'Open green area naturally suited for holding runoff overflow.'
  }
};
