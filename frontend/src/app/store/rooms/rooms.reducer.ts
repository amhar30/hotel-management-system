import { createReducer, on } from '@ngrx/store';
import { RoomsState, initialState } from './rooms.state';
import * as RoomsActions from './rooms.actions';

export const roomsReducer = createReducer(
  initialState,

  // Load Rooms
  on(RoomsActions.loadRooms, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RoomsActions.loadRoomsSuccess, (state, { rooms }) => ({
    ...state,
    rooms,
    loading: false,
    error: null
  })),

  on(RoomsActions.loadRoomsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Room
  on(RoomsActions.loadRoom, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RoomsActions.loadRoomSuccess, (state, { room }) => ({
    ...state,
    selectedRoom: room,
    loading: false,
    error: null
  })),

  on(RoomsActions.loadRoomFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Room
  on(RoomsActions.createRoom, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RoomsActions.createRoomSuccess, (state, { room }) => ({
    ...state,
    rooms: [...state.rooms, room],
    loading: false,
    error: null
  })),

  on(RoomsActions.createRoomFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Room
  on(RoomsActions.updateRoom, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RoomsActions.updateRoomSuccess, (state, { room }) => ({
    ...state,
    rooms: state.rooms.map(r => r.id === room.id ? room : r),
    selectedRoom: state.selectedRoom?.id === room.id ? room : state.selectedRoom,
    loading: false,
    error: null
  })),

  on(RoomsActions.updateRoomFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Room
  on(RoomsActions.deleteRoom, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RoomsActions.deleteRoomSuccess, (state, { id }) => ({
    ...state,
    rooms: state.rooms.filter(room => room.id !== id),
    selectedRoom: state.selectedRoom?.id === id ? null : state.selectedRoom,
    loading: false,
    error: null
  })),

  on(RoomsActions.deleteRoomFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Filters
  on(RoomsActions.updateRoomFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),

  // Clear Selected Room
  on(RoomsActions.clearSelectedRoom, (state) => ({
    ...state,
    selectedRoom: null
  }))
);