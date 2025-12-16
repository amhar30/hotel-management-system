import { createAction, props } from '@ngrx/store';

// Load Dashboard Stats
export const loadDashboardStats = createAction(
  '[Dashboard] Load Dashboard Stats'
);

export const loadDashboardStatsSuccess = createAction(
  '[Dashboard] Load Dashboard Stats Success',
  props<{ 
    stats: any;
    recentBookings: any[];
    recentPayments: any[];
    recentCustomers: any[];
  }>()
);

export const loadDashboardStatsFailure = createAction(
  '[Dashboard] Load Dashboard Stats Failure',
  props<{ error: string }>()
);

// Load Customer Dashboard Stats
export const loadCustomerDashboardStats = createAction(
  '[Dashboard] Load Customer Dashboard Stats'
);

export const loadCustomerDashboardStatsSuccess = createAction(
  '[Dashboard] Load Customer Dashboard Stats Success',
  props<{ 
    stats: any;
    upcomingBookings: any[];
    recentBookings: any[];
    currentStay: any;
  }>()
);

export const loadCustomerDashboardStatsFailure = createAction(
  '[Dashboard] Load Customer Dashboard Stats Failure',
  props<{ error: string }>()
);