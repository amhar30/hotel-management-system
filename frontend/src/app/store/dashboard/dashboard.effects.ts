import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import * as DashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);

  loadDashboardStats$ = createEffect(() => 
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardStats),
      mergeMap(() =>
        this.api.get<{success: boolean, data: any}>('/dashboard/statistics').pipe(
          map(response => {
            const data = response.data;
            return DashboardActions.loadDashboardStatsSuccess({
              stats: {
                roomStats: data?.room_stats,
                bookingStats: data?.booking_stats,
                paymentStats: data?.payment_stats,
                customerStats: data?.customer_stats,
                todayStats: data?.today_stats
              },
              recentBookings: data?.recent_bookings || [],
              recentPayments: data?.recent_payments || [],
              recentCustomers: data?.recent_customers || []
            });
          }),
          catchError(error => 
            of(DashboardActions.loadDashboardStatsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  loadCustomerDashboardStats$ = createEffect(() => 
    this.actions$.pipe(
      ofType(DashboardActions.loadCustomerDashboardStats),
      mergeMap(() =>
        this.api.get<{success: boolean, data: any}>('/dashboard/statistics').pipe(
          map(response => {
            const data = response.data;
            return DashboardActions.loadCustomerDashboardStatsSuccess({
              stats: {
                roomStats: data?.room_stats,
                bookingStats: data?.booking_stats,
                paymentStats: data?.payment_stats,
                customerStats: data?.customer_stats,
                todayStats: data?.today_stats
              },
              upcomingBookings: data?.upcoming_bookings || [],
              recentBookings: data?.recent_bookings || [],
              currentStay: data?.current_stay || null
            });
          }),
          catchError(error => 
            of(DashboardActions.loadCustomerDashboardStatsFailure({ error: error.message }))
          )
        )
      )
    )
  );
}