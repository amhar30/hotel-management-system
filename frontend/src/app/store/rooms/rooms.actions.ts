import { createAction, props } from '@ngrx/store';
import { Room } from '../../models/room.model';

// --- Load Rooms (List) ---
export const loadRooms = createAction(
  '[Rooms] Load Rooms',
  props<{ filters?: any }>()
);

export const loadRoomsSuccess = createAction(
  '[Rooms] Load Rooms Success',
  props<{ rooms: Room[] }>()
);

export const loadRoomsFailure = createAction(
  '[Rooms] Load Rooms Failure',
  props<{ error: string }>()
);

// --- Load Single Room (Detail) ---
export const loadRoom = createAction(
  '[Rooms] Load Room',
  props<{ id: number }>()
);

export const loadRoomSuccess = createAction(
  '[Rooms] Load Room Success',
  props<{ room: Room }>()
);

export const loadRoomFailure = createAction(
  '[Rooms] Load Room Failure',
  props<{ error: string }>()
);

// --- Create Room ---
export const createRoom = createAction(
  '[Rooms] Create Room',
  props<{ room: Omit<Room, 'id'> }>()
);

export const createRoomSuccess = createAction(
  '[Rooms] Create Room Success',
  props<{ room: Room }>()
);

export const createRoomFailure = createAction(
  '[Rooms] Create Room Failure',
  props<{ error: string }>()
);

// --- Update Room ---
export const updateRoom = createAction(
  '[Rooms] Update Room',
  props<{ id: number; room: Partial<Room> }>()
);

export const updateRoomSuccess = createAction(
  '[Rooms] Update Room Success',
  props<{ room: Room }>()
);

export const updateRoomFailure = createAction(
  '[Rooms] Update Room Failure',
  props<{ error: string }>()
);

// --- Delete Room ---
export const deleteRoom = createAction(
  '[Rooms] Delete Room',
  props<{ id: number }>()
);

export const deleteRoomSuccess = createAction(
  '[Rooms] Delete Room Success',
  props<{ id: number }>()
);

export const deleteRoomFailure = createAction(
  '[Rooms] Delete Room Failure',
  props<{ error: string }>()
);

// --- UI/Filter Actions ---
export const updateRoomFilters = createAction(
  '[Rooms] Update Filters',
  props<{ filters: any }>()
);

export const clearSelectedRoom = createAction(
  '[Rooms] Clear Selected Room'
);