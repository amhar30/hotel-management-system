import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard, roleGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes for admin/staff
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard(['admin', 'staff'])],
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  
  // Protected routes for customers
  {
    path: 'customer/dashboard',
    canActivate: [authGuard, roleGuard(['customer'])],
    loadComponent: () => import('./components/customer-dashboard/customer-dashboard').then(m => m.CustomerDashboardComponent)
  },
  
  // Fallback route
  { path: '**', redirectTo: '/login' }
];