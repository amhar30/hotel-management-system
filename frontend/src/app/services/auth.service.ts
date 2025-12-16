import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthUser, User, Customer } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Load user from localStorage
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
  }

  // Login
  login(email: string, password: string, userType: 'user' | 'customer'): Observable<any> {
    return this.api.post<AuthUser>('/login', {
      email,
      password,
      user_type: userType
    }).pipe(
      tap(response => {
        if (response.token) {
          // Store user and token
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  // Register customer
  register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }): Observable<any> {
    return this.api.post<AuthUser>('/register', data).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response));
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  // Get current user
  getCurrentUser(): Observable<any> {
    return this.api.get('/user');
  }

  // Update user profile
  updateProfile(data: any): Observable<any> {
    if (this.isCustomer()) {
      return this.api.put('/customer/profile', data);
    } else {
      // For staff/admin, profile update endpoint would be different
      return this.api.put('/user/profile', data);
    }
  }

  // Logout
  logout(): void {
    this.api.post('/logout', {}).subscribe({
      next: () => {
        this.clearAuth();
      },
      error: () => {
        this.clearAuth();
      }
    });
  }

  // Clear auth data
  clearAuth(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
  }

  // Get current user value
  getCurrentUserValue(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'admin';
  }

  // Check if user is staff
  isStaff(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'staff';
  }

  // Check if user is customer
  isCustomer(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'customer';
  }

  // Check if user is admin or staff
  isAdminOrStaff(): boolean {
    return this.isAdmin() || this.isStaff();
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get user role
  getUserRole(): string {
    const user = this.getCurrentUserValue();
    return user?.role || '';
  }

  // Get user type
  getUserType(): string {
    const user = this.getCurrentUserValue();
    return user?.user_type || '';
  }

  // Check if user can access route based on role
  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getUserRole();
    return allowedRoles.includes(userRole);
  }
}