import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.state';

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

export const selectDashboardStats = createSelector(
  selectDashboardState,
  (state) => state.stats
);

export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (state) => state.loading
);

export const selectDashboardError = createSelector(
  selectDashboardState,
  (state) => state.error
);

export const selectRecentBookings = createSelector(
  selectDashboardState,
  (state) => state.recentBookings
);

export const selectRecentPayments = createSelector(
  selectDashboardState,
  (state) => state.recentPayments
);

export const selectRecentCustomers = createSelector(
  selectDashboardState,
  (state) => state.recentCustomers
);

// Specific stats selectors
export const selectRoomStats = createSelector(
  selectDashboardStats,
  (stats) => stats?.roomStats
);

export const selectBookingStats = createSelector(
  selectDashboardStats,
  (stats) => stats?.bookingStats
);

export const selectPaymentStats = createSelector(
  selectDashboardStats,
  (stats) => stats?.paymentStats
);

export const selectCustomerStats = createSelector(
  selectDashboardStats,
  (stats) => stats?.customerStats
);

export const selectTodayStats = createSelector(
  selectDashboardStats,
  (stats) => stats?.todayStats
);