import { createReducer, on } from '@ngrx/store';
import { DashboardState, initialState } from './dashboard.state';
import * as DashboardActions from './dashboard.actions';

export const dashboardReducer = createReducer(
  initialState,

  // Load Dashboard Stats
  on(DashboardActions.loadDashboardStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(DashboardActions.loadDashboardStatsSuccess, (state, { stats, recentBookings, recentPayments, recentCustomers }) => ({
    ...state,
    stats,
    recentBookings,
    recentPayments,
    recentCustomers,
    loading: false,
    error: null
  })),

  on(DashboardActions.loadDashboardStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Customer Dashboard Stats
  on(DashboardActions.loadCustomerDashboardStats, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(DashboardActions.loadCustomerDashboardStatsSuccess, (state, { stats, upcomingBookings, recentBookings, currentStay }) => ({
    ...state,
    stats,
    recentBookings,
    loading: false,
    error: null
  })),

  on(DashboardActions.loadCustomerDashboardStatsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);