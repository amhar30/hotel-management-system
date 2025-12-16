import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingsState } from './bookings.state';

export const selectBookingsState = createFeatureSelector<BookingsState>('bookings');

export const selectAllBookings = createSelector(
  selectBookingsState,
  (state) => state.bookings
);

export const selectBookingsLoading = createSelector(
  selectBookingsState,
  (state) => state.loading
);

export const selectBookingsError = createSelector(
  selectBookingsState,
  (state) => state.error
);

export const selectSelectedBooking = createSelector(
  selectBookingsState,
  (state) => state.selectedBooking
);

export const selectBookingFilters = createSelector(
  selectBookingsState,
  (state) => state.filters
);

export const selectFilteredBookings = createSelector(
  selectAllBookings,
  selectBookingFilters,
  (bookings, filters) => {
    return bookings.filter(booking => {
      // Filter by status
      if (filters.status && booking.status !== filters.status) {
        return false;
      }
      
      // Filter by date range
      if (filters.from_date && new Date(booking.check_in_date) < new Date(filters.from_date)) {
        return false;
      }
      
      if (filters.to_date && new Date(booking.check_out_date) > new Date(filters.to_date)) {
        return false;
      }
      
      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const customerName = booking.customer?.name?.toLowerCase() || '';
        const customerEmail = booking.customer?.email?.toLowerCase() || '';
        const roomNumber = booking.room?.room_number?.toLowerCase() || '';
        
        return customerName.includes(searchLower) || 
               customerEmail.includes(searchLower) || 
               roomNumber.includes(searchLower);
      }
      
      return true;
    });
  }
);

export const selectBookingsByStatus = (status: string) => createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.status === status)
);

export const selectPendingBookings = createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.status === 'pending')
);

export const selectConfirmedBookings = createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.status === 'confirmed')
);

export const selectCheckedInBookings = createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.status === 'checked_in')
);

export const selectCompletedBookings = createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.status === 'completed')
);

export const selectCancelledBookings = createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.status === 'cancelled')
);

export const selectTodaysCheckIns = createSelector(
  selectAllBookings,
  (bookings) => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.check_in_date === today && 
      (booking.status === 'confirmed' || booking.status === 'checked_in')
    );
  }
);

export const selectTodaysCheckOuts = createSelector(
  selectAllBookings,
  (bookings) => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.check_out_date === today && 
      (booking.status === 'checked_in' || booking.status === 'checked_out')
    );
  }
);

export const selectUpcomingBookings = createSelector(
  selectAllBookings,
  (bookings) => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.check_in_date >= today && 
      (booking.status === 'pending' || booking.status === 'confirmed')
    );
  }
);

export const selectBookingStatistics = createSelector(
  selectAllBookings,
  (bookings) => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const checkedIn = bookings.filter(b => b.status === 'checked_in').length;
    const checkedOut = bookings.filter(b => b.status === 'checked_out').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, booking) => sum + booking.total_amount, 0);
    
    const avgStayDuration = bookings.length > 0 
      ? bookings.reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / bookings.length
      : 0;

    return {
      total,
      pending,
      confirmed,
      checkedIn,
      checkedOut,
      completed,
      cancelled,
      totalRevenue,
      avgStayDuration: Math.round(avgStayDuration * 100) / 100,
      occupancyRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
);

export const selectBookingsByCustomer = (customerId: number) => createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.customer_id === customerId)
);

export const selectBookingsByRoom = (roomId: number) => createSelector(
  selectAllBookings,
  (bookings) => bookings.filter(booking => booking.room_id === roomId)
);