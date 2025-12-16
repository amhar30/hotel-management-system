import { Room } from '../../models/room.model';

export interface RoomsState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  selectedRoom: Room | null;
  filters: {
    status: string;
    type: string;
    search: string;
  };
}

export const initialState: RoomsState = {
  rooms: [],
  loading: false,
  error: null,
  selectedRoom: null,
  filters: {
    status: '',
    type: '',
    search: ''
  }
};