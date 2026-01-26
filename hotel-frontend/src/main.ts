import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    // Configures HTTP client with the custom Auth Interceptor
    provideHttpClient(withInterceptors([authInterceptor])),
    // Enables browser animations
    provideAnimations()
  ]
}).catch((err) => console.error(err));