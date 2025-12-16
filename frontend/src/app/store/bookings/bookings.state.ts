import { Booking } from '../../models/booking.model';

export interface BookingsState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  selectedBooking: Booking | null;
  filters: {
    status: string;
    search: string;
    from_date: string;
    to_date: string;
  };
}

export const initialState: BookingsState = {
  bookings: [],
  loading: false,
  error: null,
  selectedBooking: null,
  filters: {
    status: '',
    search: '',
    from_date: '',
    to_date: ''
  }
};