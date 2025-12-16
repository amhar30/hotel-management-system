import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

// Debug: Check if services are available
console.log('App Config:', appConfig);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Bootstrap Error:', err);
    if (err.message.includes('Cannot read properties of undefined')) {
      console.error('Likely a service injection issue. Check providers in app.config.ts');
    }
  });