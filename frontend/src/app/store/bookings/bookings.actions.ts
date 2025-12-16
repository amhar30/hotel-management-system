import { createAction, props } from '@ngrx/store';
import { Booking, BookingRequest } from '../../models/booking.model';

// Load Bookings
export const loadBookings = createAction(
  '[Bookings] Load Bookings',
  props<{ filters?: any }>()
);

export const loadBookingsSuccess = createAction(
  '[Bookings] Load Bookings Success',
  props<{ bookings: Booking[] }>()
);

export const loadBookingsFailure = createAction(
  '[Bookings] Load Bookings Failure',
  props<{ error: string }>()
);

// Create Booking
export const createBooking = createAction(
  '[Bookings] Create Booking',
  props<{ booking: BookingRequest }>()
);

export const createBookingSuccess = createAction(
  '[Bookings] Create Booking Success',
  props<{ booking: Booking }>()
);

export const createBookingFailure = createAction(
  '[Bookings] Create Booking Failure',
  props<{ error: string }>()
);

// Update Booking Status
export const updateBookingStatus = createAction(
  '[Bookings] Update Booking Status',
  props<{ id: number; status: string; notes?: string }>()
);

export const updateBookingStatusSuccess = createAction(
  '[Bookings] Update Booking Status Success',
  props<{ booking: Booking }>()
);

export const updateBookingStatusFailure = createAction(
  '[Bookings] Update Booking Status Failure',
  props<{ error: string }>()
);

// Cancel Booking
export const cancelBooking = createAction(
  '[Bookings] Cancel Booking',
  props<{ id: number }>()
);

export const cancelBookingSuccess = createAction(
  '[Bookings] Cancel Booking Success',
  props<{ booking: Booking }>()
);

export const cancelBookingFailure = createAction(
  '[Bookings] Cancel Booking Failure',
  props<{ error: string }>()
);

// Update Filters
export const updateBookingFilters = createAction(
  '[Bookings] Update Filters',
  props<{ filters: any }>()
);

// Clear Selected Booking
export const clearSelectedBooking = createAction(
  '[Bookings] Clear Selected Booking'
);