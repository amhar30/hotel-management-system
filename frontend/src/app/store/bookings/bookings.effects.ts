import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import * as BookingsActions from './bookings.actions';

@Injectable()
export class BookingsEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);

  loadBookings$ = createEffect(() => 
    this.actions$.pipe(
      ofType(BookingsActions.loadBookings),
      mergeMap((action) => {
        const filters = action.filters || {};
        return this.api.get<{success: boolean, data: any}>('/bookings', filters).pipe(
          map(response => 
            BookingsActions.loadBookingsSuccess({ 
              bookings: response.data?.data || response.data || [] 
            })
          ),
          catchError(error => 
            of(BookingsActions.loadBookingsFailure({ error: error.message }))
          )
        );
      })
    )
  );

  createBooking$ = createEffect(() => 
    this.actions$.pipe(
      ofType(BookingsActions.createBooking),
      mergeMap(({ booking }) =>
        this.api.post<{success: boolean, data: any}>('/bookings', booking).pipe(
          map(response => 
            BookingsActions.createBookingSuccess({ booking: response.data })
          ),
          catchError(error => 
            of(BookingsActions.createBookingFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateBookingStatus$ = createEffect(() => 
    this.actions$.pipe(
      ofType(BookingsActions.updateBookingStatus),
      mergeMap(({ id, status, notes }) =>
        this.api.put<{success: boolean, data: any}>(`/bookings/${id}/status`, { status, notes }).pipe(
          map(response => 
            BookingsActions.updateBookingStatusSuccess({ booking: response.data })
          ),
          catchError(error => 
            of(BookingsActions.updateBookingStatusFailure({ error: error.message }))
          )
        )
      )
    )
  );

  cancelBooking$ = createEffect(() => 
    this.actions$.pipe(
      ofType(BookingsActions.cancelBooking),
      mergeMap(({ id }) =>
        this.api.post<{success: boolean, data: any}>(`/bookings/${id}/cancel`, {}).pipe(
          map(response => 
            BookingsActions.cancelBookingSuccess({ booking: response.data })
          ),
          catchError(error => 
            of(BookingsActions.cancelBookingFailure({ error: error.message }))
          )
        )
      )
    )
  );
}