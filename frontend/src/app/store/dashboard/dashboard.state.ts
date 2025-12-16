export interface DashboardState {
  stats: {
    roomStats: any;
    bookingStats: any;
    paymentStats: any;
    customerStats: any;
    todayStats: any;
  } | null;
  loading: boolean;
  error: string | null;
  recentBookings: any[];
  recentPayments: any[];
  recentCustomers: any[];
}

export const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
  recentBookings: [],
  recentPayments: [],
  recentCustomers: []
};