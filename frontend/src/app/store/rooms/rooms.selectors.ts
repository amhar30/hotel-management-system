import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoomsState } from './rooms.state';

export const selectRoomsState = createFeatureSelector<RoomsState>('rooms');

export const selectAllRooms = createSelector(
  selectRoomsState,
  (state) => state.rooms
);

export const selectRoomsLoading = createSelector(
  selectRoomsState,
  (state) => state.loading
);

export const selectRoomsError = createSelector(
  selectRoomsState,
  (state) => state.error
);

export const selectSelectedRoom = createSelector(
  selectRoomsState,
  (state) => state.selectedRoom
);

export const selectRoomFilters = createSelector(
  selectRoomsState,
  (state) => state.filters
);

export const selectAvailableRooms = createSelector(
  selectAllRooms,
  (rooms) => rooms.filter(room => room.status === 'available')
);

export const selectBookedRooms = createSelector(
  selectAllRooms,
  (rooms) => rooms.filter(room => room.status === 'booked')
);

export const selectRoomsByType = (type: string) => createSelector(
  selectAllRooms,
  (rooms) => rooms.filter(room => room.type === type)
);

export const selectFilteredRooms = createSelector(
  selectAllRooms,
  selectRoomFilters,
  (rooms, filters) => {
    return rooms.filter(room => {
      // Filter by status
      if (filters.status && room.status !== filters.status) {
        return false;
      }
      
      // Filter by type
      if (filters.type && room.type !== filters.type) {
        return false;
      }
      
      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return room.room_number.toLowerCase().includes(searchLower);
      }
      
      return true;
    });
  }
);