import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { environment } from '../environments/environment';

// Import reducers
import { roomsReducer } from './store/rooms/rooms.reducer';
import { bookingsReducer } from './store/bookings/bookings.reducer';
import { dashboardReducer } from './store/dashboard/dashboard.reducer';

// Import effects
import { RoomsEffects } from './store/rooms/rooms.effects';
import { BookingsEffects } from './store/bookings/bookings.effects';
import { DashboardEffects } from './store/dashboard/dashboard.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideClientHydration(),
    
    // NgRx Store
    provideStore({
      rooms: roomsReducer,
      bookings: bookingsReducer,
      dashboard: dashboardReducer
    }),
    
    // NgRx Effects - Make sure effects are provided
    provideEffects([RoomsEffects, BookingsEffects, DashboardEffects]),
    
    // NgRx DevTools
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    })
  ]
};