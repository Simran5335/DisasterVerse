// 3D Building Layout Definition for Smoke Vision
export const ROOM_TYPES = {
  CLASSROOM_204: 'CLASSROOM_204',
  STAFF_ROOM: 'STAFF_ROOM',
  COMPUTER_ROOM: 'COMPUTER_ROOM',
  STORAGE_ROOM: 'STORAGE_ROOM',
  MAIN_CORRIDOR: 'MAIN_CORRIDOR',
  STAIRCASE: 'STAIRCASE',
  LOBBY: 'LOBBY',
  EXIT_A: 'EXIT_A',
  EXIT_B: 'EXIT_B'
};

export class BuildingLayout {
  static getLayout() {
    return {
      rooms: [
        { id: 'r1', type: ROOM_TYPES.CLASSROOM_204, name: 'Classroom 204 (Start)', bounds: { x: 2, z: 2, w: 6, d: 5 }, color: '#38bdf8' },
        { id: 'r2', type: ROOM_TYPES.STAFF_ROOM, name: 'Staff Room', bounds: { x: 10, z: 2, w: 5, d: 5 }, color: '#f59e0b' },
        { id: 'r3', type: ROOM_TYPES.COMPUTER_ROOM, name: 'Computer Lab', bounds: { x: 2, z: 10, w: 6, d: 5 }, color: '#a855f7' },
        { id: 'r4', type: ROOM_TYPES.STORAGE_ROOM, name: 'Storage Room', bounds: { x: 10, z: 10, w: 5, d: 5 }, color: '#64748b' },
        { id: 'r5', type: ROOM_TYPES.MAIN_CORRIDOR, name: 'Main Corridor', bounds: { x: 2, z: 7, w: 13, d: 3 }, color: '#334155' },
        { id: 'r6', type: ROOM_TYPES.STAIRCASE, name: 'Evacuation Staircase', bounds: { x: 16, z: 5, w: 4, d: 6 }, color: '#22c55e' },
        { id: 'r7', type: ROOM_TYPES.LOBBY, name: 'Ground Floor Lobby', bounds: { x: 16, z: 12, w: 6, d: 6 }, color: '#0284c7' }
      ],
      doors: [
        { id: 'd1', fromRoom: 'r1', toRoom: 'r5', x: 5, z: 7, tempState: 'COOL', label: 'Door 204-A (Main)' },
        { id: 'd2', fromRoom: 'r1', toRoom: 'r3', x: 2, z: 8, tempState: 'WARM', label: 'Side Door' },
        { id: 'd3', fromRoom: 'r2', toRoom: 'r5', x: 12, z: 7, tempState: 'VERY_HOT', label: 'Staff Room Door' },
        { id: 'd4', fromRoom: 'r3', toRoom: 'r5', x: 5, z: 10, tempState: 'COOL', label: 'Computer Lab Door' },
        { id: 'd5', fromRoom: 'r5', toRoom: 'r6', x: 15, z: 7, tempState: 'COOL', label: 'Staircase Entrance Door' },
        { id: 'd6', fromRoom: 'r6', toRoom: 'r7', x: 18, z: 11, tempState: 'COOL', label: 'Lobby Exit Door' }
      ],
      exits: [
        { id: 'exit_a', name: 'Primary Exit A (Courtyard)', x: 19, z: 18, isBlocked: false, isPrimary: true },
        { id: 'exit_b', name: 'Secondary Emergency Exit B', x: 22, z: 14, isBlocked: false, isPrimary: false }
      ],
      npcs: [
        { id: 'npc_1', name: 'Panicking Student (Leo)', room: 'r5', x: 9, z: 8, status: 'HELP_NEEDED', dialog: 'Help! Which way is safe?' },
        { id: 'npc_2', name: 'Wheelchair User (Sam)', room: 'r7', x: 17, z: 14, status: 'HELP_NEEDED', dialog: 'The main ramp is clear!' }
      ],
      extinguishers: [
        { id: 'ext_1', room: 'r5', x: 7, z: 7.5, isSmallFireNearby: true, used: false },
        { id: 'ext_2', room: 'r7', x: 16.5, z: 13, isSmallFireNearby: false, used: false }
      ]
    };
  }
}
