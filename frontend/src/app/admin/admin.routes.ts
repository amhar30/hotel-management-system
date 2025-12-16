import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';


export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('../dashboard/dashboard/dashboard').then(m => m.DashboardComponent),
    data: { isAdmin: true }
  },
  {
    path: 'rooms',
    loadComponent: () => import('../rooms/rooms-list/rooms-list').then(m => m.RoomsListComponent)
  }, 
  {
    path: 'bookings',
    loadComponent: () => import('../bookings/bookings-list/bookings-list').then(m => m.BookingsListComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('../customers/customers-list/customers-list').then(m => m.CustomersListComponent)
  },
  {
    path: 'payments',
    loadComponent: () => import('../payments/payments-list/payments-list').then(m => m.PaymentsListComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('../reports/reports-dashboard/reports-dashboard').then(m => m.ReportsDashboardComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];