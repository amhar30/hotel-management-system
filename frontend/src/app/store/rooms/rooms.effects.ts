import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import * as RoomsActions from './rooms.actions';
import { Room } from '../../models/room.model';

@Injectable()
export class RoomsEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);

  loadRooms$ = createEffect(() => 
    this.actions$.pipe(
      ofType(RoomsActions.loadRooms),
      mergeMap((action) => {
        const filters = action.filters || {};
        return this.api.get<{success: boolean, data: any}>('/rooms', filters).pipe(
          map(response => {
            const rooms = response.data?.data || response.data || [];
            return RoomsActions.loadRoomsSuccess({ rooms });
          }),
          catchError(error => 
            of(RoomsActions.loadRoomsFailure({ error: error.message }))
          )
        );
      })
    )
  );

  loadRoom$ = createEffect(() => 
    this.actions$.pipe(
      ofType(RoomsActions.loadRoom),
      mergeMap(({ id }) =>
        this.api.get<{success: boolean, data: Room}>(`/rooms/${id}`).pipe(
          map(response => 
            RoomsActions.loadRoomSuccess({ room: response.data })
          ),
          catchError(error => 
            of(RoomsActions.loadRoomFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createRoom$ = createEffect(() => 
    this.actions$.pipe(
      ofType(RoomsActions.createRoom),
      mergeMap(({ room }) =>
        this.api.post<{success: boolean, data: Room}>('/rooms', room).pipe(
          map(response => 
            RoomsActions.createRoomSuccess({ room: response.data })
          ),
          catchError(error => 
            of(RoomsActions.createRoomFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateRoom$ = createEffect(() => 
    this.actions$.pipe(
      ofType(RoomsActions.updateRoom),
      mergeMap(({ id, room }) =>
        this.api.put<{success: boolean, data: Room}>(`/rooms/${id}`, room).pipe(
          map(response => 
            RoomsActions.updateRoomSuccess({ room: response.data })
          ),
          catchError(error => 
            of(RoomsActions.updateRoomFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteRoom$ = createEffect(() => 
    this.actions$.pipe(
      ofType(RoomsActions.deleteRoom),
      mergeMap(({ id }) =>
        this.api.delete<{success: boolean}>(`/rooms/${id}`).pipe(
          map(() => 
            RoomsActions.deleteRoomSuccess({ id })
          ),
          catchError(error => 
            of(RoomsActions.deleteRoomFailure({ error: error.message }))
          )
        )
      )
    )
  );
}