import { createReducer, on } from '@ngrx/store';
import { BookingsState, initialState } from './bookings.state';
import * as BookingsActions from './bookings.actions';

export const bookingsReducer = createReducer(
  initialState,

  // Load Bookings
  on(BookingsActions.loadBookings, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BookingsActions.loadBookingsSuccess, (state, { bookings }) => ({
    ...state,
    bookings,
    loading: false,
    error: null
  })),

  on(BookingsActions.loadBookingsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Booking
  on(BookingsActions.createBooking, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BookingsActions.createBookingSuccess, (state, { booking }) => ({
    ...state,
    bookings: [...state.bookings, booking],
    loading: false,
    error: null
  })),

  on(BookingsActions.createBookingFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Booking Status
  on(BookingsActions.updateBookingStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BookingsActions.updateBookingStatusSuccess, (state, { booking }) => ({
    ...state,
    bookings: state.bookings.map(b => b.id === booking.id ? booking : b),
    selectedBooking: state.selectedBooking?.id === booking.id ? booking : state.selectedBooking,
    loading: false,
    error: null
  })),

  on(BookingsActions.updateBookingStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Cancel Booking
  on(BookingsActions.cancelBooking, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(BookingsActions.cancelBookingSuccess, (state, { booking }) => ({
    ...state,
    bookings: state.bookings.map(b => b.id === booking.id ? booking : b),
    selectedBooking: state.selectedBooking?.id === booking.id ? booking : state.selectedBooking,
    loading: false,
    error: null
  })),

  on(BookingsActions.cancelBookingFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Filters
  on(BookingsActions.updateBookingFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),

  // Clear Selected Booking
  on(BookingsActions.clearSelectedBooking, (state) => ({
    ...state,
    selectedBooking: null
  }))
);