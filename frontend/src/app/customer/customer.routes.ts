import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard/dashboard/dashboard').then(m => m.DashboardComponent),
    data: { isCustomer: true }
  },
  {
    path: 'bookings',
    loadComponent: () => import('../bookings/my-bookings/my-bookings').then(m => m.MyBookingsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('../customers/customer-profile/customer-profile').then(m => m.CustomerProfileComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];